# RENDER DEPLOYMENT DATABASE DIAGNOSIS

## Exact Source of DATABASE_URL Requirement
The `DATABASE_URL` requirement originates in `backend/app/core/config.py` on line 6:
```python
class Settings(BaseSettings):
    ...
    DATABASE_URL: str
```
Because this Pydantic field lacks a default value, the backend crashes immediately upon boot if the `DATABASE_URL` environment variable is not provided.

## Current Local Database Configuration Type
The local development environment uses **SQLite** (specifically `sqlite:///./illumskin.db` located in the `backend/.env` file). The repository also contains local `illumskin.db` and `ecommerce.db` files.

## Recommended Render DATABASE_URL Configuration
To simply make the backend **boot successfully** on Render without adding external PostgreSQL services, you can set the environment variable to an ephemeral SQLite database:
```
DATABASE_URL=sqlite:///./illumskin.db
```
*Note: Render uses ephemeral filesystems for standard web services, meaning any data written to this SQLite database during runtime will be lost upon restart unless you attach a persistent Render Disk.*

## Is an External Database Required?
**Yes, for production usage.** 
- The `/api/products` and `/api/match-shade` endpoints actively query the database via the `get_db` dependency.
- The `Dockerfile` explicitly installs `libpq-dev` (PostgreSQL C client library), indicating the original author intended to use PostgreSQL in production. 
- Using SQLite on Render requires attaching a persistent disk; otherwise, deploying a separate PostgreSQL database on Render is the standard approach.

## Exact Environment Variables Render Needs
To resolve the immediate `pydantic_core.ValidationError` crash, you must add the following environment variable in the Render Dashboard under **Environment**:

**Key:** `DATABASE_URL`
**Value:** `sqlite:///./illumskin.db` *(for minimum viable boot)* OR `postgresql://user:password@host/dbname` *(if using a Render PostgreSQL database)*

## Are Code Changes Actually Necessary?
**No code changes are necessary to fix the boot crash.** 
The backend is fully capable of reading the `DATABASE_URL` environment variable. However, because the backend relies on an `alembic` migration mechanism and `seed.py` for database initialization, providing a fresh PostgreSQL or SQLite database on Render will result in empty API responses. You will need to execute `alembic upgrade head` and run the seeder script post-deployment to populate the database.
