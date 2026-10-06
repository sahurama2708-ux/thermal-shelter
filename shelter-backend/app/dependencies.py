from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.utils.security import TokenError, TokenType, decode_token

bearer_scheme = HTTPBearer(auto_error=False)


def _unauthorized(message: str) -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"success": False, "error": {"code": "UNAUTHENTICATED", "message": message}},
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise _unauthorized("Missing bearer token")

    try:
        payload = decode_token(credentials.credentials, TokenType.ACCESS)
    except TokenError as exc:
        raise _unauthorized(str(exc)) from exc

    user_id = payload.get("sub")
    if not user_id:
        raise _unauthorized("Token missing subject claim")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise _unauthorized("User not found")
    if not user.is_active:
        raise _unauthorized("User account is disabled")

    return user
