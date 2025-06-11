# BrewHand Background Prompts Documentation

This document details the background prompts that BrewHand injects into AI requests to ensure proper shell command syntax and code quality.

## 🎯 How It Works

When you use `@brewhand`, the extension:

1. **Detects your shell environment** (PowerShell, Bash, CMD, etc.)
2. **Analyzes your request** to determine if it needs enhanced AI responses
3. **Injects shell-specific context** into the AI prompt before sending to Copilot
4. **Validates and corrects** any commands in the AI response

## 🛡️ Background System Prompt Injection

### Current Detection Logic

The system triggers enhanced responses when your prompt contains:
- **Creation keywords**: `create`, `generate`, `write`, `build`, `implement`
- **Question patterns**: `how do`, `how to`, `show me`, `example`
- **Development terms**: `script`, `function`, `class`, `component`
- **Setup operations**: `setup`, `configure`, `install`
- **Execution commands**: `deploy`, `run`, `start`, `compile`
- **Debugging terms**: `test`, `debug`, `fix`

### PowerShell System Prompt (Your Current Environment)

When you're on Windows with PowerShell, BrewHand injects this context:

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

User Request: [YOUR ACTUAL PROMPT]
```

### Bash/Zsh System Prompt (For Linux/Mac Users)

For Bash or Zsh environments, the prompt would be:

```
CRITICAL SHELL COMMAND REQUIREMENTS:

Current Environment: BASH
Command Separator: && 
Path Quoting: "

MANDATORY COMMAND SYNTAX RULES:
1. Use "&&" for conditional execution: cmd1 && cmd2 && cmd3
2. Use ";" for sequential execution: cmd1; cmd2; cmd3
3. Quote paths with spaces: cd "My Project"
4. Variables use $ prefix: $PATH
5. Example: cd "/projects" && npm install && npm start

[... similar structure ...]
```

## 🔧 Configuration Options

You can control this behavior with these settings:

```json
{
  "brewhand.enhancedAIMode": true,              // Enable enhanced responses
  "brewhand.preventIncorrectSyntax": true,     // Prevent wrong syntax generation
  "brewhand.autoCorrectCommands": true,        // Auto-validate responses
  "brewhand.includeEducationalTips": true      // Include shell tips
}
```

## 📊 Enhancement vs. Simple Validation

### Enhanced Mode (Complex Requests)
**Triggers when**: Creating code, asking how-to questions, building applications
**Process**: 
1. Inject full shell context into AI prompt
2. AI generates response with correct syntax from start
3. Validate response and correct any missed issues
4. Add educational tips

### Simple Mode (Command Validation)
**Triggers when**: Simple command syntax questions, direct command validation
**Process**:
1. Parse existing commands in your message
2. Validate syntax for current shell
3. Show corrections and reference guide
4. No AI model usage (budget-friendly)

## 🎯 Example Transformations

### Without BrewHand:
```
User: "How do I build and run my TypeScript project?"
AI: "Run: cd project && npm install && tsc && node dist/index.js"
Result: ❌ Fails in PowerShell (wrong separators)
```

### With BrewHand:
```
User: "@brewhand How do I build and run my TypeScript project?"
System injects PowerShell context →
AI: "Run: cd "project"; npm install; tsc; node dist/index.js"
Result: ✅ Works immediately in PowerShell
```

## 🧪 Testing the Background Prompts

To see the exact prompts being generated, you can:

1. **Enable debug mode** (if available)
2. **Check the source code** in `src/aiResponseEnhancer.ts`
3. **Use the test files** in this repository
4. **Monitor VS Code Developer Tools** for API calls

## 📝 Implementation Files

- **`src/aiResponseEnhancer.ts`** - Main prompt injection logic
- **`src/shellDetector.ts`** - Shell environment detection
- **`src/brewhand-extension.ts`** - Decision logic for when to enhance
- **`src/commandValidator.ts`** - Post-response validation
