"""
Google and GitHub OAuth2 "authorization code" flow helpers, built on Authlib's
async OAuth client. No provider passwords or tokens are ever stored -
only email/name/profile_picture/provider_user_id are persisted, via
services.auth.find_or_create_oauth_user.
"""
from authlib.integrations.httpx_client import AsyncOAuth2Client

from app.config import get_settings

settings = get_settings()

GOOGLE_AUTHORIZE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
GOOGLE_SCOPE = "openid email profile"

GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_USER_URL = "https://api.github.com/user"
GITHUB_EMAILS_URL = "https://api.github.com/user/emails"
GITHUB_SCOPE = "read:user user:email"


def build_google_authorize_url(state: str) -> str:
    client = AsyncOAuth2Client(
        client_id=settings.GOOGLE_CLIENT_ID,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
        scope=GOOGLE_SCOPE,
    )
    url, _ = client.create_authorization_url(GOOGLE_AUTHORIZE_URL, state=state)
    return url


async def fetch_google_user(code: str) -> dict:
    client = AsyncOAuth2Client(
        client_id=settings.GOOGLE_CLIENT_ID,
        client_secret=settings.GOOGLE_CLIENT_SECRET,
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
    )
    token = await client.fetch_token(GOOGLE_TOKEN_URL, code=code, grant_type="authorization_code")
    client.token = token

    resp = await client.get(GOOGLE_USERINFO_URL)
    resp.raise_for_status()
    profile = resp.json()

    return {
        "provider_user_id": profile["sub"],
        "email": profile["email"],
        "name": profile.get("name"),
        "profile_picture": profile.get("picture"),
    }


def build_github_authorize_url(state: str) -> str:
    client = AsyncOAuth2Client(
        client_id=settings.GITHUB_CLIENT_ID,
        redirect_uri=settings.GITHUB_REDIRECT_URI,
        scope=GITHUB_SCOPE,
    )
    url, _ = client.create_authorization_url(GITHUB_AUTHORIZE_URL, state=state)
    return url


async def fetch_github_user(code: str) -> dict:
    client = AsyncOAuth2Client(
        client_id=settings.GITHUB_CLIENT_ID,
        client_secret=settings.GITHUB_CLIENT_SECRET,
        redirect_uri=settings.GITHUB_REDIRECT_URI,
    )
    token = await client.fetch_token(GITHUB_TOKEN_URL, code=code, grant_type="authorization_code")
    client.token = token

    user_resp = await client.get(GITHUB_USER_URL, headers={"Accept": "application/vnd.github+json"})
    user_resp.raise_for_status()
    profile = user_resp.json()

    email = profile.get("email")
    if not email:
        # GitHub only returns a public email if the user has one set; the
        # verified primary email needs the separate /user/emails endpoint.
        emails_resp = await client.get(GITHUB_EMAILS_URL, headers={"Accept": "application/vnd.github+json"})
        emails_resp.raise_for_status()
        emails = emails_resp.json()
        primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
        if primary is None:
            primary = next((e for e in emails if e.get("verified")), None)
        email = primary["email"] if primary else None

    if not email:
        raise ValueError("GitHub account has no accessible verified email address")

    return {
        "provider_user_id": str(profile["id"]),
        "email": email,
        "name": profile.get("name") or profile.get("login"),
        "profile_picture": profile.get("avatar_url"),
    }
