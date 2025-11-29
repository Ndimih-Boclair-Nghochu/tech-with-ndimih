<#
start-dev-full.ps1

This helper attempts to perform the common local dev setup for Windows:
- ensure `127.0.0.1 localhost` exists in the hosts file (requires Administrator)
- add temporary inbound firewall rules for ports 3000 and 8000 (requires Administrator)
- create/activate a Python venv (optional)
- start the Django backend and the Vite frontend each in their own PowerShell window

Usage (run as Administrator for hosts/firewall changes):
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-dev-full.ps1

If you cannot run as Administrator, the script will still attempt to start the servers
but will not modify the hosts file or firewall rules.
#>

param(
  [string]$VenvPath = "C:\venvs\mywebsite",
  [string]$RepoRoot
)

# Compute repository root as the parent of the script folder when not provided
if ([string]::IsNullOrWhiteSpace($RepoRoot)) {
  $RepoRoot = Split-Path -Parent $PSScriptRoot
}

function Is-Administrator {
  $current = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
  return $current.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

Write-Host "Repository root: $RepoRoot"
Write-Host "Virtualenv path: $VenvPath"

$isAdmin = Is-Administrator
if(-not $isAdmin){
  Write-Host "WARNING: Not running as Administrator. Hosts file and firewall updates will be skipped." -ForegroundColor Yellow
} else {
  Write-Host "Running as Administrator — will attempt hosts + firewall updates" -ForegroundColor Green

  # backup hosts
  $hostsPath = 'C:\Windows\System32\drivers\etc\hosts'
  $backupPath = "$hostsPath.backup.$((Get-Date).ToString('yyyyMMddHHmmss'))"
  Copy-Item -Path $hostsPath -Destination $backupPath -Force
  Write-Host "Backed up hosts to $backupPath"

  # ensure 127.0.0.1 localhost exists (prepend if missing)
  $hosts = Get-Content $hostsPath -ErrorAction Stop
  if($hosts -notmatch '^\s*127\.0\.0\.1\s+localhost'){
    Write-Host "Adding '127.0.0.1 localhost' to hosts file"
    $new = @('127.0.0.1 localhost') + $hosts
    $new | Set-Content $hostsPath -Force
  } else {
    Write-Host "Hosts already contains 127.0.0.1 localhost"
  }

  # add firewall rules for dev ports
  if(-not (Get-NetFirewallRule -DisplayName 'Allow Node Dev 3000' -ErrorAction SilentlyContinue)){
    New-NetFirewallRule -DisplayName 'Allow Node Dev 3000' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Any | Out-Null
    Write-Host 'Added firewall rule: Allow Node Dev 3000'
  } else { Write-Host 'Firewall rule for 3000 already exists' }

  if(-not (Get-NetFirewallRule -DisplayName 'Allow Python Dev 8000' -ErrorAction SilentlyContinue)){
    New-NetFirewallRule -DisplayName 'Allow Python Dev 8000' -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow -Profile Any | Out-Null
    Write-Host 'Added firewall rule: Allow Python Dev 8000'
  } else { Write-Host 'Firewall rule for 8000 already exists' }
}

# ensure venv exists
if(-Not (Test-Path $VenvPath)){
  Write-Host "Virtualenv not found at $VenvPath. Creating..." -ForegroundColor Yellow
  python -m venv $VenvPath --copies
}

<#
start-dev-full.ps1

This helper attempts to perform the common local dev setup for Windows:
- ensure `127.0.0.1 localhost` exists in the hosts file (requires Administrator)
- add temporary inbound firewall rules for ports 3000 and 8000 (requires Administrator)
- create/activate a Python venv (optional)
- start the Django backend and the Vite frontend each in their own PowerShell window

Usage (run as Administrator for hosts/firewall changes):
  powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-dev-full.ps1

If you cannot run as Administrator, the script will still attempt to start the servers
but will not modify the hosts file or firewall rules.
#>

param(
  [string]$VenvPath = "C:\venvs\mywebsite",
  [string]$RepoRoot = (Get-Location).Path
)

function Is-Administrator {
  $current = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
  return $current.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

Write-Host "Repository root: $RepoRoot"
Write-Host "Virtualenv path: $VenvPath"

$isAdmin = Is-Administrator
if(-not $isAdmin){
  Write-Host "WARNING: Not running as Administrator. Hosts file and firewall updates will be skipped." -ForegroundColor Yellow
} else {
  Write-Host "Running as Administrator — will attempt hosts + firewall updates" -ForegroundColor Green

  # backup hosts
  $hostsPath = 'C:\Windows\System32\drivers\etc\hosts'
  $backupPath = "$hostsPath.backup.$((Get-Date).ToString('yyyyMMddHHmmss'))"
  Copy-Item -Path $hostsPath -Destination $backupPath -Force
  Write-Host "Backed up hosts to $backupPath"

  # ensure 127.0.0.1 localhost exists (prepend if missing)
  $hosts = Get-Content $hostsPath -ErrorAction Stop
  if($hosts -notmatch '^\s*127\.0\.0\.1\s+localhost'){
    Write-Host "Adding '127.0.0.1 localhost' to hosts file"
    $new = @('127.0.0.1 localhost') + $hosts
    $new | Set-Content $hostsPath -Force
  } else {
    Write-Host "Hosts already contains 127.0.0.1 localhost"
  }

  # add firewall rules for dev ports
  if(-not (Get-NetFirewallRule -DisplayName 'Allow Node Dev 3000' -ErrorAction SilentlyContinue)){
    New-NetFirewallRule -DisplayName 'Allow Node Dev 3000' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Any | Out-Null
    Write-Host 'Added firewall rule: Allow Node Dev 3000'
  } else { Write-Host 'Firewall rule for 3000 already exists' }

  if(-not (Get-NetFirewallRule -DisplayName 'Allow Python Dev 8000' -ErrorAction SilentlyContinue)){
    New-NetFirewallRule -DisplayName 'Allow Python Dev 8000' -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow -Profile Any | Out-Null
    Write-Host 'Added firewall rule: Allow Python Dev 8000'
  } else { Write-Host 'Firewall rule for 8000 already exists' }
}

# ensure venv exists
if(-Not (Test-Path $VenvPath)){
  Write-Host "Virtualenv not found at $VenvPath. Creating..." -ForegroundColor Yellow
  python -m venv $VenvPath --copies
}

Write-Host "Activating venv..."
. "$VenvPath\Scripts\Activate"

Write-Host "Installing backend requirements (if needed)..."
pip install -r "$RepoRoot\backend\requirements.txt"

# Start backend in new window
Start-Process -FilePath "powershell.exe" -ArgumentList '-NoExit','-Command',"cd '$RepoRoot\backend'; python manage.py migrate; python manage.py runserver 127.0.0.1:8000" -WorkingDirectory "$RepoRoot\backend"
Write-Host "Started backend (127.0.0.1:8000) in a new window"

# Start frontend in new window
Start-Process -FilePath "powershell.exe" -ArgumentList '-NoExit','-Command',"cd '$RepoRoot\frontend'; npm install; npm run dev -- --host 127.0.0.1 --port 3000" -WorkingDirectory "$RepoRoot\frontend"
Write-Host "Started frontend (127.0.0.1:3000) in a new window"

Write-Host "If the frontend still cannot be reached, try building and serving the production build with:`n  cd $RepoRoot\frontend; npm run build; cd dist; python -m http.server 3000 --bind 127.0.0.1" -ForegroundColor Cyan
