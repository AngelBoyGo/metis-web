from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_any_session
from app.models import Session as SessionModel, User
from app.security import (
    ADMIN_SESSION_COOKIE,
    USER_SESSION_COOKIE,
    cookie_options,
    generate_token,
    hash_password,
    hash_token,
    session_cookie_name,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterBody(BaseModel):
    email: EmailStr
    password: str
    name: str


class LoginBody(BaseModel):
    email: EmailStr
    password: str


class UserMeResponse(BaseModel):
    id: str
    email: str
    name: str


def _attach_session_cookie(response: Response, user: User, db: Session) -> None:
    raw_token = generate_token()
    kind = "admin" if user.is_admin else "user"
    db.add(
        SessionModel(
            token_hash=hash_token(raw_token),
            user_id=user.id,
            kind=kind,
        )
    )
    db.commit()
    cookie_name = session_cookie_name(user.is_admin)
    response.set_cookie(cookie_name, raw_token, **cookie_options())


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(body: RegisterBody, response: Response, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == body.email).first()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    user = User(
        email=body.email,
        name=body.name,
        password_hash=hash_password(body.password),
        is_admin=False,
    )
    db.add(user)
    db.flush()
    _attach_session_cookie(response, user, db)
    return {"id": user.id, "email": user.email, "name": user.name}


@router.post("/login")
def login(body: LoginBody, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )
    _attach_session_cookie(response, user, db)
    return {"id": user.id, "email": user.email, "name": user.name}


@router.get("/user/me", response_model=UserMeResponse)
def user_me(current_user: User = Depends(require_any_session)):
    return UserMeResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
    )


@router.post("/logout")
def logout(response: Response):
    opts = cookie_options()
    for name in (USER_SESSION_COOKIE, ADMIN_SESSION_COOKIE):
        response.delete_cookie(
            name,
            path=opts["path"],
            secure=opts.get("secure", False),
            samesite=opts.get("samesite", "lax"),
        )
    return {"ok": True}
