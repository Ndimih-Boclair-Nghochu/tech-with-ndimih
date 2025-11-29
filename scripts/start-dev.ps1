param(
  [string]$VenvPath = "C:\venvs\mywebsite",
  [string]$RepoRoot = "c:\Users\pc\OneDrive\Desktop\my website"
)

Write-Host "Using venv: $VenvPath"

if(-Not (Test-Path $VenvPath)){
  Write-Host "Virtualenv not found at $VenvPath. Creating..." -ForegroundColor Yellow
  python -m venv $VenvPath --copies
}

Write-Host "Activating venv..."
. "$VenvPath\Scripts\Activate"

Write-Host "Installing backend requirements (if needed)..."
pip install -r "$RepoRoot\backend\requirements.txt"

Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd '$RepoRoot\backend'; python manage.py migrate; python manage.py runserver 0.0.0.0:8000" -WorkingDirectory "$RepoRoot\backend"

Start-Process -FilePath "powershell" -ArgumentList "-NoExit","-Command","cd '$RepoRoot\frontend'; npm install; npm run dev" -WorkingDirectory "$RepoRoot\frontend"

Write-Host "Started backend and frontend dev servers. Frontend: http://localhost:3000  Backend API: http://localhost:8000/api/"
