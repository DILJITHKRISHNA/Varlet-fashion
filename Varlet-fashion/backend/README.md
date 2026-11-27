# Varlet API

FastAPI + PostgreSQL. It serves the website (`../frontend`) and the mobile app (`../../Varlet-app`).

## Run it locally

You need Python 3.13 and the local Postgres from `npx supabase start` (run inside `Varlet-app`).
Only its database is used; sign-in is handled by this API.

```bash
cd Varlet-fashion/backend
python3.13 -m venv .venv
./.venv/bin/pip install -r requirements-dev.txt
./.venv/bin/python -m app.setup_env     # writes .env with fresh local secrets
./.venv/bin/alembic upgrade head        # creates the tables
./.venv/bin/python -m app.seed          # sample shops and demo accounts
./.venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8100
```

- Interactive API docs: http://127.0.0.1:8100/docs
- Demo accounts: `consumer@`, `owner@`, `manager@`, `admin@varlet.dev`.
  Their password is `SEED_PASSWORD` in `.env`.
- `--host 0.0.0.0` lets a phone on the same Wi-Fi reach the API. Use `127.0.0.1` on shared networks.
- On macOS, allow the "access your Documents folder" prompt for Python the first time.

## Tests

```bash
./.venv/bin/pytest
./.venv/bin/ruff check app tests migrations
```

Tests create and delete their own database, `varlet_api_test`, on the local server.

## What it does

| Area | Routes (under `/api/v1`) |
| --- | --- |
| Sign-in | `/auth/register`, `/login`, `/refresh`, `/logout`, `/me` |
| Shops | `/shops`, `/shops/nearby`, `/shops/register` |
| Discovery | `/products` (search, brand, price, distance), `/products/{id}/combinations`, `/collections/price`, `/offers` |
| Screenshot and reel search | `POST /search/image` (picture or short video) |
| Shopper | `/me/wishlist`, `/me/following`, `/me/saved-outfits`, `/me/notifications` |
| Store owner | `/shops/mine` for profile, products, `products/bulk` (CSV or Excel), offers, enquiries |
| Enquiry tracking | `POST /enquiries` when someone taps WhatsApp, call or directions |

Tables live in the `varlet` schema, so they do not clash with older tables in `public`
and are not exposed by Supabase's public REST API.

## Image search

Set `GEMINI_API_KEY` in `.env` (free key from Google AI Studio) and restart.
Without it the route answers "Image search is not set up yet".

- Gemini describes the garments; the API then matches type, colour, brand and words against
  shop products. It does not compare pixels, so most results are "similar", not "exact".
- On Gemini's free tier, Google may use uploaded content to improve its products.
  Tell users, or use a paid key, before real customers upload photos.
- Instagram links cannot be fetched. Users upload a screenshot or a short clip (up to 12 MB).

## Using a hosted database or server

1. Put the connection string in `DATABASE_URL` (Supabase: Session pooler). Never commit it.
2. `./.venv/bin/alembic upgrade head`
3. On the server set `ENVIRONMENT=production`, a new `JWT_SECRET`, `DATABASE_URL`, and
   `CORS_ORIGINS` with the website's address.
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT --proxy-headers`
   (set `--forwarded-allow-ips` to your host's proxy so rate limits see real client addresses).
5. Point the website (`VITE_API_URL`) and app (`EXPO_PUBLIC_API_URL`) at its https address.

`app.seed` refuses to run against anything but a local development database.

## Limits

- Rate limits are held in memory, so they apply per server process.
- Product images are links; file upload is not built yet.
- Orders, staff management and platform-admin statistics are not built yet.
- No password reset or email verification yet.
