# Test Plan: BrewHand Background Prompt Injection & Functionality

This test verifies that BrewHand correctly injects shell-aware prompts and generates proper commands.

## Test Environment
- **OS**: Windows
- **Shell**: PowerShell  
- **Date**: June 10, 2025
- **Extension Version**: 1.0.3

## 🧪 Test Cases

### Test 1: Shell Detection Accuracy
**Command**: `BrewHand: Detect Current Shell`
**Expected**: Should detect PowerShell and show separator ";"

### Test 2: Enhancement Trigger Detection
**Test Prompts**:
- ✅ "create a build script" → Should trigger enhanced mode
- ✅ "how do I run my project" → Should trigger enhanced mode  
- ✅ "generate a function" → Should trigger enhanced mode
- ❌ "fix command: cd project && npm start" → Should use simple validation

### Test 3: PowerShell System Prompt Injection
**Prompt**: "@brewhand create a build and deploy script"
**Expected Background Prompt**:
```
CRITICAL SHELL COMMAND REQUIREMENTS:

Current Environment: POWERSHELL
Command Separator: ; 
Path Quoting: "

MANDATORY COMMAND SYNTAX RULES:
1. Use ";" (semicolon) to chain commands: cmd1; cmd2; cmd3
2. NEVER use "&&" - this is bash syntax and will fail
3. Quote paths with spaces: cd "My Project"
4. Variables use $env: prefix: $env:PATH
5. Example: cd "C:\projects"; npm install; npm start

VERIFICATION CHECKLIST:
- ✅ Always use "; " for chaining commands
- ✅ Quote paths with spaces using "
- ✅ Test commands mentally for powershell compatibility
- ❌ NEVER use incorrect separators (this causes execution failures)

COMMAND EXAMPLES FOR POWERSHELL:
✅ CORRECT: cd "project folder"; npm install; npm start
✅ CORRECT: git add .; git commit -m "update"; git push
✅ CORRECT: npm run build; npm test; npm run deploy

❌ WRONG: Never mix separators from different shells
❌ WRONG: Never use unquoted paths with spaces

When providing ANY shell commands, you MUST follow these rules precisely. 
Incorrect syntax will cause user frustration and workflow interruption.

User Request: create a build and deploy script
```

### Test 4: Command Syntax Validation
**Test Commands**:
- `cd project && npm install` → Should be corrected to `cd "project"; npm install`
- `cd "My Project" && npm start` → Should be corrected to `cd "My Project"; npm start`
- `npm run build && npm test` → Should be corrected to `npm run build; npm test`

### Test 5: Response Quality Verification
**Prompt**: "@brewhand create a TypeScript build script"
**Expected Response Features**:
- ✅ Uses ";" separators for PowerShell
- ✅ Quotes paths with spaces
- ✅ Includes error handling
- ✅ Production-ready code structure
- ✅ Educational tips about PowerShell syntax

## 🔍 Manual Verification Steps

### Step 1: Install and Activate Extension
```powershell
# Check if extension is installed
code --list-extensions | findstr brewcode

# Expected output: brewcode.brewhand
```

### Step 2: Test Shell Detection
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "BrewHand: Detect Current Shell"
3. Verify it shows "PowerShell" with separator ";"

### Step 3: Test Enhanced Mode
1. Open VS Code Chat
2. Type: "@brewhand create a build script for my TypeScript project"
3. Verify response uses PowerShell syntax (`;` not `&&`)

### Step 4: Test Command Validation
1. In chat, type: "cd project && npm install"
2. Verify BrewHand suggests correction to: "cd \"project\"; npm install"

### Step 5: Configuration Verification
Check that these settings are enabled:
```json
{
  "brewhand.enhancedAIMode": true,
  "brewhand.preventIncorrectSyntax": true,
  "brewhand.autoCorrectCommands": true,
  "brewhand.includeEducationalTips": true
}
```

## 📊 Expected Results

### ✅ Success Criteria
- [ ] Shell correctly detected as PowerShell
- [ ] Enhancement triggers work for complex requests
- [ ] Background prompts inject PowerShell context
- [ ] AI generates commands with ";" separators
- [ ] Command validation catches and fixes "&&" syntax
- [ ] Educational tips appear in responses
- [ ] Status bar shows BrewHand is active

### ❌ Failure Indicators
- Shell detection shows wrong type
- AI still generates "&&" commands for PowerShell
- No educational tips in responses
- Command validation doesn't catch syntax errors
- Enhancement mode doesn't trigger for create/build requests

## 🛠️ Debugging

### If Tests Fail:
1. **Check Extension Installation**: Ensure BrewHand 1.0.3 is installed and active
2. **Verify Settings**: Confirm enhanced mode settings are enabled
3. **Check Copilot**: Ensure GitHub Copilot is active and working
4. **Review Console**: Open Developer Tools and check for errors
5. **Test Simple Commands**: Start with basic shell detection test

### Debug Commands:
```powershell
# Check VS Code version
code --version

# List all extensions
code --list-extensions

# Check if Copilot is working
# (Try regular Copilot completion in any file)
```

## 📈 Performance Metrics

Track these metrics during testing:
- **Command Accuracy**: % of commands that work without manual fixes
- **Enhancement Trigger Rate**: % of requests that correctly trigger enhanced mode
- **Syntax Error Detection**: % of syntax errors caught and corrected
- **User Satisfaction**: Subjective assessment of response quality

## 📝 Test Log Template

```
Date: ____
Tester: ____
Extension Version: ____

Test 1 - Shell Detection: PASS/FAIL
Notes: ____

Test 2 - Enhancement Triggers: PASS/FAIL  
Notes: ____

Test 3 - Prompt Injection: PASS/FAIL
Notes: ____

Test 4 - Command Validation: PASS/FAIL
Notes: ____

Test 5 - Response Quality: PASS/FAIL
Notes: ____

Overall Assessment: ____
Issues Found: ____
Recommendations: ____
```
