# AI Coding Agent Instructions

## Architecture Overview

**Full-stack portfolio scaffold**: Django 4.2 + DRF backend in `backend/` and Vite + React 18 frontend in `frontend/`. Supports digital products, affiliate links, donations (Stripe/PayPal), and portfolio/blog content.

**Core data model**: 
- `Portfolio`, `PortfolioImage`: Projects with many-to-many tags via `Tag` model
- `Product`: Digital products with optional Stripe/PayPal integration, affiliate URL tracking
- `BlogPost`: Blog content with cover images; can attach `Product` records
- `AffiliateClick`, `Donation`, `Review`: Auxiliary models for tracking

**API architecture**: DRF viewsets registered in `backend/content/urls.py`, all routes under `/api/`. Frontend calls via Axios singleton at `frontend/src/lib/api.js`, reads `VITE_API_URL` env or defaults to `http://localhost:8000/api`.

## Setup & Development

**Windows/OneDrive caveat**: Venv inside OneDrive can fail. Create venv outside OneDrive:
```powershell
python -m venv C:\venvs\mywebsite --copies
. C:\venvs\mywebsite\Scripts\Activate
cd "c:\Users\pc\OneDrive\Desktop\my website\backend"
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

**Frontend dev** (Vite on :3000):
```powershell
cd "c:\Users\pc\OneDrive\Desktop\my website\frontend"
npm install
npm run dev
```

**Full-stack Docker**: `docker-compose up --build` (Postgres + MinIO for S3-like testing).

**Tests**: `pytest` from backend; `npm run test` from frontend (Vitest). See `backend/content/tests.py` and `backend/content/tests/test_donations.py` for style.

## Critical Patterns & Gotchas

**Slug vs ID routing**: `PortfolioViewSet` and `BlogPostViewSet` use `lookup_field='slug'` for read operations (GET /portfolio/{slug}/), but `ModelViewSet` still registers create/update/delete endpoints by numeric ID. The frontend typically reads by slug but may update by ID—**always verify the client call in `frontend/src/lib/api.js` before changing endpoint routing**.

**Tags normalization**: `PortfolioSerializer._normalize_tags()` accepts tags as list or comma-separated string, lowercases them, and creates `Tag` objects on demand. Apply this pattern when adding new tag-accepting fields.

**Multipart form-data**: Portfolio/Product file uploads use `MultiPartParser`. Frontend wraps file fields in `FormData()` and sets `Content-Type: multipart/form-data` (see `updatePortfolio`). Parsers defined in viewset: `parser_classes = [MultiPartParser, FormParser, JSONParser]`.

**Payment webhooks**: Stripe and PayPal handlers are in `backend/content/views.py`; both optional and guarded by runtime env checks. **Webhook signatures and secrets must be set via env vars** (`STRIPE_SECRET_KEY`, `PAYPAL_CLIENT_ID`, etc.). See `create_donation_session()` and `donate_webhook()` implementations.

**Affiliate click tracking**: `product_click_redirect()` logs IP, User-Agent, referer before redirecting to `product.affiliate_url`. Includes basic bot filter (UA checks). Logs to `AffiliateClick` model.

**SPA serving**: Django configured to serve `frontend/dist/index.html` for non-API routes (catch-all in `backend/app/urls.py`). Requires `npm run build` to generate `dist/`. Dev: use Vite on :3000 with live reload.

**Permission model**: `PortfolioViewSet.get_permissions()` returns `IsAuthenticated()` for write actions (create/update/destroy), `AllowAny()` for reads. Rate limiting via `ratelimit` on endpoints like `contact_view`.

## Environment Variables

Backend reads from `.env` via `python-dotenv`. Key vars:
- `DATABASE_URL`, `DJANGO_DEBUG`, `DJANGO_SECRET_KEY`
- `VITE_API_URL` (frontend, for non-localhost API endpoints)
- `USE_S3=True` (enables MinIO/S3 storage; also set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_ENDPOINT_URL`)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
- `ALLOWED_HOSTS` (comma-separated; defaults to `*` in DEBUG)

## When Adding or Modifying Endpoints

1. **Update models first** in `backend/content/models.py` (slugs auto-generated on save)
2. **Update serializers** in `backend/content/serializers.py` (handle input normalization, validation)
3. **Update viewsets** in `backend/content/views.py` (custom actions via `@action` decorator)
4. **Register in router** in `backend/content/urls.py` if adding new viewset
5. **Write tests** in `backend/content/tests.py` following existing style
6. **Update frontend helpers** in `frontend/src/lib/api.js` (e.g., `fetchXxx()`, `createXxx()`)
7. **Maintain backward compatibility**: prefer optional fields; use `to_representation()` for payload shape changes

## Key Files Reference

- **Backend config**: `backend/app/settings.py` (S3/MinIO via `USE_S3` env, email, DB), `backend/app/urls.py` (routing, SPA fallback)
- **Backend models & serializers**: `backend/content/models.py`, `backend/content/serializers.py` (tag normalization, file validation)
- **Backend views**: `backend/content/views.py` (viewsets, webhooks, affiliate logic, contact form)
- **Frontend API layer**: `frontend/src/lib/api.js` (Axios instance, all CRUD helpers—**single point for baseURL/auth header changes**)
- **Frontend routing**: `frontend/src/App.jsx`, `frontend/src/main.jsx`
- **Dev orchestration**: `docker-compose.yml`, `backend/requirements.txt`, `frontend/package.json`

## Quick Copy-Paste Examples

```python
# Backend: Tag normalization in custom serializer
from .serializers import PortfolioSerializer
tags = serializer._normalize_tags(tags_input)  # handles string or list
```

```javascript
// Frontend: Upload with FormData
const form = new FormData();
form.append('file', fileInput.files[0]);
const res = await api.post('/upload/', form);
```

```javascript
// Frontend: Setting auth token (from login response)
import { setAuthToken } from './lib/api.js';
setAuthToken(response.token);
```


