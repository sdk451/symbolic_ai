# PowerShell script to run comprehensive system tests
# This script starts the development servers and runs all tests

Write-Host "🚀 Starting Development Environment Test Suite" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Function to log with timestamp
function Write-Log {
    param(
        [string]$Level,
        [string]$Message
    )
    $timestamp = Get-Date -Format "HH:mm:ss.fff"
    $color = switch ($Level) {
        "INFO" { "Blue" }
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        "TEST" { "Cyan" }
        default { "White" }
    }
    Write-Host "[$timestamp] $Level`: $Message" -ForegroundColor $color
}

# Step 1: Check if Node.js is available
Write-Log "INFO" "Checking Node.js installation..."
try {
    $nodeVersion = node --version
    Write-Log "SUCCESS" "Node.js version: $nodeVersion"
} catch {
    Write-Log "ERROR" "Node.js is not installed or not in PATH"
    exit 1
}

# Step 2: Check if npm is available
Write-Log "INFO" "Checking npm installation..."
try {
    $npmVersion = npm --version
    Write-Log "SUCCESS" "npm version: $npmVersion"
} catch {
    Write-Log "ERROR" "npm is not installed or not in PATH"
    exit 1
}

# Step 3: Start development servers in background
Write-Log "INFO" "Starting development servers..."
$devProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev:full" -PassThru -NoNewWindow

# Step 4: Wait for servers to start
Write-Log "INFO" "Waiting for servers to initialize..."
Start-Sleep -Seconds 15

# Step 5: Check if servers are running
Write-Log "INFO" "Checking if servers are running..."

# Check Vite server (port 3000)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Log "SUCCESS" "Vite dev server is running on port 3000"
} catch {
    Write-Log "WARNING" "Vite dev server may not be ready yet"
}

# Check Netlify dev server (port 8888)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888/.netlify/functions/" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Log "SUCCESS" "Netlify dev server is running on port 8888"
} catch {
    Write-Log "WARNING" "Netlify dev server may not be ready yet"
}

# Step 6: Run comprehensive tests
Write-Log "INFO" "Running comprehensive system tests..."
try {
    node test-system.js
    $testResult = $LASTEXITCODE
} catch {
    Write-Log "ERROR" "Failed to run tests: $_"
    $testResult = 1
}

# Step 7: Clean up
Write-Log "INFO" "Cleaning up development servers..."
try {
    Stop-Process -Id $devProcess.Id -Force -ErrorAction SilentlyContinue
    Write-Log "SUCCESS" "Development servers stopped"
} catch {
    Write-Log "WARNING" "Could not stop development servers cleanly"
}

# Step 8: Report results
if ($testResult -eq 0) {
    Write-Log "SUCCESS" "🎉 All tests passed! System is working correctly."
    exit 0
} else {
    Write-Log "ERROR" "⚠️  Some tests failed. Check the output above."
    exit 1
}
