"""Backward-compatible re-export shim — canonical module is app.database."""

from app.database import (  # noqa: F401
	Base,
	DATABASE_URL,
	SessionLocal,
	engine,
	get_db,
)
