import hashlib
import os
import secrets

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

USER_SESSION_COOKIE = "metis_user_session"
ADMIN_SESSION_COOKIE = "metis_admin_session"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_api_key_token() -> str:
    return f"metis_{secrets.token_urlsafe(24)}"


def mask_api_key_token(token: str) -> str:
    suffix = token[-4:] if len(token) >= 4 else token
    return f"metis_••••••••{suffix}"


def cookie_options() -> dict:
    env = os.environ.get("METIS_ENV", "development").lower()
    if env == "production":
        return {
            "httponly": True,
            "path": "/",
            "secure": True,
            "samesite": "strict",
        }
    return {
        "httponly": True,
        "path": "/",
        "secure": False,
        "samesite": "lax",
    }


def session_cookie_name(is_admin: bool) -> str:
    return ADMIN_SESSION_COOKIE if is_admin else USER_SESSION_COOKIE
