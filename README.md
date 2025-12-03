# Auth Starter (Express + SQLite)

Opinionated starter for authentication/authorization with role-based access control (`user`, `admin`, `superadmin`) using Express, JWT, bcrypt, and SQLite (better-sqlite3).

## Setup
- Copy `.env.example` to `.env` and set strong values. `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD` are used once at boot to seed the first `superadmin`.
- Install deps: `npm install`
- Run in dev: `npm run dev` (nodemon) or `npm start`

## Environment
- `PORT` (default `4000`)
- `JWT_SECRET` required; keep long/random
- `ACCESS_TOKEN_EXPIRES_IN` (default `15m`)
- `REFRESH_TOKEN_DAYS` (default `7`)
- `SUPERADMIN_EMAIL` + `SUPERADMIN_PASSWORD` optional but recommended to seed the first superadmin

## API
- `POST /auth/register` `{ email, password }` → creates a `user`, returns the user (no tokens)
- `POST /auth/login` `{ email, password }` → returns `{ accessToken, refreshToken, refreshTokenExpiresAt }`
- `POST /auth/refresh` `{ refreshToken }` → returns rotated `{ accessToken, refreshToken, refreshTokenExpiresAt }`
- `POST /auth/manage` `{ email, password, role }` → create `user|admin|superadmin` (requires `Authorization: Bearer <token>` with `superadmin`)
- `GET /protected/me` → current user (auth required)
- `GET /protected/admin` → admin+ only
- `GET /protected/superadmin` → superadmin only
- `GET /health` → simple status

Access tokens expire after `ACCESS_TOKEN_EXPIRES_IN` (default 15m). Refresh tokens expire after `REFRESH_TOKEN_DAYS` (default 7 days) and are rotated on every `/auth/refresh` call. Include access tokens with `Authorization: Bearer <token>`.

## Notes
- Data lives in `data/app.db` (SQLite); remove the file to reset local data.
- Role checks use a hierarchy: `superadmin` > `admin` > `user` (higher roles can access lower-level routes).
