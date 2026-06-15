import os

from sqlalchemy.orm import Session

from app.models import ApiKey, Metric, User
from app.security import (
    generate_api_key_token,
    generate_token,
    hash_password,
    hash_token,
)
from app.models import Session as SessionModel


def seed_database(db: Session) -> None:
    if db.query(User).count() > 0:
        return

    email = os.environ.get("METIS_SEED_EMAIL", "admin@example.com")
    password = os.environ.get("METIS_SEED_PASSWORD", "change-me")
    name = "Metis Admin"

    admin = User(
        email=email,
        name=name,
        password_hash=hash_password(password),
        is_admin=True,
    )
    db.add(admin)
    db.flush()

    admin_token = generate_token()
    db.add(
        SessionModel(
            token_hash=hash_token(admin_token),
            user_id=admin.id,
            kind="admin",
        )
    )

    for _ in range(2):
        raw_key = generate_api_key_token()
        db.add(
            ApiKey(
                token_hash=hash_token(raw_key),
                token_last4=raw_key[-4:],
                user_id=admin.id,
                active=True,
            )
        )

    db.add(
        Metric(
            registered_tenants=42,
            transaction_rate=128.5,
            bytes=15_728_640,
        )
    )
    db.commit()
