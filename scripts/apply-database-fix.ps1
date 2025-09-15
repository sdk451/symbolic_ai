# PowerShell script to help apply the database fix

Write-Host "=== Database Fix Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "The signup error is caused by a Row Level Security (RLS) policy issue." -ForegroundColor Yellow
Write-Host "The handle_new_user trigger can't insert into the profiles table due to RLS restrictions." -ForegroundColor Yellow
Write-Host ""
Write-Host "To fix this, you need to run the SQL fix in your Supabase dashboard:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Go to your Supabase dashboard:" -ForegroundColor White
Write-Host "   https://supabase.com/dashboard/project/dslyxxexyiqurosomytw" -ForegroundColor Blue
Write-Host ""
Write-Host "2. Click on 'SQL Editor' in the left sidebar" -ForegroundColor White
Write-Host ""
Write-Host "3. Copy the contents of scripts/fix-profiles-table.sql" -ForegroundColor White
Write-Host ""
Write-Host "4. Paste it into the SQL Editor and click 'Run'" -ForegroundColor White
Write-Host ""
Write-Host "5. You should see: 'Profiles table and trigger fixed successfully'" -ForegroundColor White
Write-Host ""
Write-Host "6. Test the signup again in your application" -ForegroundColor White
Write-Host ""

# Show the SQL content
Write-Host "=== SQL Fix Content ===" -ForegroundColor Cyan
Write-Host ""
Get-Content "scripts/fix-profiles-table.sql" | ForEach-Object {
    Write-Host $_ -ForegroundColor White
}
Write-Host ""
Write-Host "=== End of SQL Fix ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "After applying this fix, the signup should work properly!" -ForegroundColor Green
