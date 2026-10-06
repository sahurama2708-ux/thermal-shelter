# Thermal Comfort Shelter — Backend

Inference and account API for the Thermal Comfort Shelter / Smart Shelter
project. Given `latitude`, `longitude`, `month`, and `hill_station`, it fetches
climate data from NASA POWER, reproduces the exact feature pipeline from the
project's notebook, runs the trained neural network, and returns a shelter
design recommendation. Authenticated users get their prediction history saved
automatically.

This is a **backend only**. It does not include a frontend/dashboard, but it
implements everything a login page needs (email/password + Google/GitHub
OAuth, JWT).

> **Important note on the ML artifacts**: the project notebook
> (`Untitled2_FIXED.ipynb`) computes `climate_scaler`, `climate_kmeans`,
> `climate_feature_order`, and `nn_feature_order` in memory, but only ever
> saves 3 of the 7 required artifacts to disk (the model, `thermal_scaler.pkl`,
> `thermal_label_encoder.pkl`). No `.pkl`/`.keras` files were attached
> alongside the notebook. The artifacts in `artifacts/` were produced by
> running the notebook's own code end-to-end against `weather_master_cleaned.csv`
> — same architecture, same features, same seeds, same EWC continual-learning
> procedure — solely to obtain the missing files. Nothing was invented or
> retrained differently from what the notebook already specifies. Final held-out
> test accuracy: **88.46%**, with 8 climate regimes (chosen by the notebook's
> own silhouette-score search).

---

## 1. Architecture

```
Frontend
   │
   ▼
FastAPI (API Gateway)
   │
   ├── Auth (email/password, Google OAuth, GitHub OAuth, JWT)
   ├── Users (/users/me)
   └── Predictions
         │
         ▼
   NASA POWER climatology (cached per lat/lon)
         │
         ▼
   Feature builder (interactions, heat-humidity index)
         │
         ▼
   Climate scaler → KMeans → CLIMATE_REGIME
         │
         ▼
   Neural network (thermal_comfort_ewc_model.keras)
         │
         ▼
   Rule-based recommender → shelter design
         │
         ▼
   PostgreSQL / SQLite — prediction_history
```

## 2. Folder structure

```
shelter-backend/
├── app/
│   ├── main.py            FastAPI app, CORS, exception handlers, startup
│   ├── config.py          Settings (env vars)
│   ├── database.py        SQLAlchemy engine/session
│   ├── dependencies.py    get_current_user
│   ├── models/            SQLAlchemy models (User, PredictionHistory)
│   ├── schemas/           Pydantic request/response models
│   ├── routers/           auth, users, predictions, health
│   ├── services/          model, weather, features, recommender, auth, oauth
│   └── utils/             security (JWT + bcrypt), response envelope
├── artifacts/             Trained model + all helper artifacts (see above)
├── alembic/                Migrations
├── tests/                  Pytest suite (NASA POWER is mocked)
├── requirements.txt
├── .env.example
├── Dockerfile
├── docker-compose.yml
└── alembic.ini
```

## 3. Local setup (Windows)

```bat
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt

copy .env.example .env
:: edit .env - at minimum set JWT_SECRET_KEY

alembic upgrade head

uvicorn app.main:app --reload
```

Swagger UI: http://127.0.0.1:8000/docs
ReDoc: http://127.0.0.1:8000/redoc

## 3b. Local setup (macOS / Linux)

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

By default `.env.example` uses SQLite (`sqlite:///./shelter.db`) so you can run
the whole thing with **no database server**. For PostgreSQL, set:

```
DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/shelter
```

and `pip install psycopg2-binary` (already in `requirements.txt`).

## 4. Running with Docker

```bash
docker compose up --build
```

This starts PostgreSQL and the backend, runs `alembic upgrade head`
automatically, and serves the API on `http://localhost:8000`. Configuration
comes from `.env` (create it from `.env.example` first) plus the
`DATABASE_URL` override baked into `docker-compose.yml` for the Postgres
container.

## 5. Environment variables

See `.env.example` for the full list. Never commit `.env` or real OAuth
secrets.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite for dev, PostgreSQL for production |
| `JWT_SECRET_KEY` | Sign/verify JWTs — change this in every environment |
| `ACCESS_TOKEN_EXPIRE_MINUTES` / `REFRESH_TOKEN_EXPIRE_DAYS` | Token lifetimes |
| `FRONTEND_URL` | Used for CORS and OAuth redirect target |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_REDIRECT_URI` | Google OAuth |
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` / `GITHUB_REDIRECT_URI` | GitHub OAuth |
| `NASA_POWER_URL` | NASA POWER climatology endpoint |

## 6. OAuth configuration

### Google
1. Go to Google Cloud Console → APIs & Services → Credentials.
2. Create an OAuth 2.0 Client ID (type: Web application).
3. Authorized redirect URI: `http://127.0.0.1:8000/api/v1/auth/google/callback`
   (match `GOOGLE_REDIRECT_URI` exactly).
4. Copy the client ID/secret into `.env`.

### GitHub
1. GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.
2. Authorization callback URL: `http://127.0.0.1:8000/api/v1/auth/github/callback`
   (match `GITHUB_REDIRECT_URI` exactly).
3. Copy the client ID/secret into `.env`.

If a provider's client ID is blank, its `/login` endpoint returns
`400 OAUTH_NOT_CONFIGURED` instead of crashing.

## 7. How the frontend should integrate

**Login page buttons:**
- "Continue with Google" → `GET /api/v1/auth/google/login` (redirects the
  browser to Google, then back to
  `FRONTEND_URL/oauth/callback?access_token=...&refresh_token=...`)
- "Continue with GitHub" → `GET /api/v1/auth/github/login` (same pattern,
  callback at `GITHUB_REDIRECT_URI`)
- "Login with Email" → `POST /api/v1/auth/login` with `{email, password}`
- "Register" → `POST /api/v1/auth/register` with `{email, password, name}`

Both flows return:
```json
{ "success": true, "data": { "access_token": "...", "refresh_token": "...", "token_type": "bearer" } }
```

**Calling protected endpoints:** send the access token as a Bearer header:
```
Authorization: Bearer <access_token>
```

**Refreshing:** `POST /api/v1/auth/refresh` with `{ "refresh_token": "..." }`
returns a new `access_token`.

**Getting the current user:** `GET /api/v1/auth/me` (protected).

## 8. API reference

All responses use a consistent envelope:
```json
{ "success": true, "data": { ... } }
{ "success": false, "error": { "code": "...", "message": "..." } }
```

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | – | Liveness + model/database status |
| POST | `/api/v1/auth/register` | – | Create an email/password account |
| POST | `/api/v1/auth/login` | – | Get access + refresh tokens |
| POST | `/api/v1/auth/refresh` | – | Exchange refresh token for new access token |
| POST | `/api/v1/auth/logout` | – | Stateless logout (client discards tokens) |
| GET | `/api/v1/auth/me` | JWT | Current user |
| GET | `/api/v1/auth/google/login` | – | Redirect to Google |
| GET | `/api/v1/auth/google/callback` | – | Google redirects back here |
| GET | `/api/v1/auth/github/login` | – | Redirect to GitHub |
| GET | `/api/v1/auth/github/callback` | – | GitHub redirects back here |
| GET / PATCH / DELETE | `/api/v1/users/me` | JWT | Profile read/update/delete |
| POST | `/api/v1/predictions/predict` | JWT | Thermal condition + confidence + regime |
| POST | `/api/v1/predictions/recommend` | JWT | Full pipeline + shelter design; saves history |
| GET | `/api/v1/predictions/history?page=1&page_size=20` | JWT | Paginated, newest first |
| GET | `/api/v1/predictions/history/{id}` | JWT | Single record (owner only) |
| DELETE | `/api/v1/predictions/history/{id}` | JWT | Delete a record (owner only) |

`/predict` and `/recommend` request body:
```json
{ "latitude": 27.88, "longitude": 79.91, "month": 6, "hill_station": 0 }
```

## 9. Testing

```bash
pytest tests/ -v
```

NASA POWER is mocked (`tests/conftest.py`) so tests never call the real API.
The suite covers: health/model-loading, register/login/invalid-login, JWT
auth on `/me`, OAuth routes existing, input validation (month/lat/lon),
prediction & recommendation auth requirements, history ownership isolation
between users, and weather-cache reuse across months for the same coordinate.

## 10. Database migrations

```bash
alembic upgrade head          # apply
alembic revision --autogenerate -m "message"   # generate a new migration
alembic downgrade -1          # roll back one step
```

## 11. Security notes

- Passwords are hashed with bcrypt (never stored or logged in plain text).
- JWTs contain only `sub`, `email`, `provider`, `type`, `iat`, `exp` — no
  passwords or provider tokens.
- CORS only allows `FRONTEND_URL`, never `*`, since credentials are enabled.
- OAuth uses a random `state` value checked on callback to prevent CSRF.
- Generic error messages on login avoid confirming whether an email exists.
- Stack traces are never returned to clients; unhandled errors return a
  generic `500 INTERNAL_SERVER_ERROR`.

## 12. Deployment

`docker-compose.yml` is a reasonable starting point for a single-node
deployment. For real production:
- Put the app behind a reverse proxy / load balancer with TLS.
- Use a managed PostgreSQL instance and run `alembic upgrade head` as a
  release step, not inside the app container's hot path.
- Replace the in-memory weather cache and OAuth `state` store with Redis if
  running more than one backend instance.
- Set a strong, unique `JWT_SECRET_KEY` and real OAuth credentials via your
  platform's secret manager — never commit them.
