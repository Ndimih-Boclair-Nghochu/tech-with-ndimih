Previewing the built frontend (Windows PowerShell)

This short snippet shows how to preview the production-built SPA in Windows PowerShell. Use either a static server for `dist/` or serve it via the Django backend (the project is configured to serve the built SPA in DEBUG).

1) Build the frontend

```powershell
cd 'C:\Users\pc\OneDrive\Desktop\my website\frontend'
npm install
npm run build
```

2) Static preview (simple, fast)

```powershell
cd 'C:\Users\pc\OneDrive\Desktop\my website\frontend'
npx serve -s dist -l 3000
# then open http://localhost:3000/
```

If you don't have `serve` installed, `npx` will fetch and run it temporarily. Alternative using Python's simple server:

```powershell
cd 'C:\Users\pc\OneDrive\Desktop\my website\frontend'
python -m http.server 3000 --directory dist
# then open http://localhost:3000/
```

3) Preview via Django (recommended if you want integrated backend)

```powershell
cd 'C:\Users\pc\OneDrive\Desktop\my website\backend'
# activate your virtualenv if needed
.\.venv\Scripts\Activate.ps1
python manage.py runserver 0.0.0.0:8000
# open http://localhost:8000/
```

Firewall / connectivity tips

- If `http://localhost:3000/` or `http://localhost:8000/` does not respond, check Windows Firewall or any local VPNs that may intercept loopback traffic.
- To open a temporary inbound firewall rule (requires admin PowerShell):

```powershell
# Run PowerShell as Administrator
New-NetFirewallRule -DisplayName "Local HTTP 3000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 3000
New-NetFirewallRule -DisplayName "Local HTTP 8000" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000
```

If you'd rather not change firewall settings, use the Django route (`runserver`) which typically works when started from your development machine.

Notes

- The build process outputs asset files to `frontend/dist/`. The app expects to find static assets relative to `/assets/` when served by Django — this is handled by `backend/app/urls.py` in DEBUG.
- If you see large chunk warnings for the 3D hero (`HeroCanvas`), consider using a CDN for that chunk or splitting the 3D scene into smaller dynamic imports.

If you want, I can add these commands to the project root `README.md` or create a small PowerShell script that runs the build and the static preview together.

Creating a Django superuser (admin access)

To use the Django admin UI at `/admin/` you'll need a superuser account. From the backend folder run:

```powershell
cd 'C:\Users\pc\OneDrive\Desktop\my website\backend'
.\.venv\Scripts\Activate.ps1
python manage.py createsuperuser --username admin --email admin@example.com
```

Follow the prompts to set a password. After creating the superuser you can log in at `http://localhost:8000/admin/`.

If you'd like, I can add a small management command or scripted helper to create a default admin during development, but that requires storing credentials — I avoid writing credentials into the repo.
