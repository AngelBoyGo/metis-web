import secrets

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import require_admin_session, require_any_session
from app.models import Metric, User

router = APIRouter(tags=["hardware"])


@router.get("/hardware/trace")
def hardware_trace(_admin: User = Depends(require_admin_session)):
    payload = secrets.token_bytes(64)
    hex_value = payload.hex()
    return {"hex": hex_value}


@router.get("/serial/status")
def serial_status(
    _user: User = Depends(require_any_session),
    db: Session = Depends(get_db),
):
    metric = db.query(Metric).order_by(Metric.id.desc()).first()
    if metric is None:
        return {
            "counters": {"registered_tenants": 0, "transaction_rate": 0.0},
            "bytes": 0,
            "byte_volume": 0,
        }
    return {
        "counters": {
            "registered_tenants": metric.registered_tenants,
            "transaction_rate": metric.transaction_rate,
        },
        "bytes": metric.bytes,
        "byte_volume": metric.bytes,
    }
