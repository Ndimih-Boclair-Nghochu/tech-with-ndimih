<#
PowerShell helper to prepare the project for MySQL and load fixtures.

Usage:
  1. Edit or set any environment variables in `backend/.env` (DATABASE_URL or MYSQL_* vars).
  2. Run this script from the repository root or from `backend`:
       powershell -ExecutionPolicy Bypass -File .\backend\setup_mysql.ps1

What it does:
  - Optionally sets `DATABASE_URL` in `.env` if you provide MYSQL_* variables.
  - Installs Python requirements and `mysqlclient` (if not installed).
  - Runs `python manage.py migrate` to apply migrations.
  - Loads `fixtures/initial_data.json` via `loaddata`.
  - Runs the management command `create_initial_admin` to create the admin user.
  - Prints next steps to start the server.

Notes:
  - You must have a MySQL server accessible and the database created (see README_MYSQL.md).
  - Run this script inside an activated virtualenv.
#>

Set-StrictMode -Version Latest

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

Write-Host "Preparing to configure Django for MySQL and load fixtures..." -ForegroundColor Cyan

# Load .env if present and append variables to process env for this session
if (Test-Path .env) {
  Write-Host "Loading .env variables..." -ForegroundColor Green
  Get-Content .env | ForEach-Object {
    if ($_ -match '^\s*#') { return }
    if ($_ -match '=') {
      $parts = $_ -split '=',2
      $name = $parts[0].Trim()
      $value = $parts[1].Trim()
      if ($name -and $value) { $env:$name = $value }
    }
  }
}

function Ensure-Package([string]$pkg) {
  try {
    pip show $pkg > $null 2>&1
    if ($LASTEXITCODE -ne 0) {
      Write-Host "Installing $pkg..." -ForegroundColor Yellow
      pip install $pkg
    } else { Write-Host "$pkg already installed." -ForegroundColor Green }
  } catch {
    Write-Host "pip not found or failed to check package. Ensure you are in a virtualenv and pip is available." -ForegroundColor Red
    exit 1
  }
}

Write-Host "Installing Python dependencies from requirements.txt..." -ForegroundColor Cyan
Ensure-Package -pkg "-r requirements.txt"

Write-Host "Ensuring mysqlclient is installed (required by Django MySQL backend)..." -ForegroundColor Cyan
Ensure-Package -pkg "mysqlclient"
Write-Host "Ensuring pymysql is installed (settings.py imports and installs it)..." -ForegroundColor Cyan
Ensure-Package -pkg "pymysql"

Write-Host "Running migrations..." -ForegroundColor Cyan
python manage.py migrate
if ($LASTEXITCODE -ne 0) { Write-Host "migrate failed" -ForegroundColor Red; exit 1 }

Write-Host "Loading fixtures..." -ForegroundColor Cyan
python manage.py loaddata fixtures/initial_data.json

Write-Host "Creating admin user (ndimihboclair4@gmail.com)..." -ForegroundColor Cyan
python manage.py create_initial_admin

Write-Host "Done. You can now run the dev server:" -ForegroundColor Green
Write-Host "  python manage.py runserver" -ForegroundColor Yellow
