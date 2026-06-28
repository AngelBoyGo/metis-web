"""Tests for dual SQLite/PostgreSQL engine configuration."""

from __future__ import annotations

import importlib
import sys
from pathlib import Path

import pytest
from sqlalchemy.pool import NullPool, QueuePool

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
	sys.path.insert(0, str(BACKEND_ROOT))


def _reload_database_module(monkeypatch: pytest.MonkeyPatch, database_url: str):
	"""Reload app.database with a patched METIS_DATABASE_URL."""
	monkeypatch.setenv("METIS_DATABASE_URL", database_url)
	for module_name in ("app.database", "app.db"):
		sys.modules.pop(module_name, None)
	return importlib.import_module("app.database")


def test_sqlite_engine_creates_session(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
	"""SQLite fallback creates an engine and yields a working session."""
	db_path = tmp_path / "test_metis.db"
	database = _reload_database_module(monkeypatch, f"sqlite:///{db_path}")

	assert database.DATABASE_URL.startswith("sqlite")
	assert isinstance(database.engine.pool, NullPool)

	session = database.SessionLocal()
	try:
		result = session.connection().exec_driver_sql("SELECT 1").scalar()
		assert result == 1
	finally:
		session.close()


def test_postgres_url_normalizes_railway_scheme(monkeypatch: pytest.MonkeyPatch) -> None:
	"""Railway-style postgresql:// URLs use the psycopg3 driver."""
	database = _reload_database_module(
		monkeypatch,
		"postgresql://user:pass@localhost:5432/railway",
	)

	assert database.DATABASE_URL == "postgresql+psycopg://user:pass@localhost:5432/railway"


def test_postgres_engine_pool_kwargs(monkeypatch: pytest.MonkeyPatch) -> None:
	"""PostgreSQL URL configures pool tuning and PgBouncer-safe connect args."""
	database = _reload_database_module(
		monkeypatch,
		"postgresql+psycopg://user:pass@localhost:5432/metis",
	)

	assert database.DATABASE_URL.startswith("postgresql+psycopg")
	pool = database.engine.pool
	assert isinstance(pool, QueuePool)
	assert pool.size() == 15
	assert pool._max_overflow == 30  # noqa: SLF001
	assert pool._timeout == 45  # noqa: SLF001
	assert pool._recycle == 1800  # noqa: SLF001
	assert database.engine.pool._pre_ping is True  # noqa: SLF001
	connect_kwargs = database.engine.pool._creator.__closure__[1].cell_contents  # noqa: SLF001
	assert connect_kwargs["prepare_threshold"] == 0
