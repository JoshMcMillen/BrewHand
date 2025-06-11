# BrewHand v1.0.3 - Quick Verification Script
Write-Host "BrewHand v1.0.3 - Quick Verification" -ForegroundColor Cyan
Write-Host "=================================="

# Check version
Write-Host "`nChecking package.json version..." -ForegroundColor Yellow
$package = Get-Content "package.json" | ConvertFrom-Json
Write-Host "Current version: $($package.version)" -ForegroundColor Green

# Check VSIX exists
Write-Host "`nChecking VSIX package..." -ForegroundColor Yellow
if (Test-Path ".\brewhand-1.0.3.vsix") {
    $size = (Get-Item ".\brewhand-1.0.3.vsix").Length / 1KB
    Write-Host "VSIX found: $([math]::Round($size, 1)) KB" -ForegroundColor Green
} else {
    Write-Host "VSIX not found" -ForegroundColor Red
}

# Check compilation
Write-Host "`nTesting compilation..." -ForegroundColor Yellow
try {
    npm run compile | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Compilation successful" -ForegroundColor Green
    } else {
        Write-Host "Compilation failed" -ForegroundColor Red
    }
} catch {
    Write-Host "Compilation error" -ForegroundColor Red
}

# Check key improvements
Write-Host "`nVerifying v1.0.3 improvements..." -ForegroundColor Yellow

# Check Beer Menu title
$beerMenu = $package.contributes.viewsContainers.activitybar | Where-Object { $_.title -eq "Beer Menu" }
if ($beerMenu) {
    Write-Host "Beer Menu title: OK" -ForegroundColor Green
} else {
    Write-Host "Beer Menu title: Missing" -ForegroundColor Red
}

# Check removed configurations
$hasDefaultModel = $package.contributes.configuration.properties.'brewhand.defaultModel'
$hasContinuousMode = $package.contributes.configuration.properties.'brewhand.continuousAssistanceMode'

if (-not $hasDefaultModel) {
    Write-Host "Default model removed: OK" -ForegroundColor Green
} else {
    Write-Host "Default model still present" -ForegroundColor Red
}

if (-not $hasContinuousMode) {
    Write-Host "Continuous mode removed: OK" -ForegroundColor Green
} else {
    Write-Host "Continuous mode still present" -ForegroundColor Red
}

# Check iterative support
$hasIterativeSupport = $package.contributes.configuration.properties.'brewhand.enableIterativeSupport'
if ($hasIterativeSupport) {
    Write-Host "Iterative support present: OK" -ForegroundColor Green
} else {
    Write-Host "Iterative support missing" -ForegroundColor Red
}

Write-Host "`n=================================="
Write-Host "BrewHand v1.0.3 verification complete!" -ForegroundColor Cyan

Write-Host "`nKey Changes in v1.0.3:" -ForegroundColor Yellow
Write-Host "- Simplified settings (removed budget/model UI)" -ForegroundColor Gray
Write-Host "- Unified iterative assistance mode" -ForegroundColor Gray
Write-Host "- Beer Menu branding" -ForegroundColor Gray
Write-Host "- Fixed shell syntax validation" -ForegroundColor Gray
Write-Host "- Marketplace-ready documentation" -ForegroundColor Gray

Write-Host "`nInstall command:" -ForegroundColor Yellow
Write-Host "code --install-extension brewhand-1.0.3.vsix" -ForegroundColor White
