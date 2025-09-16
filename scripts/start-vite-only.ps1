# PowerShell script for starting only the Vite development server
# This script starts only the frontend without Netlify Functions

Write-Host "Starting Symbolic AI Website (Vite Only)" -ForegroundColor Green
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "WARNING: .env.local not found." -ForegroundColor Yellow
    Write-Host "You can either:" -ForegroundColor Cyan
    Write-Host "1. Run .\scripts\setup-remote-supabase.ps1 for remote Supabase" -ForegroundColor White
    Write-Host "2. Run .\scripts\setup-local-supabase.ps1 for local Supabase" -ForegroundColor White
    Write-Host "3. Continue without environment file (will use default values)" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "Exiting. Please set up your environment first." -ForegroundColor Red
        exit 1
    }
    Write-Host "Continuing without .env.local..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Vite development server..." -ForegroundColor Yellow
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "Note: Netlify Functions are disabled" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Check if npm is available
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: npm is not available. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "ERROR: package.json not found. Are you in the correct directory?" -ForegroundColor Red
    exit 1
}

# Start the Vite development server only
Write-Host "Starting Vite..." -ForegroundColor Green
npm run dev
