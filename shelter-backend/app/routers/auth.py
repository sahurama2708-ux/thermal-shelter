import logging
import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.schemas.user import UserRead
from app.services import auth as auth_service
from app.services import oauth as oauth_service
from app.utils.responses import error, success
from app.utils.security import (
    TokenError,
    TokenType,
    create_access_token,
    create_refresh_token,
    decode_token,
)

logger = logging.getLogger("shelter.auth")
settings = get_settings()

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# In-memory OAuth state store: state -> True. Prevents CSRF on the OAuth
# callback. For multi-instance production deployments, back this with Redis.
_oauth_states: set[str] = set()


def _bad_request(code: str, message: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error(code, message))


def _issue_tokens(user: User) -> TokenResponse:
    access_token = create_access_token(user.id, user.email, user.provider)
    refresh_token = create_refresh_token(user.id, user.email, user.provider)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/register", response_model=None, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = auth_service.get_user_by_email(db, payload.email)
    if existing is not None:
        # Avoid confirming account existence in detail; generic message only.
        raise _bad_request("EMAIL_IN_USE", "Could not register with the provided details")

    user = auth_service.create_email_user(db, payload.email, payload.password, payload.name)
    tokens = _issue_tokens(user)
    return success(tokens)


@router.post("/login", response_model=None)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = auth_service.authenticate_email_user(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error("INVALID_CREDENTIALS", "Incorrect email or password"),
        )
    tokens = _issue_tokens(user)
    return success(tokens)


@router.post("/refresh", response_model=None)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    try:
        token_payload = decode_token(payload.refresh_token, TokenType.REFRESH)
    except TokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error("INVALID_REFRESH_TOKEN", str(exc)),
        ) from exc

    user = db.query(User).filter(User.id == token_payload.get("sub")).first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error("INVALID_REFRESH_TOKEN", "User not found or inactive"),
        )

    access_token = create_access_token(user.id, user.email, user.provider)
    return success(AccessTokenResponse(access_token=access_token))


@router.post("/logout", response_model=None)
def logout():
    # Stateless JWTs: logout is handled client-side by discarding tokens.
    # A production system would add refresh tokens to a denylist/store here.
    return success({"message": "Logged out"})


@router.get("/me", response_model=None)
def me(current_user: User = Depends(get_current_user)):
    return success(UserRead.model_validate(current_user))


# ---------------------------------------------------------------------------
# Google OAuth
# ---------------------------------------------------------------------------

@router.get("/google/login")
def google_login():
    if not settings.GOOGLE_CLIENT_ID:
        raise _bad_request("OAUTH_NOT_CONFIGURED", "Google OAuth is not configured")
    state = secrets.token_urlsafe(24)
    _oauth_states.add(state)
    url = oauth_service.build_google_authorize_url(state)
    return RedirectResponse(url)


@router.get("/google/callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state or state not in _oauth_states:
        raise _bad_request("OAUTH_STATE_INVALID", "Invalid OAuth state or missing code")
    _oauth_states.discard(state)

    try:
        profile = await oauth_service.fetch_google_user(code)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Google OAuth failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error("OAUTH_FAILED", "Failed to authenticate with Google"),
        ) from exc

    user = auth_service.find_or_create_oauth_user(
        db,
        provider="google",
        provider_user_id=profile["provider_user_id"],
        email=profile["email"],
        name=profile.get("name"),
        profile_picture=profile.get("profile_picture"),
    )
    tokens = _issue_tokens(user)
    redirect_url = f"{settings.FRONTEND_URL}/oauth/callback?access_token={tokens.access_token}&refresh_token={tokens.refresh_token}"
    return RedirectResponse(redirect_url)


# ---------------------------------------------------------------------------
# GitHub OAuth
# ---------------------------------------------------------------------------

@router.get("/github/login")
def github_login():
    if not settings.GITHUB_CLIENT_ID:
        raise _bad_request("OAUTH_NOT_CONFIGURED", "GitHub OAuth is not configured")
    state = secrets.token_urlsafe(24)
    _oauth_states.add(state)
    url = oauth_service.build_github_authorize_url(state)
    return RedirectResponse(url)


@router.get("/github/callback")
async def github_callback(request: Request, db: Session = Depends(get_db)):
    code = request.query_params.get("code")
    state = request.query_params.get("state")

    if not code or not state or state not in _oauth_states:
        raise _bad_request("OAUTH_STATE_INVALID", "Invalid OAuth state or missing code")
    _oauth_states.discard(state)

    try:
        profile = await oauth_service.fetch_github_user(code)
    except Exception as exc:  # noqa: BLE001
        logger.warning("GitHub OAuth failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error("OAUTH_FAILED", "Failed to authenticate with GitHub"),
        ) from exc

    user = auth_service.find_or_create_oauth_user(
        db,
        provider="github",
        provider_user_id=profile["provider_user_id"],
        email=profile["email"],
        name=profile.get("name"),
        profile_picture=profile.get("profile_picture"),
    )
    tokens = _issue_tokens(user)
    redirect_url = f"{settings.FRONTEND_URL}/oauth/callback?access_token={tokens.access_token}&refresh_token={tokens.refresh_token}"
    return RedirectResponse(redirect_url)
