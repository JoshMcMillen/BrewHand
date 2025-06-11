# BrewHand Iterative Workflow Demo

Write-Host "🍺 BrewHand Iterative Workflow Demo" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "`n🎯 Testing the Enhanced Iterative Features:" -ForegroundColor Yellow

Write-Host "`n1. VERIFY EXTENSION IS ACTIVE:" -ForegroundColor Green
$extensions = code --list-extensions
if ($extensions -match "brewcode.brewhand") {
    Write-Host "   ✅ BrewHand extension is installed" -ForegroundColor Green
} else {
    Write-Host "   ❌ BrewHand extension not found" -ForegroundColor Red
    Write-Host "   Please install the extension first." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n2. NEW COMMANDS AVAILABLE:" -ForegroundColor Green
Write-Host "   The following new commands are now available in Command Palette (Ctrl+Shift+P):"
Write-Host "   - BrewHand: Toggle Iterative Support"
Write-Host "   - BrewHand: Continue Workflow"
Write-Host "   - BrewHand: Pause Workflow"
Write-Host "   - BrewHand: Show Workflow Summary"
Write-Host "   - BrewHand: Clear Workflow History"

Write-Host "`n3. ITERATIVE WORKFLOW TEST:" -ForegroundColor Green
Write-Host "   Now test the iterative functionality with this conversation flow:"
Write-Host ""
Write-Host "   📝 Open VS Code Chat (Ctrl+Shift+I or View > Chat)" -ForegroundColor Cyan
Write-Host ""
Write-Host "   🔹 Step 1: Type exactly this:" -ForegroundColor White
Write-Host "   @brewhand create a simple Express.js server with a /health endpoint"
Write-Host ""
Write-Host "   🔹 Step 2: After the response, type:" -ForegroundColor White
Write-Host "   @brewhand add JWT authentication middleware to protect routes"
Write-Host ""
Write-Host "   🔹 Step 3: Then type:" -ForegroundColor White
Write-Host "   @brewhand add comprehensive error handling and request logging"
Write-Host ""

Write-Host "`n4. WHAT TO LOOK FOR:" -ForegroundColor Yellow
Write-Host "   ✅ Response headers show step numbers (Step 1, Step 2, Step 3)"
Write-Host "   ✅ Context is maintained between requests"
Write-Host "   ✅ AI builds upon previous responses"
Write-Host "   ✅ Workflow control buttons appear (Continue, Pause, Summary)"
Write-Host "   ✅ Next step suggestions are provided"
Write-Host "   ✅ Status bar shows [ITERATIVE] or [CONTINUOUS] mode"

Write-Host "`n5. ENHANCED CONFIGURATION:" -ForegroundColor Green
Write-Host "   New settings are available in VS Code Settings (Ctrl+,):"
Write-Host "   - brewhand.enableIterativeSupport (default: true)"
Write-Host "   - brewhand.continuousAssistanceMode (default: false)"
Write-Host "   - brewhand.showIterativeSuggestions (default: true)"

Write-Host "`n6. STATUS BAR INDICATOR:" -ForegroundColor Green
Write-Host "   Look for the BrewHand status in the bottom status bar:"
Write-Host "   - 🍺 BrewHand [ITERATIVE] - Iterative support enabled"
Write-Host "   - 🍺 BrewHand [CONTINUOUS] - Continuous assistance active"
Write-Host "   - Click the status to toggle modes"

Write-Host "`n🎉 SUCCESS CRITERIA:" -ForegroundColor Cyan
Write-Host "If the iterative enhancement is working, you should see:"
Write-Host "   ✅ Context preserved across multiple @brewhand requests"
Write-Host "   ✅ AI responses build upon previous conversation"
Write-Host "   ✅ Step numbering in response headers"
Write-Host "   ✅ Workflow suggestion buttons"
Write-Host "   ✅ Next step recommendations"
Write-Host "   ✅ Maintained shell syntax awareness throughout"

Write-Host "`n🔄 CONTINUOUS MODE TEST:" -ForegroundColor Magenta
Write-Host "   To test automatic detection:"
Write-Host "   1. Make several file edits in quick succession"
Write-Host "   2. Run multiple terminal commands"
Write-Host "   3. Look for BrewHand suggestions to enable continuous mode"

Write-Host "`n🍺 Ready to test! Open VS Code and try the conversation flow above." -ForegroundColor Cyan
Write-Host "The iterative enhancement should make BrewHand much more helpful for multi-step workflows!" -ForegroundColor Green
