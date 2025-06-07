# BrewHand New Features Implementation Prompt

Please implement the following new features into my existing BrewHand VS Code extension. The extension already has the basic structure and naming in place.

## 1. Add Budget Management System

Create a new file `src/budgetManager.ts` with the following functionality:

### Requirements:
- Track premium request usage locally (since we can't detect actual GitHub Copilot tiers)
- Store monthly usage in VS Code workspace state
- Support configurable monthly limits and warning thresholds
- Implement budget strategies: conservative (25% usage), balanced (50%), aggressive (75%)
- Show remaining requests in status bar
- Reset usage based on configured date

### Key Methods Needed:
- `trackUsage(modelId: string, requestCost: number)` - Track after successful requests
- `canAffordModel(cost: number): boolean` - Check if budget allows model
- `getRemainingBudget(): number` - Get remaining premium requests
- `getSuggestion(): 'premium' | 'standard' | 'warning'` - Budget-based recommendation
- `resetMonthlyUsage()` - Manual reset functionality

## 2. Add Complexity Analysis Engine

Create a new file `src/complexityAnalyzer.ts` with:

### Requirements:
- Analyze prompt complexity based on multiple factors (0-100 score)
- Consider keywords, patterns, scope, and context
- Return complexity level: 'low' | 'medium' | 'high'
- Language-specific complexity adjustments

### Complexity Factors:
- **Keywords** (20% weight): Technical terms like "architecture", "scalable", "concurrent"
- **Patterns** (35% weight): Detect architecture, algorithm, security, database patterns
- **Scope** (25% weight): Function vs class vs module vs system level
- **Context** (20% weight): File size, conversation history, project structure

### Pattern Categories to Detect:
- Architecture patterns (microservices, event-driven, DDD) - weight: 90
- Algorithm patterns (optimization, data structures) - weight: 80
- Concurrency patterns (async, threading, parallelism) - weight: 85
- Security patterns (auth, encryption, validation) - weight: 75
- Simple indicators (example, demo, test) - negative weight: -30

## 3. Update Model Selection Logic

Modify the existing `selectOptimalModel` function to:

### Requirements:
- Accept `BudgetManager` instance
- Use `ComplexityAnalyzer` for task analysis
- Consider remaining budget before selecting premium models
- Implement fallback strategies based on budget status
- Return `fallbackReason` explaining model selection

### Selection Logic:
```
IF budget exhausted → Use only standard models (Claude 3.5 Sonnet, GPT-4o)
ELSE IF budget warning (>80% used) → Filter out high-cost models (>5 requests)
ELSE IF conservative strategy AND complexity != high → Prefer standard models
ELSE → Use normal model preferences
```

### Model Costs to Implement:
- Claude Opus 4: 15 requests
- Claude Sonnet 4: 5 requests
- OpenAI o3: 20 requests
- Standard models: 0 requests

## 4. Enhance Chat Handler

Update `handleBrewHandChat` function to:

### Requirements:
- Show budget information: "Using Claude Opus 4 (15 premium requests) | Budget: 35/50 remaining"
- Display complexity analysis: "Task Complexity: high (78/100)"
- Track usage AFTER successful response (not before)
- Show fallback reasons when using alternative models

## 5. Add Usage Dashboard

Create `showUsageDashboard` function that displays:

### Requirements:
- HTML webview panel with usage statistics
- Progress bar showing monthly usage percentage
- List of models used with request counts
- Budget management tips
- GitHub Copilot plan reference

### Dashboard Sections:
- Monthly summary with progress bar
- Remaining requests card
- Current strategy card
- Usage by model list
- Tips for budget management

## 6. Add Configuration Options

Add to existing package.json configuration:

```json
{
  "brewhand.budgetLimit": { type: "number", default: 50 },
  "brewhand.budgetStrategy": { enum: ["conservative", "balanced", "aggressive"] },
  "brewhand.budgetStrictMode": { type: "boolean", default: false },
  "brewhand.budgetWarningThreshold": { type: "number", default: 0.75 },
  "brewhand.budgetResetDate": { type: "number", min: 1, max: 28 },
  "brewhand.showUsageInStatusBar": { type: "boolean", default: true },
  "brewhand.showUsageNotifications": { type: "boolean", default: true }
}
```

## 7. Add New Commands

Register in activation function:
- `brewhand.showUsageDashboard` - Opens usage statistics panel
- `brewhand.resetUsage` - Resets monthly usage with confirmation

## 8. Implement Enhanced Quality Prompts

Create a smart prompt system that scales with complexity:

### Prompt Strategies:
- **Minimal** (~200 tokens): Simple tasks, low complexity
- **Minimal-Plus** (~350 tokens): Medium tasks with critical patterns
- **Balanced** (~500 tokens): Complex tasks, detailed requirements
- **Detailed** (~800 tokens): Architecture tasks, comprehensive patterns

### Selection Logic:
```
IF complexity > 70 → Use detailed (worth the tokens)
ELSE IF complexity < 30 → Use minimal
ELSE IF budget > 200 → Use balanced
ELSE → Use minimal-plus
```

### Critical Requirements to Include:
1. Custom error classes before implementation
2. Input validation for every parameter
3. Resource cleanup (finally/defer blocks)
4. No any/unknown types
5. Usage examples with error cases

### Quality Verification:
After code generation, check for quality markers:
- Error class definitions: `/class \w+Error extends Error/`
- Error usage: `/throw new \w+Error/`
- Cleanup patterns: `/finally|using|defer/`
- Input validation: `/if.*null|undefined|!valid/`

If quality markers missing and budget allows, auto-enhance using standard models.

## 9. Update Documentation

Update README.md to include:
- Clear explanation of what the extension can and cannot do
- Budget tracking is local only (not synced with GitHub)
- Configuration instructions for budget limits
- Usage dashboard documentation
- Tips for optimizing premium request usage

## Implementation Notes:

1. **Initialize managers in activation**: Create BudgetManager and ComplexityAnalyzer instances
2. **Pass managers to functions**: Update function signatures to accept manager instances
3. **Track after success**: Only track usage after successful model responses
4. **Handle errors gracefully**: All features should fail silently if models unavailable
5. **Preserve existing functionality**: New features should enhance, not break existing code

## Testing Scenarios:

1. Set budget limit to 10 and verify fallback behavior
2. Test complexity scoring with various prompts
3. Verify dashboard updates after each request
4. Test month rollover on reset date
5. Verify conservative vs aggressive strategies
6. Test quality verification and auto-enhancement

This implementation will give BrewHand intelligent budget management, complexity-aware model selection, and quality verification while being transparent about its limitations.