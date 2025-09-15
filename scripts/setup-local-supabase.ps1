# PowerShell script for setting up local Supabase connection
# This sets up the environment for local Supabase development

Write-Host "🏠 Setting up Local Supabase Connection" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local already exists
if (Test-Path ".env.local") {
    Write-Host "⚠️  .env.local already exists. Backing up to .env.local.backup" -ForegroundColor Yellow
    Copy-Item ".env.local" ".env.local.backup"
}

# Create .env.local file for local Supabase
$envContent = @"
# Supabase Configuration (Local Instance)
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Development Configuration
VITE_APP_ENV=development
VITE_APP_DEBUG=true

# API Configuration
VITE_API_BASE_URL=http://localhost:8888/.netlify/functions
"@

$envContent | Out-File -FilePath ".env.local" -Encoding utf8

Write-Host "✅ .env.local created for local Supabase!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Make sure Docker Desktop is running" -ForegroundColor White
Write-Host "2. Start Supabase: npx supabase start" -ForegroundColor White
Write-Host "3. Apply migrations: npx supabase db reset" -ForegroundColor White
Write-Host "4. Start the development server: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Local Supabase Studio: http://localhost:54323" -ForegroundColor Blue
Write-Host ""
Write-Host "To switch to remote Supabase, run: .\scripts\setup-remote-supabase.ps1" -ForegroundColor Yellow
