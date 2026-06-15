"""
Selenium E2E portal validation — Vectors A through E.
Headless Microsoft Edge via Selenium Manager (MSEDGEDRIVER_PATH override honored).
"""

from __future__ import annotations

import hashlib
import json
import os
import re
import sqlite3
import sys
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import URLError
from urllib.request import urlopen

from selenium import webdriver
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

BACKEND_ROOT = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_ROOT.parent
DB_PATH = Path(os.environ.get("METIS_E2E_DB_PATH", str(BACKEND_ROOT / "metis.db")))
RECEIPT_PATH = REPO_ROOT / "evidence" / "web_integration_receipt.json"
SESSION_SNAPSHOT = REPO_ROOT / "evidence" / "e2e_session_snapshot.json"
BASE_URL = os.environ.get("METIS_E2E_BASE_URL", "http://localhost:3000")
LANG = "en"
OFFLINE_MARKER = "[OFFLINE] TELEMETRY_CARRIER_LINK_DISCONNECTED //"
WAIT_SECONDS = int(os.environ.get("METIS_E2E_WAIT_SECONDS", "120"))


def _utc_now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _backend_alive() -> bool:
    try:
        with urlopen("http://127.0.0.1:8000/docs", timeout=2) as resp:
            return resp.status < 500
    except (URLError, OSError, TimeoutError):
        return False


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _api_keys_count(token_hash: str) -> int:
    conn = sqlite3.connect(DB_PATH)
    try:
        row = conn.execute(
            "SELECT count(*) FROM api_keys WHERE token_hash=?",
            (token_hash,),
        ).fetchone()
        return int(row[0]) if row else 0
    finally:
        conn.close()


def _api_keys_total() -> int:
    conn = sqlite3.connect(DB_PATH)
    try:
        row = conn.execute("SELECT count(*) FROM api_keys").fetchone()
        return int(row[0]) if row else 0
    finally:
        conn.close()


def _build_edge_driver() -> webdriver.Edge:
    options = EdgeOptions()
    options.add_argument("--headless=new")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1280,900")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.set_capability("ms:loggingPrefs", {"browser": "ALL", "driver": "ALL"})
    options.set_capability("goog:loggingPrefs", {"browser": "ALL", "driver": "ALL"})
    driver_path = os.environ.get("MSEDGEDRIVER_PATH")
    if driver_path:
        service = EdgeService(executable_path=driver_path)
        driver = webdriver.Edge(service=service, options=options)
    else:
        driver = webdriver.Edge(options=options)
    driver.set_page_load_timeout(WAIT_SECONDS)
    driver.implicitly_wait(2)
    return driver


def _wait_clickable(driver: webdriver.Edge, label: str) -> None:
    xpath = f"//button[contains(normalize-space(.), '{label}')]"
    WebDriverWait(driver, WAIT_SECONDS).until(
        EC.element_to_be_clickable((By.XPATH, xpath))
    )


def _click_button(driver: webdriver.Edge, label: str) -> None:
    xpath = f"//button[contains(normalize-space(.), '{label}')]"
    _wait_clickable(driver, label)
    driver.find_element(By.XPATH, xpath).click()


def _fill_input(driver: webdriver.Edge, element_id: str, value: str) -> None:
    field = WebDriverWait(driver, WAIT_SECONDS).until(
        EC.presence_of_element_located((By.ID, element_id))
    )
    field.clear()
    field.send_keys(value)


def _session_cookie(driver: webdriver.Edge) -> dict[str, Any] | None:
    for cookie in driver.get_cookies():
        if cookie.get("name") == "metis_user_session":
            return cookie
    return None


def _browser_logs_contain(driver: webdriver.Edge, needle: str) -> bool:
    try:
        for entry in driver.get_log("browser"):
            message = entry.get("message", "")
            if needle in message:
                return True
    except WebDriverException:
        pass
    return needle in driver.page_source


def _record_vector(
    results: dict[str, Any],
    vector_id: str,
    status: str,
    detail: dict[str, Any],
) -> None:
    results["vectors"][vector_id] = {
        "status": status,
        "recorded_at": _utc_now(),
        **detail,
    }


def run_vector_a(driver: webdriver.Edge, results: dict[str, Any]) -> dict[str, str]:
    """Register fresh operator, login round-trip, inspect session cookie."""
    creds = {
        "email": f"e2e_{uuid.uuid4().hex[:12]}@example.com",
        "password": "E2e-Portal-9x!",
        "name": "E2E Operator",
    }
    detail: dict[str, Any] = {"credentials_email": creds["email"]}

    try:
        driver.get(f"{BASE_URL}/{LANG}/portal/register")
        _fill_input(driver, "name", creds["name"])
        _fill_input(driver, "email", creds["email"])
        _fill_input(driver, "password", creds["password"])
        _click_button(driver, "CREATE_OPERATOR")
        WebDriverWait(driver, WAIT_SECONDS).until(
            EC.url_contains(f"/{LANG}/portal/dashboard")
        )
        detail["register_url"] = driver.current_url

        driver.get(f"{BASE_URL}/{LANG}/portal/login")
        _fill_input(driver, "email", creds["email"])
        _fill_input(driver, "password", creds["password"])
        _click_button(driver, "SUBMIT_CREDENTIALS")
        WebDriverWait(driver, WAIT_SECONDS).until(
            EC.url_contains(f"/{LANG}/portal/dashboard")
        )
        detail["login_url"] = driver.current_url

        cookie = _session_cookie(driver)
        if cookie is None:
            raise AssertionError("metis_user_session cookie absent after login")

        secure_val = cookie.get("secure")
        same_site = cookie.get("sameSite", cookie.get("samesite"))
        detail["cookie"] = {
            "name": cookie.get("name"),
            "secure": secure_val,
            "sameSite": same_site,
            "httpOnly": cookie.get("httpOnly"),
            "path": cookie.get("path"),
        }

        if secure_val not in (False, "false", None):
            raise AssertionError(f"cookie secure expected false, got {secure_val!r}")
        if str(same_site).lower() != "lax":
            raise AssertionError(f"cookie sameSite expected Lax, got {same_site!r}")

        snapshot = {
            **creds,
            "session_cookie": {
                "name": cookie.get("name"),
                "value": cookie.get("value"),
                "path": cookie.get("path", "/"),
                "secure": cookie.get("secure", False),
                "sameSite": cookie.get("sameSite", "Lax"),
            },
        }
        SESSION_SNAPSHOT.parent.mkdir(parents=True, exist_ok=True)
        SESSION_SNAPSHOT.write_text(json.dumps(snapshot, indent=2), encoding="utf-8")
        detail["session_cookie_saved"] = True
        _record_vector(results, "A", "passed", detail)
        return creds
    except Exception as exc:
        detail["error"] = f"{type(exc).__name__}: {exc}"
        _record_vector(results, "A", "failed", detail)
        raise


def run_vector_b(driver: webdriver.Edge, results: dict[str, Any]) -> str:
    """Generate credential, mask check, reveal full token."""
    detail: dict[str, Any] = {}
    try:
        driver.get(f"{BASE_URL}/{LANG}/portal/dashboard")
        WebDriverWait(driver, WAIT_SECONDS).until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(., 'KEY_VAULT')]"))
        )
        _click_button(driver, "GENERATE_CREDENTIAL")
        time.sleep(0.5)
        _click_button(driver, "REVEAL_SECRET")
        time.sleep(0.3)

        page = driver.page_source
        masked_match = re.search(r"metis_••••••••[A-Za-z0-9_-]{4}", page)
        if not masked_match:
            raise AssertionError("masked token pattern absent after REVEAL toggle")
        detail["masked_sample"] = masked_match.group(0)
        last4 = masked_match.group(0)[-4:]

        _click_button(driver, "REVEAL_SECRET")
        time.sleep(0.3)
        page = driver.page_source
        full_match = re.search(rf"metis_[A-Za-z0-9_-]+{re.escape(last4)}", page)
        if not full_match:
            raise AssertionError("full metis_ token absent after second REVEAL toggle")
        full_token = full_match.group(0)
        detail["full_token_prefix"] = full_token[:12] + "…"
        detail["full_token_last4"] = last4

        _record_vector(results, "B", "passed", detail)
        return full_token
    except Exception as exc:
        detail["error"] = f"{type(exc).__name__}: {exc}"
        _record_vector(results, "B", "failed", detail)
        raise


def _seed_vector_c_fixture() -> dict[str, Any]:
    """Insert user, session, and api_key rows for standalone Vector C."""
    os.environ["METIS_DATABASE_URL"] = f"sqlite:///{DB_PATH}"
    backend_str = str(BACKEND_ROOT)
    if backend_str not in sys.path:
        sys.path.insert(0, backend_str)

    from app.db import SessionLocal
    from app.models import ApiKey
    from app.models import Session as SessionModel
    from app.models import User
    from app.security import (
        generate_api_key_token,
        generate_token,
        hash_password,
        hash_token,
    )

    email = f"e2e-c-{uuid.uuid4().hex[:12]}@fixture.local"
    raw_session = generate_token()
    raw_api = generate_api_key_token()

    with SessionLocal() as db:
        user = User(
            email=email,
            name="E2E Vector C",
            password_hash=hash_password("E2e-Fixture-C-9x!"),
            is_admin=False,
        )
        db.add(user)
        db.flush()

        db.add(
            SessionModel(
                token_hash=hash_token(raw_session),
                user_id=user.id,
                kind="user",
            )
        )
        api_key = ApiKey(
            token_hash=hash_token(raw_api),
            token_last4=raw_api[-4:],
            user_id=user.id,
            active=True,
        )
        db.add(api_key)
        db.flush()
        user_id = user.id
        key_id = api_key.id
        db.commit()

        return {
            "full_token": raw_api,
            "session_raw": raw_session,
            "user_id": user_id,
            "key_id": key_id,
            "email": email,
        }


def _inject_user_session(driver: webdriver.Edge, session_raw: str) -> None:
    driver.get(f"{BASE_URL}/{LANG}/portal/login")
    driver.add_cookie(
        {
            "name": "metis_user_session",
            "value": session_raw,
            "path": "/",
            "secure": False,
            "sameSite": "Lax",
        }
    )


def run_vector_c(
    driver: webdriver.Edge,
    results: dict[str, Any],
    full_token: str,
) -> None:
    """Revoke credential, UI row removal, sqlite purge."""
    detail: dict[str, Any] = {}
    token_hash = _hash_token(full_token)
    last4 = full_token[-4:]
    masked_pattern = f"metis_••••••••{last4}"
    detail["token_hash_prefix"] = token_hash[:16]
    detail["api_keys_before_revoke"] = _api_keys_count(token_hash)

    try:
        if detail["api_keys_before_revoke"] == 0:
            raise AssertionError("token_hash row missing before revoke")

        _click_button(driver, "REVOKE_CREDENTIAL")
        time.sleep(0.5)

        page = driver.page_source
        if full_token in page:
            raise AssertionError("revoked token still visible in viewport")
        if masked_pattern in page:
            raise AssertionError("masked token row still present after revoke")

        count_after = _api_keys_count(token_hash)
        detail["api_keys_after_revoke"] = count_after
        if count_after != 0:
            raise AssertionError(f"api_keys row count expected 0, got {count_after}")

        _record_vector(results, "C", "passed", detail)
    except Exception as exc:
        detail["api_keys_after_revoke"] = _api_keys_count(token_hash)
        detail["error"] = f"{type(exc).__name__}: {exc}"
        _record_vector(results, "C", "failed", detail)
        raise


def run_vector_d(driver: webdriver.Edge, results: dict[str, Any]) -> None:
    """Stealth gate: /dashboard without cookie renders not-found."""
    detail: dict[str, Any] = {}
    try:
        driver.delete_all_cookies()
        driver.get(f"{BASE_URL}/dashboard")
        time.sleep(1.0)
        detail["url"] = driver.current_url
        page = driver.page_source.lower()
        markers = ("404", "not found", "not-found", "this page could not be found")
        found = [m for m in markers if m in page]
        detail["markers_found"] = found
        if not found:
            raise AssertionError("not-found marker absent on /dashboard without cookie")
        _record_vector(results, "D", "passed", detail)
    except Exception as exc:
        detail["error"] = f"{type(exc).__name__}: {exc}"
        _record_vector(results, "D", "failed", detail)
        raise


def _login_operator(driver: webdriver.Edge, creds: dict[str, str]) -> None:
    driver.get(f"{BASE_URL}/{LANG}/portal/login")
    _fill_input(driver, "email", creds["email"])
    _fill_input(driver, "password", creds["password"])
    _click_button(driver, "SUBMIT_CREDENTIALS")
    WebDriverWait(driver, WAIT_SECONDS).until(
        EC.url_contains(f"/{LANG}/portal/dashboard")
    )


def _load_session_snapshot() -> dict[str, Any] | None:
    if not SESSION_SNAPSHOT.is_file():
        return None
    data = json.loads(SESSION_SNAPSHOT.read_text(encoding="utf-8"))
    if isinstance(data, dict) and "email" in data and "password" in data:
        return data
    return None


def _restore_session_cookie(driver: webdriver.Edge, snapshot: dict[str, Any]) -> bool:
    raw = snapshot.get("session_cookie")
    if not isinstance(raw, dict) or not raw.get("name") or not raw.get("value"):
        return False
    driver.get(f"{BASE_URL}/{LANG}/portal/login")
    driver.add_cookie(
        {
            "name": str(raw["name"]),
            "value": str(raw["value"]),
            "path": str(raw.get("path", "/")),
            "secure": bool(raw.get("secure", False)),
            "sameSite": str(raw.get("sameSite", "Lax")),
        }
    )
    return True


def run_vector_e(
    driver: webdriver.Edge,
    results: dict[str, Any],
    creds: dict[str, str] | None,
) -> None:
    """Offline panel when backend on :8000 is unreachable."""
    detail: dict[str, Any] = {}
    backend_down_flag = os.environ.get("METIS_BACKEND_DOWN", "").strip() == "1"
    backend_alive = _backend_alive()
    detail["METIS_BACKEND_DOWN"] = backend_down_flag
    detail["backend_alive_before_reload"] = backend_alive

    if backend_alive and not backend_down_flag:
        detail["skip_reason"] = (
            "backend still answered on :8000; set METIS_BACKEND_DOWN=1 after stopping uvicorn"
        )
        _record_vector(results, "E", "skipped", detail)
        results["untested"].append(
            "Vector E offline panel — backend remained up during suite run"
        )
        return

    snapshot = _load_session_snapshot()
    if snapshot is None and creds is None:
        detail["error"] = "no session snapshot for offline dashboard reload"
        _record_vector(results, "E", "blocked", detail)
        results["blocked"].append("Vector E blocked — session snapshot missing")
        return

    try:
        if backend_alive:
            session_creds = creds or snapshot
            if session_creds is None:
                raise AssertionError("session creds missing for login path")
            _login_operator(driver, session_creds)
        else:
            source = snapshot or {}
            if not _restore_session_cookie(driver, source):
                raise AssertionError("session cookie snapshot missing for offline reload")
            detail["session_restored_from_snapshot"] = True
        driver.get(f"{BASE_URL}/{LANG}/portal/dashboard")
        WebDriverWait(driver, WAIT_SECONDS).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'0 MB')]"))
        )
        WebDriverWait(driver, WAIT_SECONDS).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'$0.00')]"))
        )
        offline_in_logs = False
        deadline = time.time() + 15
        while time.time() < deadline:
            if _browser_logs_contain(driver, OFFLINE_MARKER):
                offline_in_logs = True
                break
            time.sleep(0.5)

        page = driver.page_source
        detail["url"] = driver.current_url

        if "internal server error" in page.lower() or "application error" in page.lower():
            raise AssertionError("SSR 500 marker present on portal dashboard reload")

        if "0 MB" not in page:
            raise AssertionError("BYTE_VOLUME offline text 0 MB absent")
        if "$0.00" not in page:
            raise AssertionError("ESTIMATED_COST offline text $0.00 absent")

        offline_seen = OFFLINE_MARKER in page or offline_in_logs
        detail["offline_marker_in_page"] = OFFLINE_MARKER in page
        detail["offline_marker_in_logs"] = offline_in_logs
        if not offline_seen:
            raise AssertionError(f"offline marker absent: {OFFLINE_MARKER}")

        _record_vector(results, "E", "passed", detail)
    except Exception as exc:
        detail["error"] = f"{type(exc).__name__}: {exc}"
        _record_vector(results, "E", "failed", detail)
        raise


def write_receipt(results: dict[str, Any], build_exit_code: int | None) -> None:
    receipt = {
        "timestamp": _utc_now(),
        "suite": "e2e_portal_validation",
        "environment": {
            "base_url": BASE_URL,
            "lang_path": f"/{LANG}/portal",
            "backend_db": str(DB_PATH),
            "selenium": "Edge headless --headless=new",
        },
        "vectors": results.get("vectors", {}),
        "db_balances": {
            "api_keys_total": _api_keys_total(),
        },
        "build": {
            "command": "npm run build",
            "exit_code": build_exit_code,
        },
        "untested": results.get("untested", []),
        "blocked": results.get("blocked", []),
    }
    RECEIPT_PATH.parent.mkdir(parents=True, exist_ok=True)
    RECEIPT_PATH.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")


def _selected_vectors() -> set[str]:
    raw = os.environ.get("METIS_E2E_VECTORS", "A,B,C,D,E")
    return {part.strip().upper() for part in raw.split(",") if part.strip()}


def main() -> int:
    vectors = _selected_vectors()
    results: dict[str, Any] = {
        "vectors": {},
        "untested": [
            "production cookie lockdown (Secure, SameSite=strict) under local HTTP",
            "multi-browser matrix (Firefox, Chromium)",
            "direct :8000 API calls bypassing Next proxy",
        ],
        "blocked": [],
        "driver_error": None,
        "selected_vectors": sorted(vectors),
    }

    driver: webdriver.Edge | None = None
    exit_code = 0
    creds: dict[str, str] | None = None
    full_token: str | None = None

    try:
        driver = _build_edge_driver()
    except WebDriverException as exc:
        results["driver_error"] = f"{type(exc).__name__}: {exc}"
        results["blocked"].append(f"Selenium Edge driver init failed: {exc}")
        for vid in ("A", "B", "C", "D", "E"):
            if vid in vectors:
                _record_vector(
                    results,
                    vid,
                    "blocked",
                    {"error": str(exc)},
                )
        write_receipt(results, build_exit_code=None)
        print(json.dumps(results, indent=2))
        return 2

    try:
        if "A" in vectors:
            creds = run_vector_a(driver, results)
        if "B" in vectors:
            full_token = run_vector_b(driver, results)
        if "C" in vectors:
            if full_token is None:
                fixture = _seed_vector_c_fixture()
                _inject_user_session(driver, fixture["session_raw"])
                driver.get(
                    f"{BASE_URL}/{LANG}/portal/dashboard?_ts={int(time.time() * 1000)}"
                )
                WebDriverWait(driver, WAIT_SECONDS).until(
                    EC.presence_of_element_located(
                        (By.XPATH, "//div[contains(., 'KEY_VAULT')]")
                    )
                )
                full_token = fixture["full_token"]
                results["vector_c_fixture"] = {
                    "seeded": True,
                    "user_id": fixture["user_id"],
                }
            run_vector_c(driver, results, full_token)
        if "D" in vectors:
            run_vector_d(driver, results)
        if "E" in vectors:
            run_vector_e(driver, results, creds)
    except Exception:
        exit_code = 1
    finally:
        if driver is not None:
            driver.quit()

    passed = sum(1 for v in results["vectors"].values() if v.get("status") == "passed")
    failed = sum(1 for v in results["vectors"].values() if v.get("status") == "failed")
    skipped = sum(1 for v in results["vectors"].values() if v.get("status") == "skipped")
    blocked = sum(1 for v in results["vectors"].values() if v.get("status") == "blocked")
    print(
        f"SUMMARY passed={passed} failed={failed} skipped={skipped} blocked={blocked}",
        file=sys.stderr,
    )
    print(json.dumps(results, indent=2))
    return exit_code


if __name__ == "__main__":
    raise SystemExit(main())
