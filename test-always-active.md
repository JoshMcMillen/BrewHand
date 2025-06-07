# BrewHand Always Active Mode Test

## How to Make @brewhand Always Active

### 1. Toggle Always Active Mode
- **Command**: `BrewHand: Toggle Always Active Mode`
- **Keyboard**: `Ctrl+Shift+P` → search "BrewHand: Toggle Always Active"
- **Status Bar**: Click the "🍺 Beer Menu" in status bar

### 2. What Always Active Mode Does

#### ✅ **Proactive Shell Command Monitoring**
- Monitors clipboard for shell commands
- Detects PowerShell vs Bash syntax issues
- Auto-suggests using @brewhand when issues found
- Example: Detects `cd project && npm install` (wrong for PowerShell)

#### ✅ **Smart Suggestions**
- Shows suggestions when shell commands have syntax errors
- Avoids over-suggesting (30-second cooldown)
- Options: "Fix & Use @brewhand", "Just Fix", "Ignore"

#### ✅ **Terminal Activity Monitoring**
- Shows @brewhand reminders when terminal is active
- 5-minute cooldown to avoid annoyance
- Can be disabled via settings

#### ✅ **Status Bar Integration**
- Shows `🍺 Beer Menu [ACTIVE]` when always-active
- Click to toggle between active/manual modes
- Usage tracking: `(used/limit)` requests

### 3. Configuration Options

```json
{
  "brewhand.alwaysActive": true,           // Enable always-active monitoring
  "brewhand.showAutoSuggestions": true,    // Show automatic suggestions
  "brewhand.showReminders": true,          // Show periodic reminders
  "brewhand.autoModeEnabled": true,        // Show reminder in status bar
  "brewhand.monitorTerminalCommands": true // Monitor terminal for issues
}
```

### 4. Test Commands

#### Test PowerShell Syntax Detection:
```bash
# Copy this to clipboard (wrong for PowerShell):
cd "d:\AI Projects\BrewCode\BrewHand" && npm run compile

# BrewHand should suggest:
cd "d:\AI Projects\BrewCode\BrewHand"; npm run compile
```

#### Test Terminal Monitoring:
1. Open a new terminal
2. Wait 5 seconds
3. Should see reminder: "🍺 Tip: Use @brewhand in chat for shell command help"

### 5. Usage Flow

1. **Enable Always Active**: Command palette → "BrewHand: Toggle Always Active"
2. **Copy problematic command**: `cd project && npm install`
3. **Get suggestion**: "🍺 BrewHand detected shell syntax issue"
4. **Choose**: "Fix & Use @brewhand" opens chat with fixed command
5. **Chat opens**: Type `@brewhand explain this command`

### 6. Benefits

- **Proactive Help**: Catches issues before they cause errors
- **Learning**: Teaches correct shell syntax
- **Integration**: Seamlessly guides to @brewhand usage
- **Smart**: Avoids spam with intelligent cooldowns
- **Configurable**: All features can be disabled if desired

## Status: ✅ IMPLEMENTED AND TESTED
