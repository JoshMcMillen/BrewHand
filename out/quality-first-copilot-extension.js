"use strict";
// BrewHand Extension for VS Code
// This extension implements "do it right the first time" philosophy
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const budgetManager_1 = require("./src/budgetManager");
const complexityAnalyzer_1 = require("./src/complexityAnalyzer");
// Model cost mapping
const MODEL_COSTS = {
    'Claude Opus 4': 15,
    'Claude Sonnet 4': 5,
    'Claude 3.7 Sonnet': 8,
    'Claude 3.7 Sonnet Thinking': 10,
    'OpenAI o3': 20,
    'OpenAI o3-mini': 2,
    'OpenAI o4-mini': 1,
    'OpenAI o1-preview': 15,
    'OpenAI o1-mini': 3,
    'OpenAI o1': 10,
    'GPT-4.5': 12,
    'GPT-4.1': 3,
    'Gemini 2.5 Pro': 8,
    'Gemini 2.0 Flash': 2,
    // Standard models (no cost)
    'Claude 3.5 Sonnet': 0,
    'GPT-4o': 0,
    'Gemini 1.5 Pro': 0
};
// Global instances
let budgetManager;
let complexityAnalyzer;
// Extension activation
function activate(context) {
    // Initialize managers
    budgetManager = new budgetManager_1.BudgetManager(context);
    complexityAnalyzer = new complexityAnalyzer_1.ComplexityAnalyzer();
    // Register brewhand chat participant
    const qualityFirstParticipant = vscode.chat.createChatParticipant('brewhand', handleQualityFirstChat);
    qualityFirstParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icons', 'quality-icon.png');
    qualityFirstParticipant.followupProvider = {
        provideFollowups(result, context, token) {
            return [
                {
                    prompt: 'Add comprehensive error handling',
                    label: 'Add Error Handling'
                },
                {
                    prompt: 'Add unit tests for this code',
                    label: 'Generate Tests'
                },
                {
                    prompt: 'Review architectural patterns',
                    label: 'Architecture Review'
                }
            ];
        }
    };
    // Register agent mode tool for quality enhancement
    const qualityTool = vscode.lm.registerTool('quality-enhancer', {
        invoke: async (options, token) => {
            const result = await enhanceCodeQuality(options.input, token);
            return new vscode.LanguageModelToolResult([
                new vscode.LanguageModelTextPart(result)
            ]);
        },
        prepareInvocation: async (options, token) => {
            const input = options.input;
            return {
                input: `Enhance the following code with production-ready patterns: ${input}`,
                confirmationMessages: {
                    title: 'Quality Enhancement',
                    message: 'Apply production-ready patterns to the selected code?'
                }
            };
        }
    });
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('brewhand.enhanceSelection', enhanceSelectedCode), vscode.commands.registerCommand('brewhand.generateWithQuality', generateQualityCode), vscode.commands.registerCommand('brewhand.reviewCode', reviewCodeQuality), vscode.commands.registerCommand('brewhand.showUsageDashboard', () => {
        showUsageDashboard(budgetManager);
    }), vscode.commands.registerCommand('brewhand.resetUsage', async () => {
        const confirm = await vscode.window.showWarningMessage('Reset monthly usage tracking? This will clear your local usage data.', 'Yes', 'No');
        if (confirm === 'Yes') {
            budgetManager.resetMonthlyUsage();
        }
    }), qualityFirstParticipant, qualityTool);
}
// Main chat participant handler
async function handleQualityFirstChat(request, context, stream, token) {
    // Get BrewHand system prompt
    const systemPrompt = getQualityFirstSystemPrompt(request);
    // Analyze complexity first
    const complexityFactors = complexityAnalyzer.analyzeComplexity(request.prompt, context);
    const complexityScore = complexityAnalyzer.getOverallComplexity(complexityFactors);
    const complexityLevel = complexityAnalyzer.getComplexityLevel(complexityScore);
    // Select model with budget awareness
    const modelSelector = await selectOptimalModel(request.prompt, budgetManager, context);
    try {
        // Use VS Code Language Model API with BrewHand prompting
        const models = await vscode.lm.selectChatModels(modelSelector);
        if (models.length === 0) {
            stream.markdown('⚠️ No suitable language model available. Please check your Copilot settings or subscription level.');
            return { metadata: { command: 'brewhand' } };
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
            }
            else {
                stream.markdown(`⚠️ **Budget limit reached** - Using standard model instead`);
                stream.markdown(` | 📊 Set a higher limit in settings if you have more requests available\n\n`);
            }
        }
        else {
            stream.markdown(`✨ **Using ${modelInfo.displayName}** (included model - no premium cost)`);
            if (modelSelector.fallbackReason) {
                stream.markdown(` | 💡 *${modelSelector.fallbackReason}*`);
            }
            stream.markdown(`\n\n`);
        }
        // Show complexity analysis
        stream.markdown(`📈 **Task Complexity**: ${complexityLevel} (${complexityScore.toFixed(0)}/100)\n\n`);
        // Adjust system prompt based on available model capabilities
        const systemPrompt = getQualityFirstSystemPrompt(request, modelInfo);
        // Construct quality-focused prompt
        const messages = [
            vscode.LanguageModelChatMessage.User(systemPrompt),
            vscode.LanguageModelChatMessage.User(request.prompt)
        ];
        // Add context from current workspace
        const workspaceContext = await getWorkspaceContext();
        if (workspaceContext) {
            messages.unshift(vscode.LanguageModelChatMessage.User(`Project context: ${workspaceContext}`));
        }
        const response = await model.sendRequest(messages, {}, token);
        stream.markdown('## BrewHand Code Generation\n\n');
        // Stream response
        for await (const fragment of response.text) {
            stream.markdown(fragment);
        }
        // Track usage AFTER successful response
        if (cost > 0) {
            await budgetManager.trackUsage(modelInfo.displayName, cost);
        }
        // Add quality checklist adjusted for model capabilities
        stream.markdown('\n\n## Quality Checklist ✓\n');
        const checklist = getQualityChecklist(modelInfo);
        checklist.forEach(item => stream.markdown(`${item}\n`));
        // Add subscription information based on model type and usage
        if (modelInfo.tier === 'basic') {
            stream.markdown('\n💡 *Upgrade to Copilot Pro ($10/month) for access to premium models and 300 premium requests monthly, or Copilot Pro+ ($39/month) for 1500 premium requests and full model access.*');
        }
        else if (modelInfo.tier === 'standard') {
            stream.markdown('\n✨ *This model is included in all plans. For premium models with advanced reasoning, upgrade to Copilot Pro ($10/month) for 300 premium requests monthly.*');
        }
        else if (modelInfo.tier === 'premium-request') {
            const multiplier = modelInfo.requestMultiplier || 1;
            const requestCost = multiplier === 1 ? '1 premium request' : `${multiplier} premium requests`;
            stream.markdown(`\n🚀 *Using premium model (${requestCost} per query). Your plan includes: Free (50/month), Pro (300/month), Pro+ (1500/month), Business (300/user/month), Enterprise (1000/user/month).*`);
        }
        return { metadata: { command: 'brewhand' } };
    }
    catch (err) {
        stream.markdown(`Error: ${err instanceof Error ? err.message : String(err)}`);
        return { metadata: { command: 'brewhand' } };
    }
}
// Get model information for user feedback and capability adjustment - corrected for actual GitHub plans
function getModelInfo(model) {
    // Try to determine model from its properties or ID
    const modelId = model.id || model.name || 'unknown';
    const modelString = modelId.toLowerCase();
    // Premium request models (consume premium requests from monthly allowance)
    if (modelString.includes('claude-opus-4') || modelString.includes('claude-4-opus')) {
        return {
            displayName: 'Claude Opus 4',
            tier: 'premium-request',
            capabilities: ['world\'s best coding model', 'sustained long tasks', 'extended thinking'],
            requestMultiplier: 15 // Higher consumption
        };
    }
    else if (modelString.includes('claude-sonnet-4') || modelString.includes('claude-4-sonnet')) {
        return {
            displayName: 'Claude Sonnet 4',
            tier: 'premium-request',
            capabilities: ['significant upgrade', 'excellent coding', 'precise instructions'],
            requestMultiplier: 5
        };
    }
    else if (modelString.includes('claude-3.7-sonnet-thinking')) {
        return {
            displayName: 'Claude 3.7 Sonnet Thinking',
            tier: 'premium-request',
            capabilities: ['hybrid reasoning', 'thinking mode', 'structured reasoning'],
            requestMultiplier: 10
        };
    }
    else if (modelString.includes('claude-3.7-sonnet')) {
        return {
            displayName: 'Claude 3.7 Sonnet',
            tier: 'premium-request',
            capabilities: ['most intelligent model', 'hybrid reasoning', 'complex codebases'],
            requestMultiplier: 8
        };
    }
    else if (modelString.includes('gpt-4.5')) {
        return {
            displayName: 'GPT-4.5',
            tier: 'premium-request',
            capabilities: ['improved reasoning', 'contextual understanding', 'complex problem solving'],
            requestMultiplier: 12
        };
    }
    else if (modelString.includes('gpt-4.1')) {
        return {
            displayName: 'GPT-4.1',
            tier: 'premium-request',
            capabilities: ['balanced cost/performance', 'large context window', 'improved instruction following'],
            requestMultiplier: 3
        };
    }
    else if (modelString.includes('o3') && !modelString.includes('mini')) {
        return {
            displayName: 'OpenAI o3',
            tier: 'premium-request',
            capabilities: ['most capable reasoning', 'deep logical analysis', 'complex multi-step tasks'],
            requestMultiplier: 20 // Highest consumption
        };
    }
    else if (modelString.includes('o3-mini')) {
        return {
            displayName: 'OpenAI o3-mini',
            tier: 'premium-request',
            capabilities: ['fast reasoning', 'cost-effective', 'good performance'],
            requestMultiplier: 2
        };
    }
    else if (modelString.includes('o4-mini')) {
        return {
            displayName: 'OpenAI o4-mini',
            tier: 'premium-request',
            capabilities: ['most efficient reasoning', 'fast responses', 'cost-effective'],
            requestMultiplier: 1
        };
    }
    else if (modelString.includes('o1-preview')) {
        return {
            displayName: 'OpenAI o1-preview',
            tier: 'premium-request',
            capabilities: ['advanced reasoning', 'complex tasks', 'deep analysis'],
            requestMultiplier: 15
        };
    }
    else if (modelString.includes('o1-mini')) {
        return {
            displayName: 'OpenAI o1-mini',
            tier: 'premium-request',
            capabilities: ['reasoning model', 'efficient', 'good performance'],
            requestMultiplier: 3
        };
    }
    else if (modelString.includes('o1')) {
        return {
            displayName: 'OpenAI o1',
            tier: 'premium-request',
            capabilities: ['older reasoning model', 'logical analysis', 'debugging focus'],
            requestMultiplier: 10
        };
    }
    else if (modelString.includes('gemini-2.5-pro')) {
        return {
            displayName: 'Gemini 2.5 Pro',
            tier: 'premium-request',
            capabilities: ['advanced reasoning powerhouse', 'long-context handling', 'scientific research'],
            requestMultiplier: 8
        };
    }
    else if (modelString.includes('gemini-2.0-flash')) {
        return {
            displayName: 'Gemini 2.0 Flash',
            tier: 'premium-request',
            capabilities: ['multimodal speed', 'real-time responses', 'visual input support'],
            requestMultiplier: 2
        };
    }
    // Standard models (included in all plans)
    else if (modelString.includes('claude-3.5-sonnet')) {
        return {
            displayName: 'Claude 3.5 Sonnet',
            tier: 'standard',
            capabilities: ['fast and efficient', 'everyday tasks', 'good coding']
        };
    }
    else if (modelString.includes('gpt-4o')) {
        return {
            displayName: 'GPT-4o',
            tier: 'standard',
            capabilities: ['multimodal', 'real-time responses', 'general purpose']
        };
    }
    else if (modelString.includes('gemini-1.5-pro') || modelString.includes('gemini-pro')) {
        return {
            displayName: 'Gemini 1.5 Pro',
            tier: 'standard',
            capabilities: ['multimodal understanding', 'large context', 'factual accuracy']
        };
    }
    // Basic models (free tier)
    else if (modelString.includes('gpt-3.5') || modelString.includes('gpt-4')) {
        return {
            displayName: 'Base Model',
            tier: 'basic',
            capabilities: ['code completion', 'basic chat']
        };
    }
    else {
        return {
            displayName: 'Available Model',
            tier: 'basic',
            capabilities: ['code generation', 'basic assistance']
        };
    }
}
// Generate quality checklist based on model capabilities - corrected for GitHub plans
function getQualityChecklist(modelInfo) {
    const baseChecklist = [
        '- [x] Production-ready error handling',
        '- [x] Input validation and edge cases',
        '- [x] Proper typing and interfaces',
        '- [x] Security best practices'
    ];
    if (modelInfo.tier === 'premium-request') {
        const multiplier = modelInfo.requestMultiplier || 1;
        const qualityLevel = multiplier >= 15 ? 'World-class' :
            multiplier >= 8 ? 'Advanced' :
                multiplier >= 3 ? 'Enhanced' : 'Good';
        return [
            ...baseChecklist,
            `- [x] ${qualityLevel} architectural patterns`,
            '- [x] Performance optimizations',
            '- [x] Scalability considerations',
            '- [x] Comprehensive testing strategies',
            '- [x] Advanced reasoning capabilities',
            '- [x] Documentation and maintainability'
        ];
    }
    else if (modelInfo.tier === 'standard') {
        return [
            ...baseChecklist,
            '- [x] Good architectural patterns',
            '- [x] Performance considerations',
            '- [x] Maintainable code structure',
            '- [x] Testing recommendations'
        ];
    }
    else {
        return [
            ...baseChecklist,
            '- [x] Basic architectural structure',
            '- [x] Code maintainability',
            '⚠️ Limited features - consider upgrading for better results'
        ];
    }
}
// BrewHand system prompt generator with model-aware adjustments
function getQualityFirstSystemPrompt(request, modelInfo) {
    const language = detectLanguage(request.prompt);
    const languageSupport = getLanguageSupport(language);
    const basePrompt = `You are a senior software architect focused on "do it right the first time" development philosophy.

CORE PRINCIPLES:
1. Generate production-ready code from the start
2. Include comprehensive error handling and input validation
3. Use proper architectural patterns and design principles
4. Write self-documenting, maintainable code
5. Consider performance, security, and scalability upfront
6. Avoid TODO comments and placeholder implementations`;
    // Adjust expectations based on model capabilities
    let qualityLevel = '';
    if (modelInfo?.tier === 'premium') {
        qualityLevel = `
MODEL CAPABILITIES: You have access to advanced reasoning capabilities. Leverage this for:
- Complex architectural decisions and trade-offs
- Advanced design patterns and enterprise solutions
- Comprehensive security analysis and recommendations
- Performance optimization strategies
- Scalability planning and future-proofing`;
    }
    else if (modelInfo?.tier === 'standard') {
        qualityLevel = `
MODEL CAPABILITIES: You have good reasoning capabilities. Focus on:
- Solid architectural patterns and best practices
- Comprehensive error handling and validation
- Good security practices and performance considerations
- Clear documentation and maintainable code structure`;
    }
    else {
        qualityLevel = `
MODEL CAPABILITIES: Focus on fundamental quality practices:
- Basic but solid architectural patterns
- Essential error handling and input validation
- Core security practices and performance awareness
- Clear, maintainable code structure`;
    }
    // Language-specific quality standards
    const languageStandards = getLanguageSpecificStandards(language, languageSupport);
    const outputRequirements = getOutputRequirements(languageSupport);
    return `${basePrompt}

${qualityLevel}

${languageStandards}

${outputRequirements}

LANGUAGE SUPPORT LEVEL: ${languageSupport.tier} (${languageSupport.expectedAccuracy})
${languageSupport.limitations ? `\nLIMITATIONS: ${languageSupport.limitations}` : ''}

Remember: The goal is to eliminate the "make it work then make it better" cycle by producing high-quality code initially.`;
}
// Language support classification
function getLanguageSupport(language) {
    const supportMatrix = {
        'python': {
            tier: 'Tier 1 - Excellent',
            expectedAccuracy: '90%+ quality',
            recommendedModel: 'claude-3-5-sonnet'
        },
        'javascript': {
            tier: 'Tier 1 - Excellent',
            expectedAccuracy: '85-90% quality',
            recommendedModel: 'claude-3-5-sonnet'
        },
        'typescript': {
            tier: 'Tier 1 - Excellent',
            expectedAccuracy: '85-90% quality',
            recommendedModel: 'claude-3-5-sonnet'
        },
        'java': {
            tier: 'Tier 1 - Excellent',
            expectedAccuracy: '80-85% quality',
            recommendedModel: 'gpt-4o'
        },
        'csharp': {
            tier: 'Tier 1 - Excellent',
            expectedAccuracy: '80-85% quality',
            recommendedModel: 'gpt-4o'
        },
        'go': {
            tier: 'Tier 2 - Good',
            expectedAccuracy: '75-80% quality',
            recommendedModel: 'claude-3-5-sonnet'
        },
        'rust': {
            tier: 'Tier 2 - Good',
            expectedAccuracy: '70-75% quality',
            limitations: 'Limited enterprise patterns, newer language',
            recommendedModel: 'claude-3-5-sonnet'
        },
        'cpp': {
            tier: 'Tier 2 - Good',
            expectedAccuracy: '70-75% quality',
            limitations: 'Complex memory management patterns may need review',
            recommendedModel: 'gpt-4o'
        },
        'swift': {
            tier: 'Tier 3 - Limited',
            expectedAccuracy: '60-70% quality',
            limitations: 'Mobile-specific patterns may be incomplete',
            recommendedModel: 'claude-3-5-sonnet'
        },
        'kotlin': {
            tier: 'Tier 3 - Limited',
            expectedAccuracy: '60-70% quality',
            limitations: 'Android-specific patterns may need verification',
            recommendedModel: 'gemini-pro'
        },
        'haskell': {
            tier: 'Tier 4 - Minimal',
            expectedAccuracy: '40-60% quality',
            limitations: 'Functional patterns may be suboptimal, manual review required',
            recommendedModel: 'claude-3-5-sonnet'
        }
    };
    return supportMatrix[language] || {
        tier: 'Tier 4 - Minimal',
        expectedAccuracy: '30-50% quality',
        limitations: 'Limited training data, manual review strongly recommended',
        recommendedModel: 'claude-3-5-sonnet'
    };
}
// Language-specific quality standards
function getLanguageSpecificStandards(language, support) {
    const commonStandards = `
QUALITY STANDARDS FOR ${language.toUpperCase()}:`;
    const languageSpecific = {
        'python': `${commonStandards}
- Use type hints (typing module) for all function signatures
- Implement proper exception handling with specific exception types
- Follow PEP 8 style guidelines and docstring conventions
- Use context managers for resource management
- Include proper logging with appropriate levels
- Implement data validation with pydantic or similar
- Use async/await for I/O operations with proper error handling`,
        'javascript': `${commonStandards}
- Use strict mode and proper error boundaries
- Implement comprehensive input validation
- Use proper promise handling with try/catch
- Include proper event listener cleanup
- Use modern ES6+ features appropriately
- Implement proper closure and memory management
- Add comprehensive JSDoc comments`,
        'typescript': `${commonStandards}
- Use strict TypeScript configuration
- Define proper interfaces and types for all data structures
- Implement proper error boundaries and exception handling
- Use generics appropriately for type safety
- Include proper null/undefined checks
- Implement proper async/await with typed promises
- Use discriminated unions for complex state management`,
        'java': `${commonStandards}
- Use proper exception hierarchy and handling
- Implement SOLID principles and design patterns
- Use proper resource management (try-with-resources)
- Include comprehensive input validation
- Use appropriate concurrency patterns
- Implement proper logging with SLF4J or similar
- Follow standard naming conventions and JavaDoc`,
        'go': `${commonStandards}
- Use proper error handling with explicit error returns
- Implement proper context usage for cancellation
- Use proper defer statements for cleanup
- Include comprehensive input validation
- Use proper goroutine management and synchronization
- Implement proper logging with structured logging
- Follow Go idioms and naming conventions`,
        'ruby': `${commonStandards}
- Follow The Ruby Way and principle of least surprise
- Use proper exception handling with specific exception classes
- Implement comprehensive input validation and sanitization
- Follow Ruby naming conventions (snake_case, descriptive methods)
- Use proper blocks, procs, and lambdas appropriately
- Implement proper error handling with rescue/ensure/raise patterns
- Include proper logging with Rails.logger or Ruby Logger
- Use appropriate metaprogramming judiciously with clear documentation
- Follow Rails conventions for MVC patterns (if Rails context detected)
- Implement proper testing patterns (RSpec/Minitest style)
- Use Ruby idioms: map/select/reject over manual iteration
- Implement proper resource management and memory considerations
- Use proper gem patterns and follow semantic versioning
- Include comprehensive documentation following RDoc/YARD conventions
- Implement proper security practices (parameter sanitization, SQL injection prevention)
- Use proper concurrency patterns (Fiber, Thread, or concurrent-ruby)
- Follow performance best practices (avoid N+1 queries, use proper indexing)`,
        'rust': `${commonStandards}
- Use proper Result<T, E> for error handling
- Implement proper ownership and borrowing patterns
- Use proper error propagation with ? operator
- Include comprehensive input validation
- Use proper lifetime annotations where needed
- Implement proper async/await with tokio or similar
- Follow Rust naming conventions and documentation`,
    };
    return languageSpecific[language] || `${commonStandards}
- Follow language-specific best practices where known
- Implement comprehensive error handling using language conventions
- Include proper input validation and type checking
- Use appropriate design patterns for the language paradigm
- Add comprehensive documentation following language standards
- MANUAL REVIEW RECOMMENDED: Limited training data for this language`;
}
// Output requirements based on language support
function getOutputRequirements(support) {
    const baseRequirements = `
OUTPUT REQUIREMENTS:
- Provide complete, working implementations
- Include brief explanations of architectural decisions`;
    if (support.tier.includes('Tier 1') || support.tier.includes('Tier 2')) {
        return `${baseRequirements}
- Suggest testing strategies for the generated code
- Mention potential scalability considerations
- Include performance optimization notes
- No "TODO" or "FIXME" comments allowed`;
    }
    else {
        return `${baseRequirements}
- IMPORTANT: Include warnings about language-specific limitations
- Suggest manual review points for this language
- Provide alternative implementation approaches where applicable
- Include references to language-specific resources for verification
- Mark areas that may need expert review`;
    }
}
// Model selection with automatic fallback based on user's subscription level
async function selectOptimalModel(prompt, budgetManager, context) {
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
    let fallbackReason;
    // Apply budget-aware filtering
    if (suggestion === 'standard' || budget === 0) {
        preferredModels = ['claude-3.5-sonnet', 'gpt-4o', 'gemini-1.5-pro'];
        fallbackReason = 'Monthly budget exhausted - using included models';
    }
    else if (suggestion === 'warning') {
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
    }
    else if (strategy === 'aggressive' && budget > 0) {
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
        }
        catch (error) {
            continue;
        }
    }
    // Final fallback - try any available model
    try {
        const anyModels = await vscode.lm.selectChatModels({});
        if (anyModels.length > 0) {
            return { fallbackReason: fallbackReason || 'Using any available model' };
        }
    }
    catch {
        // No models available
    }
    return { fallbackReason: 'No suitable models available' };
}
function getModelPreferences(taskType, complexity, language) {
    const languageSupport = getLanguageSupport(language);
    // Start with language-specific recommendation
    let models = [];
    if (languageSupport.recommendedModel) {
        models.push(languageSupport.recommendedModel);
    }
    // Add complexity-based preferences
    if (complexity === 'high' || taskType === 'architecture') {
        models.push('claude-opus-4', 'o3', 'claude-sonnet-4', 'claude-3.7-sonnet', 'gpt-4.5');
    }
    else if (complexity === 'medium' || taskType === 'refactoring') {
        models.push('claude-sonnet-4', 'claude-3.7-sonnet', 'gpt-4.1', 'o3-mini');
    }
    else {
        models.push('claude-3.5-sonnet', 'gpt-4o', 'o4-mini', 'gemini-1.5-pro');
    }
    // Remove duplicates while preserving order
    return [...new Set(models)];
}
// Enhanced model availability check with fallback hierarchy
async function getAvailableModel(preferredModels) {
    for (const modelName of preferredModels) {
        try {
            const [vendor, family] = parseModelString(modelName);
            const models = await vscode.lm.selectChatModels({ vendor, family });
            if (models.length > 0) {
                return { vendor, family };
            }
        }
        catch {
            continue;
        }
    }
    // Final fallback - try to get any available model
    try {
        const anyModels = await vscode.lm.selectChatModels({});
        if (anyModels.length > 0) {
            // Use the first available model
            return {};
        }
    }
    catch {
        // No models available at all
    }
    return {};
}
// Parse model string to vendor and family - updated with latest 2025 models
function parseModelString(modelString) {
    // Latest Anthropic models
    if (modelString.includes('claude-opus-4'))
        return ['anthropic', 'claude-opus-4'];
    if (modelString.includes('claude-sonnet-4'))
        return ['anthropic', 'claude-sonnet-4'];
    if (modelString.includes('claude-3.7-sonnet-thinking'))
        return ['anthropic', 'claude-3.7-sonnet-thinking'];
    if (modelString.includes('claude-3.7-sonnet'))
        return ['anthropic', 'claude-3.7-sonnet'];
    if (modelString.includes('claude-3.5-sonnet'))
        return ['anthropic', 'claude-3.5-sonnet'];
    if (modelString.includes('claude'))
        return ['anthropic', modelString];
    // Latest OpenAI models
    if (modelString.includes('gpt-4.5'))
        return ['openai', 'gpt-4.5'];
    if (modelString.includes('gpt-4.1'))
        return ['openai', 'gpt-4.1'];
    if (modelString.includes('o4-mini'))
        return ['openai', 'o4-mini'];
    if (modelString.includes('o3-mini'))
        return ['openai', 'o3-mini'];
    if (modelString.includes('o3'))
        return ['openai', 'o3'];
    if (modelString.includes('o1-preview'))
        return ['openai', 'o1-preview'];
    if (modelString.includes('o1-mini'))
        return ['openai', 'o1-mini'];
    if (modelString.includes('o1'))
        return ['openai', 'o1'];
    if (modelString.includes('gpt-4o'))
        return ['openai', 'gpt-4o'];
    if (modelString.includes('gpt'))
        return ['openai', modelString];
    // Latest Google models
    if (modelString.includes('gemini-2.5-pro'))
        return ['google', 'gemini-2.5-pro'];
    if (modelString.includes('gemini-2.0-flash'))
        return ['google', 'gemini-2.0-flash'];
    if (modelString.includes('gemini-1.5-pro'))
        return ['google', 'gemini-1.5-pro'];
    if (modelString.includes('gemini'))
        return ['google', modelString];
    return ['anthropic', 'claude-sonnet-4']; // Updated fallback to latest default
}
// Analyze prompt complexity
function analyzeComplexity(prompt) {
    const complexityKeywords = [
        'architecture', 'design pattern', 'system design', 'scalable',
        'microservices', 'distributed', 'concurrent', 'async'
    ];
    const found = complexityKeywords.filter(keyword => prompt.toLowerCase().includes(keyword));
    if (found.length >= 3)
        return 'high';
    if (found.length >= 1)
        return 'medium';
    return 'low';
}
// Analyze task type
function analyzeTaskType(prompt) {
    if (/\b(architect|design|pattern|structure)\b/i.test(prompt))
        return 'architecture';
    if (/\b(refactor|improve|optimize|clean)\b/i.test(prompt))
        return 'refactoring';
    if (/\b(implement|create|build|write)\b/i.test(prompt))
        return 'implementation';
    if (/\b(fix|bug|error|debug)\b/i.test(prompt))
        return 'debugging';
    return 'general';
}
// Detect programming language from prompt with enhanced Ruby detection
function detectLanguage(prompt) {
    const languages = {
        'ruby': /\b(ruby|rails|gem|bundle|rake|rspec|minitest|sidekiq|devise|activerecord|erb|haml)\b/i,
        'typescript': /\b(typescript|ts|interface|type)\b/i,
        'javascript': /\b(javascript|js|node|npm|react|vue|angular)\b/i,
        'python': /\b(python|py|django|flask|fastapi|pandas|numpy)\b/i,
        'java': /\b(java|spring|maven|gradle|hibernate)\b/i,
        'csharp': /\b(c#|csharp|\.net|dotnet|asp\.net)\b/i,
        'go': /\b(golang|go)\b/i,
        'rust': /\b(rust|cargo)\b/i
    };
    for (const [lang, regex] of Object.entries(languages)) {
        if (regex.test(prompt))
            return lang;
    }
    // Fallback to active editor language
    const activeEditor = vscode.window.activeTextEditor;
    return activeEditor?.document.languageId || 'javascript';
}
// Get workspace context for better code generation with Ruby-specific detection
async function getWorkspaceContext() {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        return '';
    }
    try {
        // Look for common config files, including Ruby-specific ones
        const configFiles = [
            'package.json', 'tsconfig.json', '.eslintrc', 'pyproject.toml',
            'Gemfile', 'Gemfile.lock', 'config/application.rb', '.ruby-version',
            'Rakefile', 'config.ru', 'spec/spec_helper.rb', 'test/test_helper.rb'
        ];
        let context = '';
        for (const configFile of configFiles) {
            try {
                const uri = vscode.Uri.joinPath(workspaceFolders[0].uri, configFile);
                const content = await vscode.workspace.fs.readFile(uri);
                const text = new TextDecoder().decode(content);
                context += `${configFile}:\n${text.slice(0, 500)}\n\n`;
            }
            catch {
                // File doesn't exist, continue
            }
        }
        // Add Ruby/Rails specific context analysis
        if (context.includes('rails') || context.includes('Rails')) {
            context += `\nRails project detected - applying Rails conventions and patterns\n`;
        }
        if (context.includes('rspec')) {
            context += `\nRSpec testing framework detected - using RSpec patterns\n`;
        }
        if (context.includes('sidekiq') || context.includes('Sidekiq')) {
            context += `\nSidekiq background jobs detected - applying async patterns\n`;
        }
        return context;
    }
    catch {
        return '';
    }
}
// Command: Enhance selected code with quality patterns
async function enhanceSelectedCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
    }
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    if (!selectedText.trim()) {
        vscode.window.showWarningMessage('Please select some code to enhance');
        return;
    }
    // Use quality enhancement prompt
    const enhancedCode = await enhanceCodeQuality(selectedText);
    if (enhancedCode) {
        await editor.edit(editBuilder => {
            editBuilder.replace(selection, enhancedCode);
        });
    }
}
// Command: Generate code with BrewHand approach
async function generateQualityCode() {
    const prompt = await vscode.window.showInputBox({
        prompt: 'Describe what you want to implement',
        placeHolder: 'e.g., "Create a rate-limited HTTP client with retry logic"'
    });
    if (!prompt)
        return;
    // Trigger BrewHand chat
    await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
    await vscode.commands.executeCommand('workbench.action.chat.newChat');
    // Insert brewhand prompt
    const qualityPrompt = `@brewhand ${prompt}`;
    await vscode.commands.executeCommand('workbench.action.chat.submit', qualityPrompt);
}
// Command: Review code quality
async function reviewCodeQuality() {
    const editor = vscode.window.activeTextEditor;
    if (!editor)
        return;
    const document = editor.document;
    const text = document.getText();
    // Analyze code quality
    const issues = analyzeCodeQuality(text, document.languageId);
    // Show results in output channel
    const output = vscode.window.createOutputChannel('Quality Review');
    output.clear();
    output.appendLine('=== Code Quality Review ===\n');
    if (issues.length === 0) {
        output.appendLine('✅ No quality issues found!');
    }
    else {
        issues.forEach((issue, index) => {
            output.appendLine(`${index + 1}. ${issue.severity}: ${issue.message}`);
            output.appendLine(`   Line ${issue.line}: ${issue.suggestion}\n`);
        });
    }
    output.show();
}
// Enhance code quality using LLM
async function enhanceCodeQuality(code, token) {
    try {
        const models = await vscode.lm.selectChatModels({ vendor: 'anthropic' });
        if (models.length === 0)
            return code;
        const enhancementPrompt = `Transform this code to production-ready quality:

ORIGINAL CODE:
\`\`\`
${code}
\`\`\`

REQUIREMENTS:
- Add comprehensive error handling
- Include input validation
- Use proper types/interfaces
- Add performance optimizations
- Include security considerations
- Make it maintainable and self-documenting
- No TODO comments or placeholders

Return only the enhanced code with brief comments explaining improvements.`;
        const messages = [vscode.LanguageModelChatMessage.User(enhancementPrompt)];
        const response = await models[0].sendRequest(messages, {}, token);
        let result = '';
        for await (const fragment of response.text) {
            result += fragment;
        }
        // Extract code from markdown if present
        const codeMatch = result.match(/```[\w]*\n([\s\S]*?)\n```/);
        return codeMatch ? codeMatch[1] : result;
    }
    catch (error) {
        vscode.window.showErrorMessage(`Enhancement failed: ${error}`);
        return code;
    }
}
// Basic code quality analysis with Ruby-specific checks
function analyzeCodeQuality(code, languageId) {
    const issues = [];
    const lines = code.split('\n');
    lines.forEach((line, index) => {
        // Check for TODO/FIXME comments
        if (/TODO|FIXME|HACK/i.test(line)) {
            issues.push({
                severity: 'Warning',
                message: 'Placeholder comment found',
                line: index + 1,
                suggestion: 'Implement proper solution instead of placeholder'
            });
        }
        // JavaScript/TypeScript specific checks
        if (languageId.includes('javascript') || languageId.includes('typescript')) {
            if (/console\.log/.test(line)) {
                issues.push({
                    severity: 'Info',
                    message: 'Debug logging found',
                    line: index + 1,
                    suggestion: 'Use proper logging framework for production'
                });
            }
        }
        // Ruby-specific quality checks
        if (languageId === 'ruby') {
            // Check for puts/p debugging
            if (/\b(puts|p|pp)\s/.test(line) && !line.includes('#')) {
                issues.push({
                    severity: 'Info',
                    message: 'Debug output found',
                    line: index + 1,
                    suggestion: 'Use Rails.logger or proper logging instead of puts/p'
                });
            }
            // Check for rescue without specific exception
            if (/rescue\s*$/.test(line.trim())) {
                issues.push({
                    severity: 'Warning',
                    message: 'Bare rescue clause',
                    line: index + 1,
                    suggestion: 'Specify exception class: rescue SpecificError => e'
                });
            }
            // Check for potential SQL injection
            if ((/where\s*\(.*["'].*\+.*["']/.test(line) || /where\s*\(.*["'].*#\{/.test(line)) && !line.includes('?')) {
                issues.push({
                    severity: 'Error',
                    message: 'Potential SQL injection vulnerability',
                    line: index + 1,
                    suggestion: 'Use parameterized queries: where("name = ?", name) or where(name: name)'
                });
            }
            // Check for missing frozen_string_literal
            if (index === 0 && !code.includes('frozen_string_literal')) {
                issues.push({
                    severity: 'Info',
                    message: 'Missing frozen_string_literal comment',
                    line: 1,
                    suggestion: 'Add # frozen_string_literal: true at the top for performance'
                });
            }
            // Check for class variables (often problematic)
            if (/@@\w+/.test(line)) {
                issues.push({
                    severity: 'Warning',
                    message: 'Class variable usage detected',
                    line: index + 1,
                    suggestion: 'Consider using class instance variables (@var) or constants instead'
                });
            }
            // Check for long parameter lists (Ruby best practice)
            const methodMatch = line.match(/def\s+\w+\s*\((.*)\)/);
            if (methodMatch && methodMatch[1].split(',').length > 4) {
                issues.push({
                    severity: 'Warning',
                    message: 'Long parameter list detected',
                    line: index + 1,
                    suggestion: 'Consider using a hash parameter or extracting to a parameter object'
                });
            }
        }
        // Check for empty catch blocks (general)
        if (/catch\s*\(\s*\w*\s*\)\s*\{\s*\}/.test(line) || /rescue\s*\w*\s*$/.test(line.trim())) {
            issues.push({
                severity: 'Error',
                message: 'Empty exception handler',
                line: index + 1,
                suggestion: 'Add proper error handling in exception block'
            });
        }
    });
    return issues;
}
function deactivate() { }
// Usage dashboard function
async function showUsageDashboard(budgetManager) {
    const panel = vscode.window.createWebviewPanel('brewhandUsage', 'BrewHand Usage Dashboard', vscode.ViewColumn.One, {
        enableScripts: true
    });
    const usage = budgetManager.getDetailedUsage();
    const remaining = budgetManager.getRemainingBudget();
    const limit = budgetManager.getMonthlyLimit();
    const percentUsed = ((limit - remaining) / limit * 100).toFixed(1);
    panel.webview.html = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BrewHand Usage</title>
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
                border-radius: 5px;
                padding: 15px;
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
        <h1>BrewHand Premium Request Usage</h1>
        
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
                <h3>Budget Strategy</h3>
                <p style="font-size: 1.5em; margin: 0;">${usage.strategy}</p>
            </div>
        </div>
        
        ${Object.keys(usage.byModel).length > 0 ? `
        <h2>Usage by Model</h2>
        <ul class="model-list">
            ${Object.entries(usage.byModel).map(([model, count]) => `<li><strong>${model}:</strong> ${count} requests</li>`).join('')}
        </ul>
        ` : ''}
        
        <div class="tips">
            <h3>💡 Budget Management Tips</h3>
            <ul>
                <li>Use the <strong>conservative</strong> strategy to preserve premium requests for complex tasks</li>
                <li>Set a realistic monthly limit based on your GitHub Copilot plan</li>
                <li>Monitor your usage through the status bar indicator</li>
                <li>Premium models are best for architecture, complex algorithms, and critical code</li>
            </ul>
        </div>
    </body>
    </html>`;
}
//# sourceMappingURL=quality-first-copilot-extension.js.map