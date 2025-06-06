# BrewHand Extension Test

## Testing Instructions

The BrewHand extension has been successfully packaged and installed. Here's how to test the key features:

### 1. Test Budget Management
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run command: `BrewHand: Show Usage Dashboard`
3. Verify the dashboard shows:
   - Current budget status
   - Usage statistics
   - Budget strategy settings

### 2. Test Chat Participant
1. Open Copilot Chat
2. Use the `@brewhand` participant:
   ```
   @brewhand Create a simple HTTP client with error handling
   ```
3. Verify it shows:
   - Budget information
   - Complexity analysis
   - Model selection reasoning
   - Quality-focused code generation

### 3. Test Commands
1. **Usage Dashboard**: `BrewHand: Show Usage Dashboard`
2. **Reset Usage**: `BrewHand: Reset Usage Statistics`  
3. **Configure Budget**: `BrewHand: Configure Budget`

### 4. Test Keyboard Shortcuts
1. **Enhance Code**: Select code and press `Ctrl+Shift+Q`
2. **Generate Quality Code**: Press `Ctrl+Shift+G`

### 5. Test Configuration
1. Open VS Code Settings
2. Search for "Quality First Copilot"
3. Verify all budget management settings are available:
   - Budget Limit
   - Budget Warning Threshold
   - Budget Strategy
   - Budget Strict Mode
   - etc.

## Expected Behaviors

### Budget Management
- ✅ Dashboard shows current usage (0/50 premium requests)
- ✅ Budget strategy set to "balanced" by default
- ✅ Warning threshold at 75% by default
- ✅ Usage tracking enabled

### Complexity Analysis
- ✅ Simple tasks route to included models (Claude 3.5 Sonnet)
- ✅ Complex tasks route to premium models (Claude Sonnet 4, etc.)
- ✅ Shows complexity score and reasoning

### Model Selection
- ✅ Shows selected model with cost information
- ✅ Budget-aware fallback when premium requests are low
- ✅ Language-specific model preferences

## Troubleshooting

If any features don't work:
1. Check VS Code Developer Console (`Help > Toggle Developer Tools`)
2. Look for extension activation errors
3. Verify GitHub Copilot is active and working
4. Check extension logs in Output panel

## Installation Verification

Extension successfully:
- ✅ Compiled without TypeScript errors
- ✅ Packaged into VSIX file (60.7 KB)
- ✅ Installed in VS Code
- ✅ All files included in package (14 files)
- ✅ Entry point correctly set to `out/extension.js`
- ✅ License file included
- ✅ README documentation complete
