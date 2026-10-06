from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.security import hash_password, verify_password


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email.lower()).first()


def get_user_by_provider(db: Session, provider: str, provider_user_id: str) -> User | None:
    return (
        db.query(User)
        .filter(User.provider == provider, User.provider_user_id == provider_user_id)
        .first()
    )


def create_email_user(db: Session, email: str, password: str, name: str | None) -> User:
    user = User(
        email=email.lower(),
        name=name,
        provider="email",
        hashed_password=hash_password(password),
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_email_user(db: Session, email: str, password: str) -> User | None:
    user = get_user_by_email(db, email)
    if user is None or user.provider != "email" or not user.hashed_password:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


def find_or_create_oauth_user(
    db: Session,
    *,
    provider: str,
    provider_user_id: str,
    email: str,
    name: str | None,
    profile_picture: str | None,
) -> User:
    """
    Finds an existing user by (provider, provider_user_id) first, then falls
    back to matching by email (to link an OAuth login to an existing email
    account), and creates a new user only if neither match.
    """
    user = get_user_by_provider(db, provider, provider_user_id)
    if user is not None:
        return user

    user = get_user_by_email(db, email)
    if user is not None:
        # Link this provider to the existing account rather than creating a
        # duplicate. We do not overwrite an existing password-based account's
        # provider field to "google"/"github" blindly if it already has a
        # different OAuth provider; last-linked provider wins for provider_user_id
        # lookups going forward.
        user.provider_user_id = user.provider_user_id or provider_user_id
        user.name = user.name or name
        user.profile_picture = user.profile_picture or profile_picture
        db.commit()
        db.refresh(user)
        return user

    user = User(
        email=email.lower(),
        name=name,
        profile_picture=profile_picture,
        provider=provider,
        provider_user_id=provider_user_id,
        hashed_password=None,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
