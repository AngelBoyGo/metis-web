import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

BACKEND_ROOT = Path(__file__).resolve().parent.parent
DATABASE_PATH = BACKEND_ROOT / "metis.db"
DATABASE_URL = os.environ.get("METIS_DATABASE_URL", f"sqlite:///{DATABASE_PATH}")

# check_same_thread is a SQLite-only connect arg; other engines (e.g. Postgres) reject it.
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=_connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
