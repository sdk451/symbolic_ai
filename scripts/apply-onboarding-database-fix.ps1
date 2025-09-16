# PowerShell script to help apply the onboarding database fix

Write-Host "=== Onboarding Database Fix Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will help you apply the database fix for the onboarding process." -ForegroundColor Yellow
Write-Host "The fix includes:" -ForegroundColor Yellow
Write-Host "  - Basic profiles table fixes (RLS policies)" -ForegroundColor White
Write-Host "  - Persona fields (persona_segment, onboarding_completed, organization_name, organization_size)" -ForegroundColor White
Write-Host "  - Proper constraints and indexes" -ForegroundColor White
Write-Host "  - Updated handle_new_user trigger" -ForegroundColor White
Write-Host ""
Write-Host "To apply this fix, you need to run the SQL in your Supabase dashboard:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Go to your Supabase dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/dslyxxexyiqurosomytw" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Click on 'SQL Editor' in the left sidebar" -ForegroundColor White
Write-Host ""
Write-Host "3. Copy the contents of scripts/apply-onboarding-database-fix.sql" -ForegroundColor White
Write-Host ""
Write-Host "4. Paste it into the SQL Editor and click 'Run'" -ForegroundColor White
Write-Host ""
Write-Host "5. You should see: 'Database fix applied successfully!'" -ForegroundColor White
Write-Host ""
Write-Host "6. Test the onboarding process again in your application" -ForegroundColor White
Write-Host ""

# Ask if user wants to see the SQL content
$showSQL = Read-Host "Do you want to see the SQL content? (y/n)"
if ($showSQL -eq "y" -or $showSQL -eq "Y") {
    Write-Host ""
    Write-Host "=== SQL Fix Content ===" -ForegroundColor Cyan
    Write-Host ""
    Get-Content "scripts/apply-onboarding-database-fix.sql" | ForEach-Object {
        Write-Host $_ -ForegroundColor White
    }
    Write-Host ""
    Write-Host "=== End of SQL Fix ===" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "After applying this fix, the onboarding process should work properly!" -ForegroundColor Green
Write-Host ""
Write-Host "The onboarding flow will now be able to:" -ForegroundColor Green
Write-Host "  ✓ Create user profiles with persona fields" -ForegroundColor White
Write-Host "  ✓ Update profiles during onboarding completion" -ForegroundColor White
Write-Host "  ✓ Redirect users to their personalized dashboard" -ForegroundColor White
Write-Host ""