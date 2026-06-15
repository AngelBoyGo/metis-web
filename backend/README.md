# Metis FastAPI Backend

Sovereign dual-trust API for the Metis portal and admin dashboards. Listens on `127.0.0.1:8000`; the Next.js app proxies `/api/*` to this service.

## Requirements

- Python 3.10+
- Dependencies in `requirements.txt`

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

## Environment

| Variable | Description |
|----------|-------------|
| `METIS_ENV` | `development` or `production` (cookie secure/samesite flags) |
| `METIS_SEED_EMAIL` | Admin user email seeded on first boot |
| `METIS_SEED_PASSWORD` | Admin user password seeded on first boot |
| `METIS_DATABASE_URL` | Optional SQLite URL (default: `backend/metis.db`) |

## Run

```bash
cd backend
python -m app.main
```

Or:

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## Endpoints

| Method | Path | Tier |
|--------|------|------|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |
| GET | `/auth/user/me` | User or admin session |
| GET | `/keys` | User session |
| POST | `/keys/generate` | User session |
| POST | `/keys/revoke` | User session |
| GET | `/serial/status` | User or admin session |
| GET | `/hardware/trace` | Admin session |
