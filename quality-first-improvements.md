# Quality-First Copilot Improvement Implementation Guide

This guide outlines the refactoring needed to implement honest budget management and improved complexity analysis for the Quality-First Copilot VS Code extension.

## 1. Create a New Budget Management System

### Create `src/budgetManager.ts`:

```typescript
// This file implements local session tracking of premium request usage
// Since we cannot detect the user's actual GitHub Copilot tier, users configure their own limits

import * as vscode from 'vscode';

interface ModelCost {
  modelId: string;
  displayName: string;
  requestCost: number;
  tier: 'premium' | 'standard';
}

interface BudgetConfig {
  monthlyLimit: number;
  warningThreshold: number;
  strictMode: boolean;
  resetDate: number;
  budgetStrategy: 'conservative' | 'balanced' | 'aggressive';
}

interface UsageData {
  usage: number;
  lastReset: string;
  byModel: Record<string, number>;
}

export class BudgetManager {
  private sessionUsage: Map<string, number> = new Map();
  private monthlyUsage: number = 0;
  private config: BudgetConfig;
  private statusBarItem: vscode.StatusBarItem;
  
  constructor(private context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.loadConfiguration();
    this.loadStoredUsage();
    this.context.subscriptions.push(this.statusBarItem);
  }
  
  private loadConfiguration() {
    const config = vscode.workspace.getConfiguration('quality-first');
    
    this.config = {
      monthlyLimit: config.get('budgetLimit', 300),
      warningThreshold: config.get('budgetWarningThreshold', 0.8),
      strictMode: config.get('budgetStrictMode', false),
      resetDate: config.get('budgetResetDate', 1),
      budgetStrategy: config.get('budgetStrategy', 'balanced')
    };
  }
  
  private loadStoredUsage() {
    const stored = this.context.workspaceState.get<UsageData>('monthlyUsage', {
      usage: 0,
      lastReset: new Date().toISOString(),
      byModel: {}
    });
    
    if (this.shouldReset(stored.lastReset)) {
      this.monthlyUsage = 0;
      this.saveUsage();
    } else {
      this.monthlyUsage = stored.usage;
    }
  }
  
  private shouldReset(lastReset: string): boolean {
    const last = new Date(lastReset);
    const now = new Date();
    
    // Check if we've passed the reset date this month
    if (now.getDate() >= this.config.resetDate && last.getDate() < this.config.resetDate) {
      return true;
    }
    
    // Check if we're in a new month
    return now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
  }
  
  async trackUsage(modelId: string, requestCost: number) {
    // Track in current session
    const current = this.sessionUsage.get(modelId) || 0;
    this.sessionUsage.set(modelId, current + requestCost);
    
    // Track monthly
    this.monthlyUsage += requestCost;
    this.saveUsage();
    
    // Show notifications at thresholds
    this.checkThresholds();
    
    // Update status bar
    this.updateStatusBar();
  }
  
  private saveUsage() {
    const data: UsageData = {
      usage: this.monthlyUsage,
      lastReset: new Date().toISOString(),
      byModel: Object.fromEntries(this.sessionUsage)
    };
    
    this.context.workspaceState.update('monthlyUsage', data);
  }
  
  private checkThresholds() {
    const percentUsed = this.monthlyUsage / this.config.monthlyLimit;
    const showNotifications = vscode.workspace.getConfiguration('quality-first').get('showUsageNotifications', true);
    
    if (!showNotifications) return;
    
    if (percentUsed >= 1 && this.monthlyUsage === this.config.monthlyLimit) {
      vscode.window.showWarningMessage('Quality-First: Monthly premium request limit reached. Using standard models only.');
    } else if (percentUsed >= 0.8 && Math.floor((this.monthlyUsage - 1) / this.config.monthlyLimit * 100) < 80) {
      vscode.window.showInformationMessage('Quality-First: 80% of monthly premium requests used.');
    } else if (percentUsed >= 0.5 && Math.floor((this.monthlyUsage - 1) / this.config.monthlyLimit * 100) < 50) {
      vscode.window.showInformationMessage('Quality-First: 50% of monthly premium requests used.');
    }
  }
  
  canAffordModel(cost: number): boolean {
    if (!this.config.strictMode) return true;
    return (this.monthlyUsage + cost) <= this.config.monthlyLimit;
  }
  
  getRemainingBudget(): number {
    return Math.max(0, this.config.monthlyLimit - this.monthlyUsage);
  }
  
  getMonthlyLimit(): number {
    return this.config.monthlyLimit;
  }
  
  getBudgetStrategy(): string {
    return this.config.budgetStrategy;
  }
  
  getSuggestion(): 'premium' | 'standard' | 'warning' {
    const percentUsed = this.monthlyUsage / this.config.monthlyLimit;
    
    if (percentUsed >= 1) return 'standard';
    if (percentUsed >= this.config.warningThreshold) return 'warning';
    return 'premium';
  }
  
  getDetailedUsage() {
    return {
      monthlyUsage: this.monthlyUsage,
      sessionUsage: Object.fromEntries(this.sessionUsage),
      byModel: Object.fromEntries(this.sessionUsage),
      resetDate: this.config.resetDate,
      strategy: this.config.budgetStrategy
    };
  }
  
  resetMonthlyUsage() {
    this.monthlyUsage = 0;
    this.sessionUsage.clear();
    this.saveUsage();
    this.updateStatusBar();
    vscode.window.showInformationMessage('Quality-First: Monthly usage reset successfully.');
  }
  
  private updateStatusBar() {
    const showInStatusBar = vscode.workspace.getConfiguration('quality-first').get('showUsageInStatusBar', true);
    
    if (!showInStatusBar) {
      this.statusBarItem.hide();
      return;
    }
    
    const remaining = this.getRemainingBudget();
    const percentUsed = (this.monthlyUsage / this.config.monthlyLimit * 100).toFixed(0);
    
    this.statusBarItem.text = `$(rocket) ${remaining} requests (${percentUsed}% used)`;
    this.statusBarItem.tooltip = `Quality-First: ${remaining} premium requests remaining this month`;
    this.statusBarItem.command = 'quality-first.showUsageDashboard';
    this.statusBarItem.show();
  }
}
```

## 2. Create Enhanced Complexity Analysis

### Create `src/complexityAnalyzer.ts`:

```typescript
import * as vscode from 'vscode';

interface ComplexityFactors {
  keywords: number;       // 0-100 based on technical term density
  patterns: number;       // 0-100 based on architecture patterns
  scope: number;         // 0-100 based on detected scope
  contextual: number;    // 0-100 based on file/project context
}

interface SemanticAnalysis {
  entities: string[];
  actions: string[];
  constraints: string[];
  scope: 'function' | 'class' | 'module' | 'system';
}

const COMPLEXITY_PATTERNS = {
  architecture: {
    patterns: [
      /\b(micro)?services?\s+architecture/i,
      /\b(event[- ]driven|message[- ]queue|pub[- ]?sub)/i,
      /\b(domain[- ]driven[- ]design|DDD|CQRS)/i,
      /\b(high[- ]availability|fault[- ]tolerant|resilient)/i,
      /\b(load[- ]balanc|distribut|scal(e|able|ing))/i
    ],
    weight: 90
  },
  algorithms: {
    patterns: [
      /\b(algorithm|data structure|complexity|big[- ]?o)/i,
      /\b(optimize|performance|efficient|cache)/i,
      /\b(recursive|dynamic programming|graph|tree)/i,
      /\b(sort|search|traverse|heap|queue)/i
    ],
    weight: 80
  },
  concurrency: {
    patterns: [
      /\b(concurrent|parallel|thread|async|await)/i,
      /\b(race condition|deadlock|mutex|semaphore)/i,
      /\b(actor model|goroutine|channel)/i,
      /\b(promise|future|coroutine)/i
    ],
    weight: 85
  },
  security: {
    patterns: [
      /\b(security|authentication|authorization|OAuth)/i,
      /\b(encrypt|decrypt|hash|salt|JWT|token)/i,
      /\b(XSS|CSRF|SQL injection|sanitize)/i,
      /\b(vulnerabilit|penetration|exploit)/i
    ],
    weight: 75
  },
  database: {
    patterns: [
      /\b(database|SQL|NoSQL|ACID|transaction)/i,
      /\b(index|query optimization|shard|partition)/i,
      /\b(replication|cluster|backup|migration)/i
    ],
    weight: 70
  },
  simple: {
    patterns: [
      /\b(simple|basic|example|demo|test|hello world)/i,
      /\b(todo|sample|tutorial|getting started)/i
    ],
    weight: -30  // Negative weight reduces complexity
  }
};

export class ComplexityAnalyzer {
  analyzeComplexity(prompt: string, context?: vscode.ChatContext): ComplexityFactors {
    return {
      keywords: this.analyzeKeywordComplexity(prompt),
      patterns: this.analyzePatternComplexity(prompt),
      scope: this.analyzeScopeComplexity(prompt),
      contextual: this.analyzeContextualComplexity(prompt, context)
    };
  }
  
  getOverallComplexity(factors: ComplexityFactors): number {
    const weights = {
      keywords: 0.2,
      patterns: 0.35,
      scope: 0.25,
      contextual: 0.2
    };
    
    return Object.entries(factors).reduce((sum, [key, value]) => 
      sum + value * weights[key as keyof ComplexityFactors], 0
    );
  }
  
  getComplexityLevel(score: number): 'low' | 'medium' | 'high' {
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
  
  private analyzeKeywordComplexity(prompt: string): number {
    const complexKeywords = [
      'architecture', 'scalable', 'distributed', 'microservice',
      'concurrent', 'parallel', 'async', 'performance',
      'security', 'encryption', 'optimization', 'algorithm',
      'design pattern', 'refactor', 'enterprise', 'production'
    ];
    
    const simpleKeywords = [
      'simple', 'basic', 'example', 'test', 'demo'
    ];
    
    let score = 50; // Base score
    
    // Add points for complex keywords
    complexKeywords.forEach(keyword => {
      if (prompt.toLowerCase().includes(keyword)) score += 10;
    });
    
    // Subtract points for simple keywords
    simpleKeywords.forEach(keyword => {
      if (prompt.toLowerCase().includes(keyword)) score -= 15;
    });
    
    return Math.min(100, Math.max(0, score));
  }
  
  private analyzePatternComplexity(prompt: string): number {
    let score = 30; // Base score
    let matchedCategories = 0;
    
    for (const [category, config] of Object.entries(COMPLEXITY_PATTERNS)) {
      const matchCount = config.patterns.filter(pattern => 
        pattern.test(prompt)
      ).length;
      
      if (matchCount > 0) {
        matchedCategories++;
        const categoryScore = (config.weight * matchCount) / config.patterns.length;
        score += categoryScore / 2; // Normalize contribution
      }
    }
    
    // Bonus for matching multiple categories (indicates complex, multi-faceted request)
    if (matchedCategories > 2) score += 20;
    
    return Math.min(100, Math.max(0, score));
  }
  
  private analyzeScopeComplexity(prompt: string): number {
    const scopeIndicators = {
      system: {
        keywords: ['system', 'architecture', 'infrastructure', 'platform', 'ecosystem'],
        score: 90
      },
      module: {
        keywords: ['module', 'package', 'library', 'api', 'service'],
        score: 70
      },
      class: {
        keywords: ['class', 'component', 'model', 'entity', 'object'],
        score: 50
      },
      function: {
        keywords: ['function', 'method', 'handler', 'utility', 'helper'],
        score: 30
      }
    };
    
    for (const [scope, config] of Object.entries(scopeIndicators)) {
      const hasIndicator = config.keywords.some(keyword => 
        prompt.toLowerCase().includes(keyword)
      );
      if (hasIndicator) return config.score;
    }
    
    return 40; // Default medium scope
  }
  
  private analyzeContextualComplexity(prompt: string, context?: vscode.ChatContext): number {
    let score = 0;
    
    // Check conversation history for building complexity
    if (context?.history && context.history.length > 0) {
      // More turns = more complex conversation
      score += Math.min(context.history.length * 5, 20);
    }
    
    // Check current file context
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const lineCount = editor.document.lineCount;
      if (lineCount > 1000) score += 30;
      else if (lineCount > 500) score += 20;
      else if (lineCount > 200) score += 10;
    }
    
    // Language-specific complexity
    const language = this.detectLanguage(prompt);
    const languageComplexity = {
      'cpp': 20,
      'rust': 20,
      'scala': 15,
      'java': 10,
      'typescript': 10,
      'python': 5,
      'javascript': 5,
      'ruby': 8
    };
    
    score += languageComplexity[language] || 0;
    
    return Math.min(100, score);
  }
  
  private detectLanguage(prompt: string): string {
    const languages = {
      'ruby': /\b(ruby|rails|gem|bundle|rake|rspec|minitest|sidekiq|devise|activerecord|erb|haml)\b/i,
      'typescript': /\b(typescript|ts|interface|type)\b/i,
      'javascript': /\b(javascript|js|node|npm|react|vue|angular)\b/i,
      'python': /\b(python|py|django|flask|fastapi|pandas|numpy)\b/i,
      'java': /\b(java|spring|maven|gradle|hibernate)\b/i,
      'csharp': /\b(c#|csharp|\.net|dotnet|asp\.net)\b/i,
      'go': /\b(golang|go)\b/i,
      'rust': /\b(rust|cargo)\b/i,
      'cpp': /\b(c\+\+|cpp|pointer|template)\b/i,
      'scala': /\b(scala|sbt|akka)\b/i
    };
    
    for (const [lang, regex] of Object.entries(languages)) {
      if (regex.test(prompt)) return lang;
    }
    
    const activeEditor = vscode.window.activeTextEditor;
    return activeEditor?.document.languageId || 'javascript';
  }
}
```

## 3. Update Model Selection Logic

### Update `quality-first-copilot-extension.ts`:

Add at the top of the file:
```typescript
import { BudgetManager } from './budgetManager';
import { ComplexityAnalyzer } from './complexityAnalyzer';

// Model cost mapping
const MODEL_COSTS = {
  'claude-opus-4': 15,
  'claude-sonnet-4': 5,
  'claude-3.7-sonnet': 8,
  'claude-3.7-sonnet-thinking': 10,
  'o3': 20,
  'o3-mini': 2,
  'o4-mini': 1,
  'o1-preview': 15,
  'o1-mini': 3,
  'o1': 10,
  'gpt-4.5': 12,
  'gpt-4.1': 3,
  'gemini-2.5-pro': 8,
  'gemini-2.0-flash': 2,
  // Standard models (no cost)
  'claude-3.5-sonnet': 0,
  'gpt-4o': 0,
  'gemini-1.5-pro': 0
};

// Global instances
let budgetManager: BudgetManager;
let complexityAnalyzer: ComplexityAnalyzer;
```

Update the `activate` function:
```typescript
export function activate(context: vscode.ExtensionContext) {
    // Initialize managers
    budgetManager = new BudgetManager(context);
    complexityAnalyzer = new ComplexityAnalyzer();
    
    // ... rest of activation code
    
    // Add new commands
    context.subscriptions.push(
        vscode.commands.registerCommand('quality-first.showUsageDashboard', () => {
            showUsageDashboard(budgetManager);
        }),
        vscode.commands.registerCommand('quality-first.resetUsage', async () => {
            const confirm = await vscode.window.showWarningMessage(
                'Reset monthly usage tracking? This will clear your local usage data.',
                'Yes', 'No'
            );
            if (confirm === 'Yes') {
                budgetManager.resetMonthlyUsage();
            }
        })
    );
}
```

Replace the `selectOptimalModel` function:
```typescript
async function selectOptimalModel(
  prompt: string, 
  budgetManager: BudgetManager,
  context?: vscode.ChatContext
): Promise<{ vendor?: string; family?: string; fallbackReason?: string }> {
  // Analyze complexity using the new analyzer
  const complexityFactors = complexityAnalyzer.analyzeComplexity(prompt, context);
  const overallComplexity = complexityAnalyzer.getOverallComplexity(complexityFactors);
  const complexityLevel = complexityAnalyzer.getComplexityLevel(overallComplexity);
  
  const taskType = analyzeTaskType(prompt);
  const language = detectLanguage(prompt);
  const languageSupport = getLanguageSupport(language);
  
  const budget = budgetManager.getRemainingBudget();
  const suggestion = budgetManager.getSuggestion();
  const strategy = budgetManager.getBudgetStrategy();
  
  // Get initial preferences based on task
  let preferredModels = getModelPreferences(taskType, complexityLevel, language);
  let fallbackReason: string | undefined;
  
  // Apply budget-aware filtering
  if (suggestion === 'standard' || budget === 0) {
    preferredModels = ['claude-3.5-sonnet', 'gpt-4o', 'gemini-1.5-pro'];
    fallbackReason = 'Monthly budget exhausted - using included models';
  } else if (suggestion === 'warning') {
    // Filter out high-cost models when budget is low
    preferredModels = preferredModels.filter(modelId => {
      const cost = MODEL_COSTS[modelId] || 0;
      return cost <= 5 || cost <= budget;
    });
    fallbackReason = `Budget conservation mode - ${budget} requests remaining`;
  }
  
  // Apply strategy-based adjustments
  if (strategy === 'conservative') {
    // Prefer standard models unless high complexity
    if (complexityLevel !== 'high') {
      preferredModels = ['claude-3.5-sonnet', 'gpt-4o', ...preferredModels];
      fallbackReason = fallbackReason || 'Conservative strategy - preserving premium requests';
    }
  } else if (strategy === 'aggressive' && budget > 0) {
    // Always try premium first (original behavior)
    // No change needed
  }
  
  // Try models in order
  for (const modelName of preferredModels) {
    const cost = MODEL_COSTS[modelName] || 0;
    
    // Check if we can afford this model
    if (cost > 0 && !budgetManager.canAffordModel(cost)) {
      continue;
    }
    
    const [vendor, family] = parseModelString(modelName);
    const selector = { vendor, family };
    
    try {
      const availableModels = await vscode.lm.selectChatModels(selector);
      if (availableModels.length > 0) {
        return { ...selector, fallbackReason };
      }
    } catch (error) {
      continue;
    }
  }
  
  // Final fallback - try any available model
  try {
    const anyModels = await vscode.lm.selectChatModels({});
    if (anyModels.length > 0) {
      return { fallbackReason: fallbackReason || 'Using any available model' };
    }
  } catch {
    // No models available
  }
  
  return { fallbackReason: 'No suitable models available' };
}

function getModelPreferences(taskType: string, complexity: 'low' | 'medium' | 'high', language: string): string[] {
  const languageSupport = getLanguageSupport(language);
  
  // Start with language-specific recommendation
  let models: string[] = [];
  if (languageSupport.recommendedModel) {
    models.push(languageSupport.recommendedModel);
  }
  
  // Add complexity-based preferences
  if (complexity === 'high' || taskType === 'architecture') {
    models.push('claude-opus-4', 'o3', 'claude-sonnet-4', 'claude-3.7-sonnet', 'gpt-4.5');
  } else if (complexity === 'medium' || taskType === 'refactoring') {
    models.push('claude-sonnet-4', 'claude-3.7-sonnet', 'gpt-4.1', 'o3-mini');
  } else {
    models.push('claude-3.5-sonnet', 'gpt-4o', 'o4-mini', 'gemini-1.5-pro');
  }
  
  // Remove duplicates while preserving order
  return [...new Set(models)];
}
```

Update the `handleQualityFirstChat` function to include budget awareness:
```typescript
async function handleQualityFirstChat(
    request: vscode.ChatRequest, 
    context: vscode.ChatContext, 
    stream: vscode.ChatResponseStream, 
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    
    // Analyze complexity first
    const complexityFactors = complexityAnalyzer.analyzeComplexity(request.prompt, context);
    const complexityScore = complexityAnalyzer.getOverallComplexity(complexityFactors);
    const complexityLevel = complexityAnalyzer.getComplexityLevel(complexityScore);
    
    // Get quality-first system prompt
    const systemPrompt = getQualityFirstSystemPrompt(request);
    
    // Select model with budget awareness
    const modelSelector = await selectOptimalModel(request.prompt, budgetManager, context);
    
    try {
        const models = await vscode.lm.selectChatModels(modelSelector);
        if (models.length === 0) {
            stream.markdown('⚠️ No suitable language model available. Please check your Copilot settings.');
            return { metadata: { command: 'quality-first' } };
        }

        const model = models[0];
        const modelInfo = getModelInfo(model);
        const cost = MODEL_COSTS[modelInfo.displayName] || modelInfo.requestMultiplier || 0;
        
        // Show budget-aware information
        const remaining = budgetManager.getRemainingBudget();
        const limit = budgetManager.getMonthlyLimit();
        const canAfford = budgetManager.canAffordModel(cost);
        
        // Display model selection info
        if (modelInfo.tier === 'premium-request' && cost > 0) {
            if (canAfford) {
                stream.markdown(`🚀 **Using ${modelInfo.displayName}** (${cost} premium requests)`);
                stream.markdown(` | 📊 **Budget**: ${remaining}/${limit} requests remaining\n\n`);
            } else {
                stream.markdown(`⚠️ **Budget limit reached** - Using standard model instead`);
                stream.markdown(` | 📊 Set a higher limit in settings if you have more requests available\n\n`);
            }
        } else {
            stream.markdown(`✨ **Using ${modelInfo.displayName}** (included model - no premium cost)`);
            if (modelSelector.fallbackReason) {
                stream.markdown(` | 💡 *${modelSelector.fallbackReason}*`);
            }
            stream.markdown(`\n\n`);
        }
        
        // Show complexity analysis
        stream.markdown(`📈 **Task Complexity**: ${complexityLevel} (${complexityScore.toFixed(0)}/100)\n\n`);
        
        // Construct messages
        const messages = [
            vscode.LanguageModelChatMessage.User(systemPrompt),
            vscode.LanguageModelChatMessage.User(request.prompt)
        ];

        // Add context
        const workspaceContext = await getWorkspaceContext();
        if (workspaceContext) {
            messages.unshift(vscode.LanguageModelChatMessage.User(
                `Project context: ${workspaceContext}`
            ));
        }

        // Send request
        const response = await model.sendRequest(messages, {}, token);
        
        stream.markdown('## Quality-First Code Generation\n\n');
        
        // Stream response
        for await (const fragment of response.text) {
            stream.markdown(fragment);
        }

        // Track usage AFTER successful response
        if (cost > 0) {
            await budgetManager.trackUsage(modelInfo.displayName, cost);
        }

        // Add quality checklist
        stream.markdown('\n\n## Quality Checklist ✓\n');
        const checklist = getQualityChecklist(modelInfo);
        checklist.forEach(item => stream.markdown(`${item}\n`));

        return { metadata: { command: 'quality-first' } };
        
    } catch (err) {
        stream.markdown(`Error: ${err instanceof Error ? err.message : String(err)}`);
        return { metadata: { command: 'quality-first' } };
    }
}
```

## 4. Add Usage Dashboard

Add this function to the extension:
```typescript
async function showUsageDashboard(budgetManager: BudgetManager) {
    const panel = vscode.window.createWebviewPanel(
        'qualityFirstUsage',
        'Quality-First Usage Dashboard',
        vscode.ViewColumn.One,
        {
            enableScripts: true
        }
    );
    
    const usage = budgetManager.getDetailedUsage();
    const remaining = budgetManager.getRemainingBudget();
    const limit = budgetManager.getMonthlyLimit();
    const percentUsed = ((limit - remaining) / limit * 100).toFixed(1);
    
    panel.webview.html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Quality-First Usage</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 20px;
                color: var(--vscode-foreground);
                background-color: var(--vscode-editor-background);
            }
            h1, h2 { color: var(--vscode-foreground); }
            .progress-container {
                background-color: var(--vscode-input-background);
                border-radius: 5px;
                padding: 3px;
                margin: 10px 0;
            }
            .progress-bar {
                background-color: var(--vscode-progressBar-background);
                height: 20px;
                border-radius: 3px;
                transition: width 0.3s ease;
            }
            .stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }
            .stat-card {
                background-color: var(--vscode-input-background);
                padding: 15px;
                border-radius: 5px;
            }
            .model-list {
                list-style: none;
                padding: 0;
            }
            .model-list li {
                padding: 5px 0;
                border-bottom: 1px solid var(--vscode-panel-border);
            }
            .tips {
                background-color: var(--vscode-textBlockQuote-background);
                padding: 15px;
                border-radius: 5px;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <h1>Quality-First Premium Request Usage</h1>
        
        <h2>Monthly Summary</h2>
        <p><strong>Used:</strong> ${limit - remaining} / ${limit} requests (${percentUsed}%)</p>
        <div class="progress-container">
            <div class="progress-bar" style="width: ${percentUsed}%"></div>
        </div>
        
        <div class="stats">
            <div class="stat-card">
                <h3>Remaining Requests</h3>
                <p style="font-size: 2em; margin: 0;">${remaining}</p>
            </div>
            <div class="stat-card">
                <h3>Strategy</h3>
                <p style="font-size: 1.2em; margin: 0;">${usage.strategy}</p>
            </div>
            <div class="stat-card">
                <h3>Reset Date</h3>
                <p style="font-size: 1.2em; margin: 0;">Day ${usage.resetDate}</p>
            </div>
        </div>
        
        ${Object.keys(usage.byModel).length > 0 ? `
        <h2>Usage by Model</h2>
        <ul class="model-list">
            ${Object.entries(usage.byModel).map(([model, count]) => 
                `<li><strong>${model}:</strong> ${count} requests</li>`
            ).join('')}
        </ul>
        ` : ''}
        
        <div class="tips">
            <h3>💡 Budget Management Tips</h3>
            <ul>
                <li>Adjust your monthly limit in VS Code settings to match your GitHub Copilot plan</li>
                <li>Change to 'conservative' strategy to preserve premium requests</li>
                <li>Use <kbd>Ctrl+Shift+Q</kbd> to enhance existing code (typically uses fewer requests)</li>
                <li>Standard models (Claude 3.5 Sonnet, GPT-4o) are included and don't count against your limit</li>
            </ul>
            
            <h3>📋 GitHub Copilot Plans</h3>
            <ul>
                <li><strong>Free:</strong> 50 premium requests/month</li>
                <li><strong>Pro:</strong> 300 premium requests/month ($10/month)</li>
                <li><strong>Pro+:</strong> 1500 premium requests/month ($39/month)</li>
                <li><strong>Business:</strong> 300 requests/user/month</li>
                <li><strong>Enterprise:</strong> 1000 requests/user/month</li>
            </ul>
        </div>
    </body>
    </html>`;
}
```

## 5. Update Configuration Schema

Update `package.json` to add new configuration options:

```json
"configuration": {
  "title": "Quality-First Copilot",
  "properties": {
    "quality-first.budgetLimit": {
      "type": "number",
      "default": 300,
      "minimum": 0,
      "markdownDescription": "Your monthly premium request limit based on your GitHub Copilot plan:\n- **Free**: 50 requests/month\n- **Pro**: 300 requests/month ($10/month)\n- **Pro+**: 1500 requests/month ($39/month)\n- **Business**: 300 requests/user/month\n- **Enterprise**: 1000 requests/user/month"
    },
    "quality-first.budgetStrategy": {
      "type": "string",
      "default": "balanced",
      "enum": ["conservative", "balanced", "aggressive"],
      "enumDescriptions": [
        "Preserve premium requests by preferring standard models for simple tasks",
        "Balance quality and budget based on task complexity",
        "Always try highest quality models first (uses requests quickly)"
      ],
      "description": "How to use your premium requests throughout the month"
    },
    "quality-first.budgetStrictMode": {
      "type": "boolean",
      "default": false,
      "description": "Prevent using models that would exceed your configured budget limit"
    },
    "quality-first.budgetWarningThreshold": {
      "type": "number",
      "default": 0.8,
      "minimum": 0.5,
      "maximum": 0.95,
      "description": "Show warning when this percentage of budget is used (0.8 = 80%)"
    },
    "quality-first.budgetResetDate": {
      "type": "number",
      "default": 1,
      "minimum": 1,
      "maximum": 28,
      "description": "Day of month when your premium requests reset"
    },
    "quality-first.showUsageInStatusBar": {
      "type": "boolean",
      "default": true,
      "description": "Show remaining premium requests in the status bar"
    },
    "quality-first.showUsageNotifications": {
      "type": "boolean",
      "default": true,
      "description": "Show notifications at 50%, 80%, and 100% usage milestones"
    },
    // Keep existing settings...
    "quality-first.defaultModel": {
      "type": "string",
      "default": "auto",
      "description": "Model preference (auto-selects best available based on complexity and budget)"
    }
  }
}
```

Also add the new commands to `package.json`:

```json
"commands": [
  // ... existing commands ...
  {
    "command": "quality-first.showUsageDashboard",
    "title": "Show Usage Dashboard",
    "category": "Quality-First"
  },
  {
    "command": "quality-first.resetUsage",
    "title": "Reset Monthly Usage",
    "category": "Quality-First"
  }
]
```

## 6. Update README.md

Replace misleading sections with honest documentation:

```markdown
# Quality-First Copilot

A VS Code extension that enhances GitHub Copilot with a "do it right the first time" philosophy, eliminating the "make it work then make it better" cycle.

## 🎯 How Budget Management Works

### What This Extension CAN Do:
- ✅ **Track your premium request usage locally** within VS Code
- ✅ **Let you configure your monthly limit** based on your GitHub Copilot plan  
- ✅ **Show remaining requests** in the status bar and dashboard
- ✅ **Intelligently select models** based on complexity and your budget settings
- ✅ **Fall back to standard models** when configured limit is reached
- ✅ **Provide usage statistics** to help you optimize your workflow

### What This Extension CANNOT Do:
- ❌ Detect your actual GitHub Copilot subscription tier
- ❌ Know your real premium request balance from GitHub
- ❌ Sync usage across different machines or VS Code instances
- ❌ Prevent you from using premium models (GitHub controls access)

## 🚀 Getting Started

### Setting Up Budget Tracking

1. **Install the extension**
2. **Open VS Code Settings** (Ctrl+Comma or Cmd+Comma)
3. **Search for "quality-first"**
4. **Set your Budget Limit** based on your GitHub Copilot plan:
   - **Free**: 50 requests/month
   - **Pro**: 300 requests/month ($10)
   - **Pro+**: 1500 requests/month ($39)
   - **Business**: 300 requests/user/month
   - **Enterprise**: 1000 requests/user/month

5. **Choose your Budget Strategy**:
   - **Conservative**: Preserves premium requests by using standard models for simple tasks
   - **Balanced**: Optimizes quality vs. cost based on task complexity
   - **Aggressive**: Always tries best models first (original behavior)

The extension tracks usage locally and helps you make informed decisions about when to use premium vs. standard models.

## 🧠 Intelligent Model Selection

The extension automatically selects the optimal model based on multiple factors:

### 1. **Task Complexity Analysis**
- **Keywords**: Technical terms and complexity indicators
- **Patterns**: Architecture, algorithms, security, concurrency patterns
- **Scope**: Function, class, module, or system-level tasks
- **Context**: File size, conversation history, and project structure

### 2. **Budget-Aware Selection**
- Tracks your usage against configured limits
- Falls back to standard models when approaching limits
- Respects your chosen strategy (conservative/balanced/aggressive)

### 3. **Model Availability**
- Tries preferred models in order
- Gracefully falls back if models are unavailable
- Always finds the best available option

## 📊 Premium Request Costs

Premium models consume requests from your monthly allowance:

| Model | Requests per Query | Best For |
|-------|-------------------|----------|
| **Claude Opus 4** | ~15-20 | Complex architecture, sustained tasks |
| **OpenAI o3** | ~20 | Advanced reasoning, complex analysis |
| **GPT-4.5** | ~12 | Improved reasoning and understanding |
| **Claude 3.7 Sonnet** | ~8 | Hybrid reasoning, complex codebases |
| **Gemini 2.5 Pro** | ~8 | Advanced reasoning, scientific tasks |
| **Claude Sonnet 4** | ~5 | Excellent coding, precise instructions |
| **GPT-4.1** | ~3 | Balanced performance and cost |
| **o3-mini** | ~2 | Fast reasoning, cost-effective |
| **o4-mini** | ~1 | Most efficient premium model |

**Standard models** (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro) are included in all plans and don't consume premium requests.

## 📈 Usage Tracking & Dashboard

### View Your Usage
- **Status Bar**: Shows remaining requests (click to open dashboard)
- **Command**: `Quality-First: Show Usage Dashboard`
- **Tracks**: Monthly usage, usage by model, reset date

### Budget Management Tips
1. **Start with Balanced strategy** - Good mix of quality and conservation
2. **Use Conservative near month end** - Preserve remaining requests
3. **Enhance existing code** (`Ctrl+Shift+Q`) - Often uses fewer requests
4. **Monitor the status bar** - Stay aware of your usage

### Important Notes
- Usage is tracked **locally per workspace**
- Not synced across machines or VS Code instances  
- Resets based on your configured reset date
- You control the limits - adjust based on your actual plan

## ✨ Features

### Quality-First Chat Participant
Use `@quality-first` in Copilot Chat for production-ready code:
```
@quality-first Create a rate-limited HTTP client with retry logic
```

The extension will:
1. Analyze task complexity
2. Check your budget settings
3. Select the best available model
4. Show which model is being used and why
5. Track usage after successful generation

[Rest of features section remains the same...]

## ⚙️ Configuration Options

### Budget Management Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `budgetLimit` | `300` | Your monthly premium request limit |
| `budgetStrategy` | `balanced` | How to use premium requests |
| `budgetStrictMode` | `false` | Prevent exceeding budget |
| `budgetWarningThreshold` | `0.8` | Warning at 80% usage |
| `budgetResetDate` | `1` | Day of month for reset |
| `showUsageInStatusBar` | `true` | Display remaining requests |
| `showUsageNotifications` | `true` | Milestone notifications |

[Rest of configuration section...]

## 🤝 Contributing

We welcome contributions! Areas for improvement:
- Better complexity analysis algorithms
- Cross-workspace usage sync
- Integration with GitHub API (when available)
- Additional model support
```

## 7. Testing Checklist

After implementing these changes, test:

1. **Budget Tracking**
   - [ ] Usage increments correctly after each request
   - [ ] Status bar updates show remaining requests
   - [ ] Monthly reset works on configured date
   - [ ] Notifications appear at thresholds

2. **Model Selection**
   - [ ] Conservative strategy prefers standard models
   - [ ] Balanced strategy scales with complexity
   - [ ] Aggressive strategy maintains current behavior
   - [ ] Fallback messages are clear and helpful

3. **Complexity Analysis**
   - [ ] Simple prompts get low scores
   - [ ] Architecture prompts get high scores
   - [ ] Multiple factors contribute to score
   - [ ] Language detection works correctly

4. **User Experience**
   - [ ] Dashboard displays usage clearly
   - [ ] Settings are well-documented
   - [ ] Error messages are helpful
   - [ ] Documentation is honest about limitations

## Implementation Order

1. Create `budgetManager.ts` and `complexityAnalyzer.ts`
2. Update extension activation and global instances
3. Modify `selectOptimalModel` with new logic
4. Update `handleQualityFirstChat` with budget awareness
5. Add new commands and dashboard
6. Update configuration in package.json
7. Rewrite README.md sections
8. Test all scenarios

This implementation provides honest, transparent budget management that actually helps users while being clear about what the extension can and cannot do.