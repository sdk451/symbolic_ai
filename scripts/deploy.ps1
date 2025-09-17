# Netlify Deployment Script for Windows PowerShell
# This script provides multiple deployment options for the Symbolic AI website

param(
    [Parameter(Position=0)]
    [ValidateSet("local", "preview", "production", "automated", "status", "help")]
    [string]$Command = "help"
)

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to check if Netlify CLI is installed
function Test-NetlifyCLI {
    try {
        $null = Get-Command netlify -ErrorAction Stop
        return $true
    }
    catch {
        Write-Error "Netlify CLI is not installed. Please install it first:"
        Write-Host "npm install -g netlify-cli" -ForegroundColor Cyan
        return $false
    }
}

# Function to check if user is logged in to Netlify
function Test-NetlifyAuth {
    try {
        $null = netlify status 2>$null
        if ($LASTEXITCODE -eq 0) {
            return $true
        } else {
            Write-Warning "Not logged in to Netlify. Please log in:"
            netlify login
            return $true
        }
    }
    catch {
        Write-Warning "Not logged in to Netlify. Please log in:"
        netlify login
        return $true
    }
}

# Function to run quality checks
function Invoke-QualityChecks {
    Write-Status "Running quality checks..."
    
    # Type checking
    Write-Status "Running TypeScript type checking..."
    npm run type-check
    if ($LASTEXITCODE -ne 0) { throw "Type checking failed" }
    
    # Linting
    Write-Status "Running ESLint..."
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "Linting failed" }
    
    # Testing
    Write-Status "Running tests..."
    npm test -- --run
    if ($LASTEXITCODE -ne 0) { throw "Tests failed" }
    
    Write-Success "All quality checks passed!"
}

# Function to build the application
function Invoke-Build {
    Write-Status "Building application..."
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    Write-Success "Build completed successfully!"
}

# Function for local development deployment
function Start-LocalDev {
    Write-Status "Starting local Netlify development server..."
    netlify dev
}

# Function for preview deployment
function Start-PreviewDeploy {
    Write-Status "Deploying preview to Netlify..."
    netlify deploy --dir=dist
    if ($LASTEXITCODE -ne 0) { throw "Preview deployment failed" }
    Write-Success "Preview deployment completed!"
}

# Function for production deployment
function Start-ProductionDeploy {
    Write-Status "Deploying to production..."
    netlify deploy --prod --dir=dist
    if ($LASTEXITCODE -ne 0) { throw "Production deployment failed" }
    Write-Success "Production deployment completed!"
}

# Function for automated deployment with quality checks
function Invoke-AutomatedDeploy {
    Write-Status "Starting automated deployment process..."
    
    # Run quality checks
    Invoke-QualityChecks
    
    # Build application
    Invoke-Build
    
    # Deploy to preview first (safer)
    Start-PreviewDeploy
    
    Write-Success "Automated deployment completed successfully!"
    Write-Warning "This was a preview deployment. Use 'production' command for live deployment."
}

# Function to show deployment status
function Show-Status {
    Write-Status "Checking deployment status..."
    netlify status
}

# Function to show help
function Show-Help {
    Write-Host "Netlify Deployment Script for Symbolic AI Website" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\scripts\deploy.ps1 [COMMAND]" -ForegroundColor White
    Write-Host ""
    Write-Host "Commands:" -ForegroundColor Yellow
    Write-Host "  local       Start local Netlify development server"
    Write-Host "  preview     Deploy preview to Netlify"
    Write-Host "  production  Deploy to production"
    Write-Host "  automated   Run quality checks, build, and deploy to production"
    Write-Host "  status      Show current deployment status"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Green
    Write-Host "  .\scripts\deploy.ps1 local       # Start local development"
    Write-Host "  .\scripts\deploy.ps1 preview     # Deploy preview"
    Write-Host "  .\scripts\deploy.ps1 production  # Deploy to production"
    Write-Host "  .\scripts\deploy.ps1 automated   # Full automated deployment"
}

# Main script logic
try {
    # Check prerequisites
    if (-not (Test-NetlifyCLI)) { exit 1 }
    if (-not (Test-NetlifyAuth)) { exit 1 }
    
    # Execute command
    switch ($Command) {
        "local" { Start-LocalDev }
        "preview" { Start-PreviewDeploy }
        "production" { Start-ProductionDeploy }
        "automated" { Invoke-AutomatedDeploy }
        "status" { Show-Status }
        "help" { Show-Help }
        default {
            Write-Error "Unknown command: $Command"
            Show-Help
            exit 1
        }
    }
}
catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}
