# BrewHand Command Validation Test

## Test Scenarios

### 1. Shell Syntax Detection Test
Test prompt: "How do I install dependencies and then compile my TypeScript project?"

Expected behavior:
- ✅ Detect commands in prompt
- ✅ Apply shell-aware system prompt
- ✅ Show command detection notification
- ✅ Validate shell syntax in response
- ✅ Show PowerShell-specific syntax (`;` instead of `&&`)

### 2. Compilation Error Handling Test
Test prompt: "Run npm run compile and then start the server"

Expected behavior:
- ✅ Detect compilation commands
- ✅ Warn about compilation verification
- ✅ Include compilation error handling instructions
- ✅ Show dependency blocking logic

### 3. Import Path Resolution Test
Test prompt: "Fix TypeScript import errors in my VS Code extension"

Expected behavior:
- ✅ Detect potential import path issues
- ✅ Include import path resolution logic
- ✅ Show suggested corrections

## Manual Test Instructions

1. **Open VS Code with BrewHand extension**
2. **Open chat panel** (`Ctrl+Shift+I`)
3. **Start new chat** with `@brewhand`
4. **Test each scenario** above
5. **Verify command validation** appears in response
6. **Check shell syntax** is correct for PowerShell

## Expected Output Format

```
🚀 Using [Model Name] ([cost] premium requests)
📊 Budget: [remaining]/[limit] requests remaining

📈 Task Complexity: [level] ([score]/100)

🔧 Command Detection: Shell commands detected - applying syntax validation

## BrewHand Code Generation

[Generated code with commands]

🔧 Command Validation
✅ Command syntax validated for powershell
⚠️ Important: Verify compilation output before running dependent commands

## Quality Checklist ✓
[Quality checklist items]
```

## Shell-Specific Tests

### PowerShell (Current Environment)
- Commands should use `;` separator
- Paths should use double quotes for spaces
- Example: `cd "C:\My Project"; npm install`

### Bash/Zsh
- Commands should use `&&` separator  
- Paths should use single quotes or escaping
- Example: `cd '/my project' && npm install`

### CMD
- Commands should use `&` separator
- Paths should use double quotes
- Example: `cd "C:\My Project" & npm install`

## Configuration Tests

Test that these settings work:
- `brewhand.autoFixShellSyntax`: true/false
- `brewhand.blockOnCompileErrors`: true/false
- `brewhand.showCommandCorrections`: true/false
- `brewhand.shellDetection`: auto/powershell/cmd/bash/zsh

## Helper Commands Test

1. **Shell Detection**: Run `brewhand.detectShell`
   - Should show: "Detected Shell: powershell | Separator: ';'"

2. **Command Formatting**: Run `brewhand.formatCommand`
   - Input: `cd /path && npm install`
   - Should show: `cd "C:\path"; npm install`
   - Should copy corrected command to clipboard
