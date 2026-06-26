import os
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker
from sqlalchemy.pool import NullPool

BACKEND_ROOT = Path(__file__).resolve().parent.parent
DATABASE_PATH = BACKEND_ROOT / "metis.db"
DATABASE_URL = os.environ.get("METIS_DATABASE_URL", f"sqlite:///{DATABASE_PATH}")

_IS_SQLITE = DATABASE_URL.startswith("sqlite")

if _IS_SQLITE:
	engine = create_engine(
		DATABASE_URL,
		connect_args={"check_same_thread": False},
		poolclass=NullPool,
		pool_pre_ping=True,
	)
else:
	engine = create_engine(
		DATABASE_URL,
		pool_size=15,
		max_overflow=30,
		pool_timeout=45,
		pool_recycle=1800,
		pool_pre_ping=True,
		connect_args={"prepare_threshold": 0},
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
