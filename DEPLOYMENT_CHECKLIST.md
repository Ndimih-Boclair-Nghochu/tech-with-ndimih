# Deployment Checklist

## ✅ Pre-Deployment Checklist

### Backend (Django)

- [x] **Database Migrations**: All migrations are created and applied
- [x] **Environment Variables**: Configure the following in your production environment:
  - `DJANGO_SECRET_KEY` - **CRITICAL**: Generate a strong secret key (use `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"`)
  - `DJANGO_DEBUG=False` - **MUST be False in production**
  - `ALLOWED_HOSTS` - Set to your domain(s), e.g., `yourdomain.com,www.yourdomain.com`
  - `DATABASE_URL` - Your production database connection string
  - `CORS_ALLOWED_ORIGINS` - Your frontend domain(s), e.g., `https://yourdomain.com`
  - `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD` - For contact form emails
  - `USE_S3=True` (optional) - If using S3 for media storage
  - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME` (if using S3)

- [x] **Static Files**: Run `python manage.py collectstatic` before deployment
- [x] **Security Settings**: Production security headers are configured (lines 170-173 in settings.py)
- [x] **WSGI Server**: Gunicorn is included in requirements.txt
- [x] **Database**: Configure production database (PostgreSQL recommended)

### Frontend (React/Vite)

- [ ] **Build Frontend**: Run `npm run build` in the `frontend` directory
- [ ] **Environment Variables**: Set `VITE_API_URL` to your production API URL
- [ ] **Static Files**: Ensure `frontend/dist` is served correctly (Django serves it automatically)

### General

- [ ] **SSL/HTTPS**: Ensure your production server uses HTTPS
- [ ] **Domain Configuration**: Point your domain to your server
- [ ] **Firewall**: Configure firewall rules (open ports 80, 443, and your SSH port)
- [ ] **Backup Strategy**: Set up database backups
- [ ] **Monitoring**: Consider setting up error logging/monitoring (Sentry, etc.)

## 🚀 Deployment Steps

### 1. Backend Deployment

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Set environment variables (use your production values)
export DJANGO_SECRET_KEY="your-secret-key-here"
export DJANGO_DEBUG=False
export ALLOWED_HOSTS="yourdomain.com,www.yourdomain.com"
export DATABASE_URL="postgresql://user:password@localhost/dbname"
export CORS_ALLOWED_ORIGINS="https://yourdomain.com"

# Run migrations
python manage.py migrate

# Collect static files
python manage.py collectstatic --noinput

# Create superuser (if not exists)
python manage.py createsuperuser

# Run with Gunicorn (production WSGI server)
gunicorn app.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### 2. Frontend Build

```bash
cd frontend

# Set API URL for production
export VITE_API_URL="https://yourdomain.com/api"

# Build for production
npm run build

# The build output will be in frontend/dist/
# Django will serve this automatically
```

### 3. Server Configuration (Nginx Example)

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Proxy to Django/Gunicorn
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Serve static files directly
    location /static/ {
        alias /path/to/backend/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
    
    # Serve media files
    location /media/ {
        alias /path/to/backend/media/;
        expires 7d;
    }
}
```

## ⚠️ Important Security Notes

1. **Never commit `.env` file** - It contains sensitive information
2. **Change `DJANGO_SECRET_KEY`** - The default "changeme" is insecure
3. **Set `DEBUG=False`** - Prevents exposing sensitive information
4. **Use HTTPS** - Required for secure cookies and security headers
5. **Restrict `ALLOWED_HOSTS`** - Don't use `*` in production
6. **Use strong database passwords**
7. **Regularly update dependencies** - Check for security vulnerabilities

## 📝 Post-Deployment

- [ ] Test all major features (portfolio, blog, contact form, admin)
- [ ] Verify email sending works (contact form)
- [ ] Check file uploads work (portfolio images, CV, certifications)
- [ ] Test admin login
- [ ] Verify API endpoints are accessible
- [ ] Check mobile responsiveness
- [ ] Test donation modal and gift card uploads

## 🔧 Troubleshooting

### Static files not loading
- Run `python manage.py collectstatic`
- Check `STATIC_ROOT` and `STATIC_URL` in settings.py
- Verify Nginx/webserver is serving `/static/` correctly

### CORS errors
- Check `CORS_ALLOWED_ORIGINS` includes your frontend domain
- Verify `CORS_ALLOW_ALL_ORIGINS` is False in production

### 500 errors
- Check Django logs
- Verify `DEBUG=False` (don't expose error details in production)
- Check database connection
- Verify all environment variables are set

### Media files not accessible
- Check `MEDIA_ROOT` and `MEDIA_URL` settings
- Verify file permissions on media directory
- If using S3, check AWS credentials

