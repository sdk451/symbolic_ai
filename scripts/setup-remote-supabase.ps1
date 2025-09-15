# PowerShell script for setting up remote Supabase connection
# This allows you to test database functions with a real Supabase instance

Write-Host "🔧 Setting up Remote Supabase Connection" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists. Backing up to .env.local.backup" -ForegroundColor Yellow
    Copy-Item ".env.local" ".env.local.backup"
}

Write-Host "📝 Please provide your Supabase project details:" -ForegroundColor Green
Write-Host ""

# Get Supabase project URL
$supabaseUrl = Read-Host "Enter your Supabase project URL (e.g., https://your-project-ref.supabase.co)"
if (-not $supabaseUrl) {
    Write-Host "❌ Supabase URL is required" -ForegroundColor Red
    exit 1
}

# Get Supabase anon key
$supabaseAnonKey = Read-Host "Enter your Supabase anon key"
if (-not $supabaseAnonKey) {
    Write-Host "❌ Supabase anon key is required" -ForegroundColor Red
    exit 1
}

# Create .env.local file
$envContent = @"
# Supabase Configuration (Remote Instance)
VITE_SUPABASE_URL=$supabaseUrl
VITE_SUPABASE_ANON_KEY=$supabaseAnonKey

# Development Configuration
VITE_APP_ENV=development
VITE_APP_DEBUG=true

# API Configuration
VITE_API_BASE_URL=http://localhost:8888/.netlify/functions
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8

Write-Host ""
Write-Host "✅ .env.local created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure your Supabase project has the 'consultation_requests' table" -ForegroundColor White
Write-Host "2. Run the migration script to create the table if needed" -ForegroundColor White
Write-Host "3. Start the development server: npm run dev" -ForegroundColor White
Write-Host "4. Test the consultation form submission" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Supabase Studio: $supabaseUrl" -ForegroundColor Blue
Write-Host ""
Write-Host "To switch back to local Supabase later, run: .\scripts\setup-local-supabase.ps1" -ForegroundColor Yellow
