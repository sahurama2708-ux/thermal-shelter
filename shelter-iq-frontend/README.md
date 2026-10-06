# Thermal Shelter — Frontend

AI-powered climate adaptive shelter design. A React + TypeScript + Vite frontend built
against the existing **Thermal Comfort Shelter** FastAPI backend — built by **HexaForge**.

This app does not modify or reimplement any backend logic. It is a pure client for the
API contract defined in `shelter-backend/app/**` (routers, schemas, and the
`{success, data}` / `{success: false, error}` response envelope from
`app/utils/responses.py`).

## Tech stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router v6
- Axios (with a token-refresh interceptor)
- lucide-react icons

## 1. Install

```bash
npm install
```

## 2. Configure the backend URL

Copy the example env file and point it at your running backend:

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://127.0.0.1:8000
```

This must match wherever `uvicorn app.main:app` (or your Docker Compose service) is
actually listening. It's also the origin the backend's OAuth callbacks redirect back to
via `FRONTEND_URL` in the backend's own `.env` — see step 4.

## 3. Run

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default (Vite's default port, set explicitly
in `vite.config.ts`).

To type-check and build for production:

```bash
npm run build
npm run preview
```

> **Note:** this project was authored in an environment without npm registry access, so
> the install/build could not be executed here. Dependency versions in `package.json`
> are pinned to specific, compatible releases (React 18, Vite 6, Tailwind 3, React Router
> 6) — run `npm install && npm run build` locally to verify; if any peer-dependency
> resolution needs adjusting, `npm install` will report it.

## 4. Backend configuration you need to double check

The backend's `.env` (see `shelter-backend/.env.example`) has its own `FRONTEND_URL`,
which it uses to build the OAuth redirect back to this app:

```env
FRONTEND_URL=http://localhost:5173
```

Make sure this points at wherever this frontend is actually served, or the OAuth
callback (`/oauth/callback`) will never receive the token query params. Also confirm the
backend's CORS `cors_origins` (derived from `FRONTEND_URL` in `app/config.py`) matches
this app's origin exactly, including port.

If `GOOGLE_CLIENT_ID` / `GITHUB_CLIENT_ID` aren't set on the backend, its
`/api/v1/auth/{google,github}/login` endpoints return a 400 `OAUTH_NOT_CONFIGURED`
error — the frontend surfaces that as a toast rather than pretending the button worked.

## How authentication works

- `AuthContext` (`src/context/AuthContext.tsx`) holds `user`, `isAuthenticated`, and
  `loading`, and exposes `login`, `register`, `logout`, `loginWithGoogle`,
  `loginWithGithub`, `refreshUser`.
- Tokens live in `localStorage` (`src/services/api.ts`); every request gets
  `Authorization: Bearer <access_token>` via an Axios request interceptor.
- On a 401, a response interceptor calls `POST /api/v1/auth/refresh` with the stored
  refresh token, retries the original request once, and queues any other concurrent
  401s behind that single refresh call (no request storm, no infinite loop). If the
  refresh itself fails, tokens are cleared and the user is signed out.
- `ProtectedRoute` / `PublicOnlyRoute` (`src/routes/`) gate `/dashboard`, `/predict`,
  `/history`, `/profile` behind auth, and keep signed-in users off `/login` / `/register`.

## Google / GitHub OAuth flow

1. The user clicks "Google" or "GitHub" on Login/Register.
2. The browser is redirected (full page nav, not XHR) to
   `GET {VITE_API_URL}/api/v1/auth/{google,github}/login`.
3. The backend redirects to the provider, then to its own
   `/api/v1/auth/{google,github}/callback`.
4. The backend redirects the browser to
   `FRONTEND_URL/oauth/callback?access_token=...&refresh_token=...`.
5. `src/pages/OAuthCallback.tsx` reads those query params, stores the tokens, calls
   `GET /api/v1/auth/me` to hydrate `AuthContext`, and navigates to `/dashboard`. Missing
   or invalid params show "Authentication failed. Please try again." with a link back to
   `/login`.

## How the prediction flow is connected

- `POST /api/v1/predictions/recommend` is called from `src/pages/Prediction.tsx` with
  `{latitude, longitude, month, hill_station}` and returns
  `{thermal_condition, confidence, climate_regime, design}` — this call also persists a
  history row server-side, matching `app/routers/predictions.py`.
- The result view renders the thermal condition (`ConditionBadge`), and the shelter
  `design` object (`ShelterDesignCard`) with roof/walls/ventilation/shading/priority.
- `weather_data` is only present on history items (`PredictionHistoryItem`), not on the
  `recommend` response itself — so raw weather metrics are shown in the history detail
  panel (`WeatherMetrics`), matching `app/schemas/prediction.py` exactly.

## Testing the complete flow locally

1. Start the backend (`uvicorn app.main:app --reload`, from `shelter-backend/`), with a
   `.env` that has `FRONTEND_URL=http://localhost:5173`.
2. `npm install && npm run dev` here, with `VITE_API_URL=http://127.0.0.1:8000`.
3. Visit `http://localhost:5173` → **Get started** → register with email/password, or
   use Google/GitHub if `GOOGLE_CLIENT_ID`/`GITHUB_CLIENT_ID` are configured on the
   backend.
4. On `/dashboard`, click **New Climate Analysis** → enter coordinates (or **Use my
   location**) and a month → **Analyze Climate**.
5. Confirm the result screen shows a thermal condition, confidence, and shelter design,
   then check `/history` for the saved entry, and delete it to confirm the destructive
   flow round-trips correctly.

## Project structure

```
src/
├── components/
│   ├── auth/        SocialButtons
│   ├── common/       Logo, PageSpinner, ConfirmModal, EmptyState, ErrorBanner, Tooltip...
│   ├── dashboard/    StatCard, RecentAnalysisRow
│   ├── history/      HistoryCard, HistoryDetailPanel
│   ├── layout/       Navbar, Footer, AppLayout, AuthLayout
│   ├── marketing/    ShelterBlueprint (landing hero SVG)
│   └── prediction/   ConditionBadge, WeatherMetrics, ShelterDesignCard, LoadingSequence
├── context/          AuthContext, ToastContext
├── hooks/            useGeolocation
├── pages/            Landing, Login, Register, OAuthCallback, Dashboard, Prediction,
│                     History, Profile, About, NotFound
├── routes/           ProtectedRoute, PublicOnlyRoute
├── services/         api (axios + refresh), auth, user, prediction, history
├── types/            api, auth, prediction, user — mirror the backend schemas exactly
└── utils/            constants, errors, format
```

## No fake functionality

There is no forgot-password, email verification, notifications, or admin panel anywhere
in this app — none of those exist on the backend, so no button pretends they do.
