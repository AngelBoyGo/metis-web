from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_any_session
from app.models import ApiKey, User
from app.security import (
    generate_api_key_token,
    hash_token,
    mask_api_key_token,
)

router = APIRouter(prefix="/keys", tags=["keys"])


class RevokeBody(BaseModel):
    id: str
    key_id: str | None = None


@router.get("")
def list_keys(
    current_user: User = Depends(require_any_session),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(ApiKey)
        .filter(ApiKey.user_id == current_user.id, ApiKey.active.is_(True))
        .order_by(ApiKey.id)
        .all()
    )
    keys = [
        {
            "id": row.id,
            "token": mask_api_key_token(f"{'x' * 24}{row.token_last4}"),
        }
        for row in rows
    ]
    return {"keys": keys}


@router.post("/generate")
def generate_key(
    current_user: User = Depends(require_any_session),
    db: Session = Depends(get_db),
):
    raw_token = generate_api_key_token()
    row = ApiKey(
        token_hash=hash_token(raw_token),
        token_last4=raw_token[-4:],
        user_id=current_user.id,
        active=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"id": row.id, "token": raw_token}


@router.post("/revoke")
def revoke_key(
    body: RevokeBody,
    current_user: User = Depends(require_any_session),
    db: Session = Depends(get_db),
):
    key_id = body.id or body.key_id
    row = (
        db.query(ApiKey)
        .filter(
            ApiKey.id == key_id,
            ApiKey.user_id == current_user.id,
            ApiKey.active.is_(True),
        )
        .first()
    )
    if row is not None:
        db.delete(row)
        db.commit()
    return {"ok": True}
