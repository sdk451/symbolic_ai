# PowerShell script for starting the local development environment
# This script starts all necessary services for local development

Write-Host "Starting Symbolic AI Website Local Development Environment" -ForegroundColor Green
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

# Check if Supabase is running
Write-Host "Checking Supabase status..." -ForegroundColor Yellow
try {
    $supabaseStatus = npx supabase status 2>$null
    if ($supabaseStatus -match "API URL: http://localhost:54321") {
        Write-Host "SUCCESS: Supabase is already running" -ForegroundColor Green
    } else {
        Write-Host "Starting Supabase..." -ForegroundColor Yellow
        npx supabase start
        if ($LASTEXITCODE -eq 0) {
            Write-Host "SUCCESS: Supabase started" -ForegroundColor Green
        } else {
            Write-Host "WARNING: Supabase failed to start. Continuing without local Supabase..." -ForegroundColor Yellow
            Write-Host "Make sure Docker Desktop is running if you want to use local Supabase." -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "WARNING: Could not check Supabase status. Continuing without local Supabase..." -ForegroundColor Yellow
    Write-Host "Make sure Docker Desktop is running if you want to use local Supabase." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Starting development servers..." -ForegroundColor Yellow
Write-Host ""

# Start the basic development environment (Vite only)
Write-Host "Starting Vite dev server..." -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:3000" -ForegroundColor White
Write-Host "Supabase Studio will be available at: http://localhost:54323" -ForegroundColor White
Write-Host ""
Write-Host "Note: Netlify Functions are disabled for now" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the development server
Write-Host "Starting Vite development server..." -ForegroundColor Green

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
npm run dev