import os
import secrets

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_operator_session
from app.models import Session as SessionModel, User
from app.security import (
    OPERATOR_SESSION_COOKIE,
    cookie_options,
    generate_token,
    hash_password,
    hash_token,
)

router = APIRouter(tags=["operator"])

# Email env key paired with password env keys (first non-empty wins).
_CREDENTIAL_ENV_KEYS: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("APF_OPERATOR_EMAIL", ("APF_OPERATOR_PASSWORD", "APF_OPERATOR_PASSPHRASE")),
    ("APF_ADMIN_EMAIL", ("APF_ADMIN_PASSWORD", "APF_ADMIN_PASSPHRASE")),
)


class OperatorLoginBody(BaseModel):
    email: EmailStr
    password: str


class OperatorSessionResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str = "operator"


def _first_env(*keys: str) -> str:
    for key in keys:
        value = os.environ.get(key, "")
        if value:
            return value
    return ""


def _configured_credentials() -> list[tuple[str, str]]:
    pairs: list[tuple[str, str]] = []
    for email_key, password_keys in _CREDENTIAL_ENV_KEYS:
        email = os.environ.get(email_key, "").strip()
        password = _first_env(*password_keys)
        if email and password:
            pairs.append((email, password))
    return pairs


def _credentials_match(email: str, password: str) -> bool:
    normalized = email.strip().lower()
    for cfg_email, cfg_password in _configured_credentials():
        if normalized == cfg_email.strip().lower() and password == cfg_password:
            return True
    return False


def _get_or_create_operator_user(db: Session, email: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user is not None:
        return user
    user = User(
        email=email.strip(),
        name="Operator",
        password_hash=hash_password(secrets.token_urlsafe(16)),
        is_admin=False,
    )
    db.add(user)
    db.flush()
    return user


def _attach_operator_session(response: Response, user: User, db: Session) -> None:
    raw_token = generate_token()
    db.add(
        SessionModel(
            token_hash=hash_token(raw_token),
            user_id=user.id,
            kind="operator",
        )
    )
    db.commit()
    response.set_cookie(OPERATOR_SESSION_COOKIE, raw_token, **cookie_options())


@router.post("/operator/login")
def operator_login(
    body: OperatorLoginBody,
    response: Response,
    db: Session = Depends(get_db),
):
    configured = _configured_credentials()
    if not configured:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Operator credentials not configured",
        )
    if not _credentials_match(body.email, body.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    user = _get_or_create_operator_user(db, body.email)
    _attach_operator_session(response, user, db)
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": "operator",
    }


@router.get("/api/operator/session", response_model=OperatorSessionResponse)
def operator_session(current_user: User = Depends(require_operator_session)):
    return OperatorSessionResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role="operator",
    )
