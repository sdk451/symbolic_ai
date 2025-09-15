# PowerShell script to diagnose Supabase connection issues

Write-Host "=== Supabase Connection Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file exists" -ForegroundColor Green
    Write-Host ""
    Write-Host "Current environment variables:" -ForegroundColor Yellow
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "VITE_SUPABASE_URL") {
            $url = $_.Split("=")[1]
            if ($url -eq "https://your-project-ref.supabase.co") {
                Write-Host "❌ VITE_SUPABASE_URL: $url (PLACEHOLDER - NOT REAL)" -ForegroundColor Red
            } else {
                Write-Host "✅ VITE_SUPABASE_URL: $url" -ForegroundColor Green
            }
        }
        if ($_ -match "VITE_SUPABASE_ANON_KEY") {
            $key = $_.Split("=")[1]
            if ($key.Length -lt 50) {
                Write-Host "❌ VITE_SUPABASE_ANON_KEY: $key (TOO SHORT - INVALID)" -ForegroundColor Red
            } else {
                Write-Host "✅ VITE_SUPABASE_ANON_KEY: $key (Length: $($key.Length))" -ForegroundColor Green
            }
        }
    }
} else {
    Write-Host "❌ .env.local file does not exist" -ForegroundColor Red
    Write-Host ""
    Write-Host "To fix this, run one of these commands:" -ForegroundColor Yellow
    Write-Host "1. .\scripts\setup-remote-supabase.ps1 (for remote Supabase)" -ForegroundColor White
    Write-Host "2. .\scripts\setup-local-supabase.ps1 (for local Supabase)" -ForegroundColor White
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Cyan
Write-Host "1. If you see placeholder values above, you need to set up real Supabase credentials" -ForegroundColor Yellow
Write-Host "2. If you don't have a Supabase project yet, create one at https://supabase.com" -ForegroundColor Yellow
Write-Host "3. Get your project URL and anon key from your Supabase dashboard" -ForegroundColor Yellow
Write-Host "4. Run .\scripts\setup-remote-supabase.ps1 and enter your real credentials" -ForegroundColor Yellow
Write-Host ""
Write-Host "=== Testing Connection ===" -ForegroundColor Cyan
Write-Host "After setting up credentials, test the connection by:" -ForegroundColor Yellow
Write-Host "1. Opening the website in your browser" -ForegroundColor White
Write-Host "2. Opening browser console (F12)" -ForegroundColor White
Write-Host "3. Trying to sign up" -ForegroundColor White
Write-Host "4. Check console for error messages" -ForegroundColor White
