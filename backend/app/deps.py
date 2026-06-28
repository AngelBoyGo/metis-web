from fastapi import Cookie, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Session as SessionModel, User
from app.security import (
    ADMIN_SESSION_COOKIE,
    OPERATOR_SESSION_COOKIE,
    USER_SESSION_COOKIE,
    hash_token,
)


def _resolve_session(
    db: Session,
    raw_token: str | None,
    expected_kind: str | None = None,
) -> User:
    if not raw_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session required",
        )
    token_hash = hash_token(raw_token)
    row = db.query(SessionModel).filter(SessionModel.token_hash == token_hash).first()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )
    if expected_kind is not None and row.kind != expected_kind:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session tier",
        )
    user = db.query(User).filter(User.id == row.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


def require_user_session(
    metis_user_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    return _resolve_session(db, metis_user_session, expected_kind="user")


def require_admin_session(
    metis_admin_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    return _resolve_session(db, metis_admin_session, expected_kind="admin")


def require_operator_session(
    metis_operator_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    return _resolve_session(db, metis_operator_session, expected_kind="operator")


def require_any_session(
    metis_user_session: str | None = Cookie(default=None),
    metis_admin_session: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> User:
    if metis_user_session:
        try:
            return _resolve_session(db, metis_user_session, expected_kind="user")
        except HTTPException:
            pass
    if metis_admin_session:
        try:
            return _resolve_session(db, metis_admin_session, expected_kind="admin")
        except HTTPException:
            pass
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Session required",
    )
