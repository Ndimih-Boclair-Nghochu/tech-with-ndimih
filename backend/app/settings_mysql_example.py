"""
Example MySQL DATABASES configuration for `backend/app/settings.py`.

Usage:
- Copy or reference these settings and provide your DB credentials via environment
  variables or edit directly for local testing.

This example uses the `mysqlclient` (MySQLdb) backend. Install with:
  pip install mysqlclient

Set the environment variable `DATABASE_URL` to something like:
  mysql://dbuser:dbpassword@127.0.0.1:3306/mywebsite_db

Then run migrations and load fixtures:
  python manage.py migrate
  python manage.py loaddata fixtures/initial_data.json
  python manage.py create_initial_admin

"""

from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.environ.get('MYSQL_DATABASE', 'mywebsite_db'),
        'USER': os.environ.get('MYSQL_USER', 'root'),
        'PASSWORD': os.environ.get('MYSQL_PASSWORD', ''),
        'HOST': os.environ.get('MYSQL_HOST', '127.0.0.1'),
        'PORT': os.environ.get('MYSQL_PORT', '3306'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
            'charset': 'utf8mb4',
        },
    }
}
