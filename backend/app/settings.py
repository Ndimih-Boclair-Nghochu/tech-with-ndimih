import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent

# Load env variables with fallback defaults
from dotenv import load_dotenv
load_dotenv(BASE_DIR / '..' / '.env')

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'changeme')
# WARNING: Never use DEBUG=True in production!
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'
if DEBUG and SECRET_KEY == 'changeme':
    import warnings
    warnings.warn(
        "SECURITY WARNING: Using default SECRET_KEY and DEBUG=True. "
        "This is insecure for production. Set DJANGO_SECRET_KEY and DJANGO_DEBUG=False in production.",
        UserWarning
    )

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'ratelimit',
    'content',
]

# Only load S3 storage app when explicitly enabled (avoids requiring
# django-storages during local development). Set USE_S3=True in env to
# enable S3 and the related storage backend.
if os.environ.get('USE_S3', 'False') == 'True':
    INSTALLED_APPS.insert(INSTALLED_APPS.index('ratelimit'), 'storages')

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'app.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        # Include the frontend build output so Django can serve the SPA index.html in DEBUG
        'DIRS': [BASE_DIR.parent / 'frontend' / 'dist'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'app.wsgi.application'

# Database
import dj_database_url
DATABASES = {
    'default': dj_database_url.parse(os.environ.get('DATABASE_URL', f"sqlite:///{BASE_DIR / 'db.sqlite3'}"))
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Use BigAutoField by default to avoid auto-created AutoField warnings
# See: https://docs.djangoproject.com/en/stable/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

STATIC_URL = '/static/'
MEDIA_URL = '/media/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_ROOT = BASE_DIR / 'media'

# Serve built frontend static files during local development (frontend/dist)
STATICFILES_DIRS = [
    BASE_DIR.parent / 'frontend' / 'dist'
]

# Developer-friendly warning: if the built frontend index.html is missing, print a clear message.
try:
    index_path = BASE_DIR.parent / 'frontend' / 'dist' / 'index.html'
    if not index_path.exists():
        import sys
        print('\nWARNING: built frontend not found at {}.\nIf you expect Django to serve the SPA, run `npm run build` in the frontend folder.\n'.format(index_path), file=sys.stderr)
except Exception:
    # non-fatal: continue even if filesystem checks fail (e.g., restricted environments)
    pass

# Maximum allowed product upload size (MB). Can be overridden via env MAX_PRODUCT_MB
MAX_PRODUCT_MB = int(os.environ.get('MAX_PRODUCT_MB', '25'))
# Maximum allowed general file upload size (MB). Can be overridden via env MAX_UPLOAD_MB
MAX_UPLOAD_MB = int(os.environ.get('MAX_UPLOAD_MB', '10'))

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
}

# Pagination
REST_FRAMEWORK['DEFAULT_PAGINATION_CLASS'] = 'rest_framework.pagination.PageNumberPagination'
REST_FRAMEWORK['PAGE_SIZE'] = int(os.environ.get('DRF_PAGE_SIZE', 9))

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# CORS
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
# During local development, allow all origins to avoid CORS issues between localhost/127.0.0.1
# This is safe only for DEBUG mode.
CORS_ALLOW_ALL_ORIGINS = DEBUG

# Storage: support local and S3-compatible (MinIO/AWS)
DEFAULT_FILE_STORAGE = os.environ.get('DEFAULT_FILE_STORAGE', 'django.core.files.storage.FileSystemStorage')
if os.environ.get('USE_S3', 'False') == 'True':
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'

AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_ENDPOINT_URL = os.environ.get('AWS_S3_ENDPOINT_URL')
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', None)

# Email
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', '587'))
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_USE_TLS = True
DEFAULT_FROM_EMAIL = os.environ.get('EMAIL_FROM', 'ndimihboclair4@gmail.com')
# Email address to receive contact form submissions
CONTACT_EMAIL_RECIPIENT = os.environ.get('CONTACT_EMAIL_RECIPIENT', 'ndimihboclair4@gmail.com')

# Security headers
if not DEBUG:
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True

# Allow iframe embedding for same-origin (needed for PDF viewer)
X_FRAME_OPTIONS = 'SAMEORIGIN'
