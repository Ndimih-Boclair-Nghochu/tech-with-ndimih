MySQL Setup and Fixtures
=========================

This document explains how to switch the Django backend to a MySQL database, run migrations, load the included fixtures, and create the admin user.

Prerequisites
--
- MySQL (or MariaDB) server running and accessible.
- Python dependencies: `mysqlclient` (install with `pip install mysqlclient`).
- A Python virtualenv with the project's dependencies installed (`pip install -r requirements.txt`).

Steps
--
1. Create a MySQL database and user (example):

```sql
CREATE DATABASE mywebsite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
CREATE USER 'myuser'@'localhost' IDENTIFIED BY 'strongpassword';
GRANT ALL PRIVILEGES ON mywebsite_db.* TO 'myuser'@'localhost';
FLUSH PRIVILEGES;
3. Install Python MySQL client and other deps:

You can use either `mysqlclient` (recommended for production) or `PyMySQL` (pure-Python, easier to install). This project currently uses `PyMySQL` via `pymysql.install_as_MySQLdb()` in `settings.py`, so installing `pymysql` is sufficient for local testing. If you prefer `mysqlclient`, install that instead.

```powershell
cd "C:\Users\pc\OneDrive\Desktop\my website\backend"
pip install -r requirements.txt
# install PyMySQL (used by settings.py)
pip install pymysql
# or, alternatively for native client performance:
pip install mysqlclient
```

3. Install MySQL client for Python and other deps:

```powershell
cd "C:\Users\pc\OneDrive\Desktop\my website\backend"
pip install -r requirements.txt
pip install mysqlclient
```

4. Run Django migrations against the MySQL DB:

```powershell
python manage.py migrate
```

5. Load the included fixtures to populate initial content:

```powershell
python manage.py loaddata fixtures/initial_data.json
```

6. Create the admin user (email: `ndimihboclair4@gmail.com`, password: `@Boclair444`):

```powershell
python manage.py create_initial_admin
```

7. Start the server and log in at `/admin/` using the admin credentials.

Notes
--
- The fixture sets up tags, a sample product, a portfolio entry and a blog post so the admin UI has content to edit.
- The management command `create_initial_admin` will create or update the admin user with the specified email and password.
- After importing fixtures, you may still want to run `python manage.py collectstatic` in production.
