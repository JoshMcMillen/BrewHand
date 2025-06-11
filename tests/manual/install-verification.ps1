# Final Installation Test for BrewHand v1.0.3
Write-Host "BrewHand v1.0.3 - Final Installation Test" -ForegroundColor Cyan

# Check if VS Code is available
try {
    $vscodeVersion = code --version | Select-Object -First 1
    Write-Host "VS Code detected: $vscodeVersion" -ForegroundColor Green
} catch {
    Write-Host "VS Code not found in PATH" -ForegroundColor Red
    exit 1
}

# Check if VSIX file exists
if (-not (Test-Path ".\brewhand-1.0.3.vsix")) {
    Write-Host "VSIX file not found. Creating it..." -ForegroundColor Yellow
    npm run package
}

if (Test-Path ".\brewhand-1.0.3.vsix") {
    Write-Host "VSIX file ready for installation" -ForegroundColor Green
    
    # Show installation command
    Write-Host "`nTo install BrewHand v1.0.3:" -ForegroundColor Yellow
    Write-Host "code --install-extension brewhand-1.0.3.vsix" -ForegroundColor White
    
    # Show what to test after installation
    Write-Host "`nAfter installation, test these features:" -ForegroundColor Yellow
    Write-Host "1. Look for Beer Menu icon in activity bar" -ForegroundColor Gray
    Write-Host "2. Open Beer Menu -> Features panel" -ForegroundColor Gray  
    Write-Host "3. Toggle 'Iterative Assistance' in Quick Settings" -ForegroundColor Gray
    Write-Host "4. Try @brewhand in VS Code chat" -ForegroundColor Gray
    Write-Host "5. Test shell command: cd `"test folder`" && npm install" -ForegroundColor Gray
    Write-Host "   (Should be corrected to PowerShell syntax)" -ForegroundColor Gray
    
    Write-Host "`nBrewHand v1.0.3 is ready!" -ForegroundColor Green
} else {
    Write-Host "Failed to create VSIX file" -ForegroundColor Red
    exit 1
}
