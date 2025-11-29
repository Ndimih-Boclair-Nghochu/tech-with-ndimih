# Development notes

This file documents the exact commands and workarounds used to run the project locally on Windows (PowerShell). It includes a OneDrive-safe venv approach (we use `C:\venvs\mywebsite` in this repository) and the sequence to start frontend and backend.

## Quick summary

- Frontend dev (hot reload): run Vite on :3000
- Backend dev: run Django runserver on :8000
- To serve client routes via Django you must build the frontend (`npm run build`) so `frontend/dist` exists; Django is configured to serve `frontend/dist/index.html`.

## Frontend (dev)

Open PowerShell and run:

```powershell
cd "c:\Users\pc\OneDrive\Desktop\my website\frontend"
npm install
npm run dev
```

Open http://localhost:3000 for the Vite dev server.

If you prefer to use Django's port (8000) for the SPA, build the frontend (next section).

## Frontend (build for Django)

Create a production build so Django can serve the SPA:

```powershell
cd "c:\Users\pc\OneDrive\Desktop\my website\frontend"
npm install
npm run build
```

This produces `frontend/dist/index.html` and an `assets/` directory. Django (in `backend/app/settings.py` and `backend/app/urls.py`) includes `frontend/dist` in `STATICFILES_DIRS` / templates so the site will serve the built SPA on port 8000.

## Backend (Windows / PowerShell) — OneDrive venv workaround

Creating a venv inside a OneDrive-synced folder can fail (permission/copy issues). Use a venv outside OneDrive. In this repo we used `C:\venvs\mywebsite`.

1. Create a venv outside OneDrive and activate it:

```powershell
mkdir C:\venvs -Force
python -m venv C:\venvs\mywebsite --copies
. C:\venvs\mywebsite\Scripts\Activate
```

2. Install backend dependencies and run migrations:

```powershell
pip install -r "c:\Users\pc\OneDrive\Desktop\my website\backend\requirements.txt"
cd "c:\Users\pc\OneDrive\Desktop\my website\backend"
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

Notes:
- If `python -m venv` fails creating the venv inside the repo (OneDrive), use the `--copies` flag and create it outside OneDrive as shown above.
- If you encounter `ModuleNotFoundError` for packages referenced in `settings.py` (for example, `dj_database_url`), make sure `pip install -r backend/requirements.txt` completed successfully and you activated the correct venv.
- If migrations fail because Pillow is missing (errors about ImageField), install Pillow in the venv:

```powershell
C:\venvs\mywebsite\Scripts\python -m pip install Pillow
```

## Check the running services

- Frontend dev: http://localhost:3000
- Backend API root: http://localhost:8000/api/
- Django-served SPA: http://localhost:8000/ (after building frontend)

## Docker Compose (optional)

If you prefer containers and have Docker Desktop running, you can start everything with:

```powershell
cd "c:\Users\pc\OneDrive\Desktop\my website"
docker-compose up --build
```

Notes:
- On Windows ensure Docker Desktop is running. Earlier attempts failed when Docker wasn't started.
- The repository's compose file uses Postgres and MinIO for production-like testing; set env vars as needed.

## Common troubleshooting

- 404 for SPA routes when loading directly in browser: this usually means `frontend/dist/index.html` is missing. Build the frontend (`npm run build`) or use the Vite dev server at :3000 while developing.
- Venv creation errors on OneDrive: create the venv outside OneDrive (see venv steps above) or disable OneDrive sync for the repo folder.
- Missing Python packages referenced in `settings.py`: activate the venv and run `pip install -r backend/requirements.txt`.
- If a package installation is interrupted, re-run the pip install command inside the activated venv.

## Environment variables

The backend reads `.env` via python-dotenv (`backend/app/settings.py`). Typical env vars used by the project:

- DATABASE_URL
- DJANGO_DEBUG (True/False)
- USE_S3 (True to enable S3/minio storage)
- AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY / AWS_S3_ENDPOINT_URL
- STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
- PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET / PAYPAL_MODE
- VITE_API_URL (frontend dev)

Create a `.env` file in `backend/` for local dev if you need to override defaults. Example (do not commit secrets):

```
# backend/.env (example)
DJANGO_DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
VITE_API_URL=http://localhost:8000/api
```

## Reproducing what we ran here

1. Start backend venv and install requirements in `C:\venvs\mywebsite` (see notes above).
2. Run `python manage.py migrate`.
3. Start Django: `python manage.py runserver 0.0.0.0:8000`.
4. Build the frontend in `frontend/`: `npm run build`.
5. Open `http://localhost:8000/` to see the built SPA served by Django.

If you want, I can add a small PowerShell script (`scripts\start-dev.ps1`) that automates the common steps for Windows.
