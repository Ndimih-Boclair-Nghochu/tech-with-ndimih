# Django project package

# Apply Python 3.14 compatibility patch for Django 4.2.8
# This must be imported before Django's template system is used
try:
    import app.patches  # noqa: F401
except ImportError:
    pass