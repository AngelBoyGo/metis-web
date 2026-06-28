"""Operator login and session route tests."""

from __future__ import annotations

import importlib
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.security import OPERATOR_SESSION_COOKIE


def _clear_app_modules() -> None:
    for module_name in list(sys.modules):
        if module_name == "app" or module_name.startswith("app."):
            sys.modules.pop(module_name, None)


def _reload_app(monkeypatch: pytest.MonkeyPatch, tmp_path: Path):
    """Reload FastAPI app with isolated SQLite DB and APF operator credentials."""
    db_path = tmp_path / "operator_test.db"
    monkeypatch.setenv("METIS_DATABASE_URL", f"sqlite:///{db_path.as_posix()}")
    monkeypatch.setenv("METIS_ENV", "development")
    monkeypatch.setenv("APF_OPERATOR_EMAIL", "operator@example.com")
    monkeypatch.setenv("APF_OPERATOR_PASSWORD", "test-operator-pass")
    monkeypatch.delenv("APF_ADMIN_EMAIL", raising=False)
    monkeypatch.delenv("APF_ADMIN_PASSWORD", raising=False)
    monkeypatch.delenv("METIS_SEED_EMAIL", raising=False)
    monkeypatch.delenv("METIS_SEED_PASSWORD", raising=False)

    _clear_app_modules()

    main = importlib.import_module("app.main")
    import app.models  # noqa: F401 — register ORM tables on Base.metadata
    from app.database import Base, engine

    Base.metadata.create_all(bind=engine)
    return main.app


def test_operator_login_rejects_bad_password(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    app = _reload_app(monkeypatch, tmp_path)
    with TestClient(app) as client:
        response = client.post(
            "/operator/login",
            json={"email": "operator@example.com", "password": "wrong"},
        )
        assert response.status_code == 401


def test_operator_login_sets_cookie_and_session(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    app = _reload_app(monkeypatch, tmp_path)
    with TestClient(app) as client:
        login = client.post(
            "/operator/login",
            json={"email": "operator@example.com", "password": "test-operator-pass"},
        )
        assert login.status_code == 200
        body = login.json()
        assert body["email"] == "operator@example.com"
        assert body["role"] == "operator"
        assert OPERATOR_SESSION_COOKIE in login.cookies

        session = client.get("/api/operator/session")
        assert session.status_code == 200
        assert session.json()["email"] == "operator@example.com"


def test_operator_session_requires_cookie(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    app = _reload_app(monkeypatch, tmp_path)
    with TestClient(app) as client:
        response = client.get("/api/operator/session")
        assert response.status_code == 401


def test_operator_login_accepts_apf_admin_credentials(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    db_path = tmp_path / "admin_operator_test.db"
    monkeypatch.setenv("METIS_DATABASE_URL", f"sqlite:///{db_path.as_posix()}")
    monkeypatch.setenv("METIS_ENV", "development")
    monkeypatch.delenv("APF_OPERATOR_EMAIL", raising=False)
    monkeypatch.delenv("APF_OPERATOR_PASSWORD", raising=False)
    monkeypatch.setenv("APF_ADMIN_EMAIL", "admin@example.com")
    monkeypatch.setenv("APF_ADMIN_PASSWORD", "test-admin-pass")
    monkeypatch.delenv("METIS_SEED_EMAIL", raising=False)
    monkeypatch.delenv("METIS_SEED_PASSWORD", raising=False)

    _clear_app_modules()

    main = importlib.import_module("app.main")
    import app.models  # noqa: F401
    from app.database import Base, engine

    Base.metadata.create_all(bind=engine)

    with TestClient(main.app) as client:
        login = client.post(
            "/operator/login",
            json={"email": "admin@example.com", "password": "test-admin-pass"},
        )
        assert login.status_code == 200
        assert login.json()["email"] == "admin@example.com"

        session = client.get("/api/operator/session")
        assert session.status_code == 200
