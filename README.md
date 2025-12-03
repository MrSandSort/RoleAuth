# Auth Starter (Express + Postgres)

Opinionated starter for authentication/authorization with role-based access control (`user`, `admin`, `superadmin`) using Express, JWT, bcrypt, and PostgreSQL.

This project extends into a secure, cloud-based file storage platform built for zero-knowledge encryption. Clients encrypt files (e.g., AES-GCM) before upload, the server only stores ciphertext plus metadata and never sees decryption keys. Encrypted blobs live in S3, while PostgreSQL tracks folders, files, encrypted keys/IVs, hashes, and expiring share tokens. JWT access/refresh tokens gate every request and role-based auth enforces ownership and sharing rules. Sharing is done via signed, time-limited tokens without exposing secrets. The system is designed for strong privacy, resilience against breaches/insider risk, and real-world scenarios like document management or personal vaults. Input validation and planned rate limiting/hardening round out the security posture.

## Setup
- Copy `.env.example` to `.env` and set strong values. `SUPERADMIN_EMAIL`/`SUPERADMIN_PASSWORD` are used once at boot to seed the first `superadmin`.
- Set Postgres connection via `DATABASE_URL` or `PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE`.
- Install deps: `npm install`
- Run in dev: `npm run dev` (nodemon) or `npm start`

## Environment
- `PORT` (default `4000`)
- `JWT_SECRET` required; keep long/random
- `ACCESS_TOKEN_EXPIRES_IN` (default `15m`)
- `REFRESH_TOKEN_DAYS` (default `7`)
- `SUPERADMIN_EMAIL` + `SUPERADMIN_PASSWORD` optional but recommended to seed the first superadmin
- `DATABASE_URL` or `PG*` vars for PostgreSQL connection
- `S3_BUCKET` (required), `S3_REGION` (or `AWS_REGION`), optional `S3_ENDPOINT`/`S3_FORCE_PATH_STYLE` for S3-compatible storage, and `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY`

## API
- `POST /auth/register` `{ email, password }` → creates a `user`, returns the user (no tokens)
- `POST /auth/login` `{ email, password }` → returns `{ accessToken, refreshToken, refreshTokenExpiresAt }`
- `POST /auth/refresh` `{ refreshToken }` → returns rotated `{ accessToken, refreshToken, refreshTokenExpiresAt }`
- `POST /auth/manage` `{ email, password, role }` → create `user|admin|superadmin` (requires `Authorization: Bearer <token>` with `superadmin`)
- `GET /protected/me` → current user (auth required)
- `GET /protected/admin` → admin+ only
- `GET /protected/superadmin` → superadmin only
- `GET /health` → simple status
- `POST /folders` `{ name, parentId? }` → create folder
- `GET /folders?folderId=` → list folders/files within a folder (or root if omitted)
- `POST /files/presign` `{ filename, contentType, size, folderId?, encryptedKey, encryptionHeader, hash? }` → create file metadata and receive a presigned S3 upload URL
- `GET /files?folderId=` → list files in a folder
- `GET /files/:id/download` → presigned download URL for owner
- `POST /files/:id/share` `{ expiresInHours?, sharedWithUserId? }` → create a signed, expiring share token
- `POST /shares/:token/redeem` → use share token (auth optional unless share is user-bound) to get a presigned download URL

Access tokens expire after `ACCESS_TOKEN_EXPIRES_IN` (default 15m). Refresh tokens expire after `REFRESH_TOKEN_DAYS` (default 7 days) and are rotated on every `/auth/refresh` call. Include access tokens with `Authorization: Bearer <token>`.

## Notes
- Tables are created automatically at boot in the configured Postgres database.
- Role checks use a hierarchy: `superadmin` > `admin` > `user` (higher roles can access lower-level routes).
- Zero-knowledge: encryption/decryption stays on the client; server stores ciphertext, metadata, and encrypted keys/IVs only. S3 presigns handle upload/download without exposing plaintext to the backend.
