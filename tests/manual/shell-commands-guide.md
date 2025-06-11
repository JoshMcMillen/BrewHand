# Testing BrewHand Shell Command Validation

## Test Scenarios for @brewhand

### Scenario 1: Wrong PowerShell Syntax
Ask @brewhand: "Help me fix this command: cd project && npm install && npm start"

**Expected Result:** 
- Should detect PowerShell as the shell
- Should identify that `&&` is incorrect for PowerShell
- Should provide corrected command: `cd project; npm install; npm start`
- Should offer a "Copy Fixed Command" button

### Scenario 2: Command Chain Validation
Ask @brewhand: "How do I navigate to a project and compile it?"

**Expected Result:**
- Should provide shell-specific syntax
- For PowerShell: `cd "project-name"; npm run compile; npm start`
- Should include shell syntax guide

### Scenario 3: Mixed Commands
Ask @brewhand: "cd my project && npm run compile && git add . && git commit"

**Expected Result:**
- Should detect multiple command chains
- Should fix all `&&` to `;` for PowerShell
- Should provide proper quoting for paths with spaces

### Scenario 4: General Command Help
Ask @brewhand: "What's the correct way to chain commands in my shell?"

**Expected Result:**
- Should detect PowerShell
- Should provide comprehensive syntax guide
- Should show examples specific to PowerShell

## How to Test

1. Open VS Code Chat
2. Type `@brewhand` followed by one of the test scenarios above
3. Verify that BrewHand:
   - Correctly detects your shell (PowerShell)
   - Identifies syntax issues
   - Provides corrected commands
   - Offers copy buttons for fixes
   - Shows shell-specific guidance

## Success Criteria

✅ @brewhand correctly identifies shell type
✅ @brewhand detects wrong command separators
✅ @brewhand provides corrected commands
✅ @brewhand offers copy functionality
✅ @brewhand shows shell-specific syntax guides
✅ @brewhand handles multiple commands in one request
