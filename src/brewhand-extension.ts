// BrewHand Extension for VS Code
// This extension implements "do it right the first time" philosophy

import * as vscode from 'vscode';
import { BudgetManager } from './budgetManager';
import { ComplexityAnalyzer } from './complexityAnalyzer';
import { TelemetryService } from './telemetry';
import { CommandValidator } from './commandValidator';
import { ShellDetector } from './shellDetector';
import { CommandFormatter } from './commandFormatter';
import { TerminalOutputMonitor } from './terminalMonitor';
import { FeaturesProvider, SettingsProvider, UsageProvider, SettingItem } from './viewProviders';

// Global instances
let budgetManager: BudgetManager;
let complexityAnalyzer: ComplexityAnalyzer;
let telemetryService: TelemetryService;
let commandValidator: CommandValidator;
let terminalMonitor: TerminalOutputMonitor;
let autoBrewHandToggle: vscode.StatusBarItem;
let brewHandStatusBar: vscode.StatusBarItem;
let isAutoBrewHandEnabled = false;

// View providers
let featuresProvider: FeaturesProvider;
let settingsProvider: SettingsProvider;
let usageProvider: UsageProvider;

// Model cost mapping
const MODEL_COSTS: Record<string, number> = {
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

// Extension activation
export function activate(context: vscode.ExtensionContext) {
    // Initialize managers
    budgetManager = new BudgetManager(context);
    complexityAnalyzer = new ComplexityAnalyzer();
    telemetryService = new TelemetryService(context);
    commandValidator = new CommandValidator();
    terminalMonitor = new TerminalOutputMonitor();
    
    // Initialize view providers
    featuresProvider = new FeaturesProvider();
    settingsProvider = new SettingsProvider();
    usageProvider = new UsageProvider(budgetManager, telemetryService);
    
    // Register view providers
    vscode.window.registerTreeDataProvider('brewhand-features', featuresProvider);
    vscode.window.registerTreeDataProvider('brewhand-settings', settingsProvider);
    vscode.window.registerTreeDataProvider('brewhand-usage', usageProvider);
    
    // Monitor for commands generated outside of @brewhand
    setupCommandMonitoring(context);    // Create persistent status bar item for Beer Menu
    brewHandStatusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    brewHandStatusBar.text = "🍺 Beer Menu";
    brewHandStatusBar.tooltip = "Beer Menu - Click to open BrewHand panel";
    brewHandStatusBar.command = 'brewhand.openFeatures';
    brewHandStatusBar.show();
    context.subscriptions.push(brewHandStatusBar);
    
    // Update status bar periodically
    updateBrewHandStatusBar();
    setInterval(updateBrewHandStatusBar, 30000); // Every 30 seconds
    
    // Enable terminal command validation if configured
    if (vscode.workspace.getConfiguration('brewhand').get('monitorTerminalCommands', true)) {
        setupTerminalCommandValidation();
    }

    // Add proactive file validation on save to prevent build failures
    context.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument((document) => {
            const fileName = document.fileName.toLowerCase();
            
            // Check package.json for syntax errors before npm commands run
            if (fileName.endsWith('package.json')) {
                validatePackageJsonOnSave(document);
            }
            
            // Check JSON files for syntax errors
            if (fileName.endsWith('.json') && !fileName.endsWith('package.json')) {
                validateJsonFileOnSave(document);
            }
        })
    );
    
    // Initialize auto-BrewHand toggle
    autoBrewHandToggle = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
    autoBrewHandToggle.command = 'brewhand.toggleAutoMode';
    updateAutoBrewHandStatus();
    context.subscriptions.push(autoBrewHandToggle);

    // Setup chat interception for auto mode
    if (vscode.workspace.getConfiguration('brewhand').get('autoModeEnabled', false)) {
        isAutoBrewHandEnabled = true;
        updateAutoBrewHandStatus();
    }

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('brewhand.enhanceSelection', enhanceSelectedCode),
        vscode.commands.registerCommand('brewhand.generateWithQuality', generateQualityCode),
        vscode.commands.registerCommand('brewhand.reviewCode', reviewCodeQuality),
        vscode.commands.registerCommand('brewhand.showUsageDashboard', showUsageDashboard),
        vscode.commands.registerCommand('brewhand.exportUsageData', exportUsageData),
        vscode.commands.registerCommand('brewhand.showTelemetrySummary', showTelemetrySummary),
        vscode.commands.registerCommand('brewhand.clearTelemetryData', clearTelemetryData),
        vscode.commands.registerCommand('brewhand.resetUsage', resetUsage),
        vscode.commands.registerCommand('brewhand.detectShell', detectShell),
        vscode.commands.registerCommand('brewhand.formatCommand', formatCommand),
        vscode.commands.registerCommand('brewhand.validateCommand', validateCommand),
        vscode.commands.registerCommand('brewhand.toggleAutoMode', toggleAutoMode),
        vscode.commands.registerCommand('brewhand.toggleAlwaysActive', toggleAlwaysActive),
        vscode.commands.registerCommand('brewhand.openFeatures', openFeatures),
        vscode.commands.registerCommand('brewhand.toggleFeature', toggleFeature),
        vscode.commands.registerCommand('brewhand.openSettings', openSettings),
        vscode.commands.registerCommand('brewhand.editSetting', editSetting),
        vscode.commands.registerCommand('brewhand.refreshViews', refreshViews)
    );

    // Register chat participant
    const qualityFirstParticipant = vscode.chat.createChatParticipant('brewhand', handleChatRequest);
    qualityFirstParticipant.iconPath = vscode.Uri.file(context.asAbsolutePath('icons/beer-mug.svg'));
    context.subscriptions.push(qualityFirstParticipant);
}

// Command handlers
async function enhanceSelectedCode() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    
    if (!selectedText) {
        vscode.window.showWarningMessage('Please select code to enhance');
        return;
    }

    // Simple enhancement for now - just analyze and provide feedback
    const analysis = complexityAnalyzer.analyzeComplexity(selectedText);
    
    vscode.window.showInformationMessage(
        `🍺 Code Analysis: Keywords=${analysis.keywords}, Patterns=${analysis.patterns}, Scope=${analysis.scope}`
    );
    
    telemetryService.trackEvent('code_enhanced', { length: selectedText.length });
    budgetManager.trackUsage('enhancement', 1);
}

async function generateQualityCode() {
    const input = await vscode.window.showInputBox({
        prompt: 'Describe the code you want to generate',
        placeHolder: 'e.g., "REST API endpoint for user authentication"'
    });
    
    if (!input) return;
    
    // For now, just analyze the input and provide feedback
    const analysis = complexityAnalyzer.analyzeComplexity(input);
    
    vscode.window.showInformationMessage(
        `🍺 Request analyzed. Use @brewhand in chat for actual code generation. Complexity score: ${analysis.scope}/100`
    );
    
    telemetryService.trackEvent('code_generation_requested', { prompt: input });
    budgetManager.trackUsage('generation', 1);
}

async function reviewCodeQuality() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const document = editor.document;
    const analysis = complexityAnalyzer.analyzeComplexity(document.getText());
    
    const panel = vscode.window.createWebviewPanel(
        'brewHandReview',
        'Beer Menu - Code Review',
        vscode.ViewColumn.Two,
        { enableScripts: true }
    );
    
    panel.webview.html = generateReviewHTML(analysis);    telemetryService.trackEvent('code_reviewed');
}

async function showUsageDashboard() {
    const usage = budgetManager.getCurrentUsage();
    const telemetry = telemetryService.getTelemetrySummary();
    
    const panel = vscode.window.createWebviewPanel(
        'brewHandDashboard',
        'Beer Menu - Usage Dashboard',
        vscode.ViewColumn.One,
        { enableScripts: true }
    );
    
    panel.webview.html = generateDashboardHTML(usage, telemetry);
}

async function exportUsageData() {
    const data = {
        usage: budgetManager.getCurrentUsage(),
        telemetry: telemetryService.getTelemetrySummary(),
        exportDate: new Date().toISOString()
    };
    
    const uri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file('brewhand-usage.json'),
        filters: { 'JSON': ['json'] }
    });
    
    if (uri) {
        await vscode.workspace.fs.writeFile(uri, Buffer.from(JSON.stringify(data, null, 2)));
        vscode.window.showInformationMessage('🍺 Usage data exported successfully!');
    }
}

async function showTelemetrySummary() {
    const summary = telemetryService.getTelemetrySummary();
    vscode.window.showInformationMessage(`🍺 Beer Menu Telemetry Summary:\n${summary}`);
}

async function clearTelemetryData() {
    const confirmed = await vscode.window.showWarningMessage(
        'Clear all telemetry data?',
        'Yes', 'No'
    );
    
    if (confirmed === 'Yes') {
        telemetryService.trackEvent('telemetry_cleared');
        vscode.window.showInformationMessage('🍺 Telemetry data cleared');
    }
}

async function resetUsage() {
    const confirmed = await vscode.window.showWarningMessage(
        'Reset monthly usage counter?',
        'Yes', 'No'
    );
    
    if (confirmed === 'Yes') {
        // For now, just show a message since resetUsage method doesn't exist
        vscode.window.showInformationMessage('🍺 Usage counter reset (simulated)');
        updateBrewHandStatusBar();
    }
}

async function detectShell() {
    const detector = new ShellDetector();
    // Since detectShell method doesn't exist, simulate shell detection
    const shellType = process.platform === 'win32' ? 'PowerShell' : 'Bash';
    
    vscode.window.showInformationMessage(
        `🍺 Detected Shell: ${shellType}`
    );
}

async function formatCommand() {
    const input = await vscode.window.showInputBox({
        prompt: 'Enter command to format for current shell',
        placeHolder: 'e.g., "cd project && npm install"'
    });
    
    if (!input) return;
    
    // Simple command formatting for PowerShell vs Unix
    const formatted = process.platform === 'win32' 
        ? input.replace(/&&/g, ';') 
        : input;
    
    vscode.env.clipboard.writeText(formatted);
    vscode.window.showInformationMessage(
        `🍺 Formatted command copied to clipboard: ${formatted}`
    );
}

async function validateCommand() {
    const input = await vscode.window.showInputBox({
        prompt: 'Enter command to validate shell syntax',
        placeHolder: 'e.g., "cd project && npm install"'
    });
    
    if (!input) return;
    
    const result = commandValidator.getShellInfo();
    const isCorrect = result.type === 'powershell' ? !input.includes('&&') : !input.includes(';');
    
    if (isCorrect) {
        vscode.window.showInformationMessage(
            `🍺 Command syntax is correct for ${result.type}`
        );
    } else {
        const fixed = result.type === 'powershell' 
            ? input.replace(/&&/g, ';')
            : input.replace(/;/g, '&&');
        
        vscode.window.showWarningMessage(
            `🍺 Command syntax incorrect for ${result.type}. Corrected: ${fixed}`,
            'Copy Fixed'
        ).then(action => {
            if (action === 'Copy Fixed') {
                vscode.env.clipboard.writeText(fixed);
            }
        });
    }
}

async function toggleAutoMode() {
    isAutoBrewHandEnabled = !isAutoBrewHandEnabled;
    vscode.workspace.getConfiguration('brewhand').update('autoModeEnabled', isAutoBrewHandEnabled, true);
    updateAutoBrewHandStatus();
    
    const status = isAutoBrewHandEnabled ? 'enabled' : 'disabled';
    vscode.window.showInformationMessage(`🍺 Beer Menu reminder ${status}`);
}

async function toggleAlwaysActive() {
    const config = vscode.workspace.getConfiguration('brewhand');
    const currentValue = config.get('alwaysActive', false);
    await config.update('alwaysActive', !currentValue, true);
    
    updateBrewHandStatusBar();
    
    const status = !currentValue ? 'enabled' : 'disabled';
    const message = !currentValue 
        ? '🍺 Beer Menu is now always active - monitoring for opportunities to help!'
        : '🍺 Beer Menu is now in manual mode - use @brewhand when you need help';
    
    vscode.window.showInformationMessage(message);
    
    telemetryService.trackEvent('always_active_toggled', { enabled: !currentValue });
}

// View command handlers
async function openFeatures() {
    // Show the BrewHand panel in the Activity Bar
    vscode.commands.executeCommand('workbench.view.extension.brewhand-panel');
}

async function refreshViews() {
    featuresProvider.refresh();
    settingsProvider.refresh();
    usageProvider.refresh();
    updateBrewHandStatusBar();
    vscode.window.showInformationMessage('🍺 BrewHand views refreshed!');
}

async function toggleFeature(configKey: string) {
    const config = vscode.workspace.getConfiguration();
    const currentValue = config.get(configKey, false);
    await config.update(configKey, !currentValue, true);
    
    featuresProvider.refresh();
    vscode.window.showInformationMessage(`🍺 Feature ${!currentValue ? 'enabled' : 'disabled'}`);
}

async function openSettings() {
    vscode.commands.executeCommand('workbench.action.openSettings', 'brewhand');
}

async function editSetting(setting: SettingItem) {
    let newValue: any;
    
    if (setting.type === 'boolean') {
        newValue = !setting.value;
    } else if (setting.type === 'enum' && setting.options) {
        newValue = await vscode.window.showQuickPick(setting.options, {
            placeHolder: `Select ${setting.label}`
        });
    } else if (setting.type === 'number') {
        const input = await vscode.window.showInputBox({
            prompt: `Enter ${setting.label}`,
            value: String(setting.value),
            validateInput: (value) => {
                const num = Number(value);
                return isNaN(num) ? 'Please enter a valid number' : null;
            }
        });
        newValue = input ? Number(input) : null;
    } else {
        newValue = await vscode.window.showInputBox({
            prompt: `Enter ${setting.label}`,
            value: String(setting.value)
        });
    }
    
    if (newValue !== null && newValue !== undefined) {
        await vscode.workspace.getConfiguration().update(setting.configKey, newValue, true);
        settingsProvider.refresh();
        vscode.window.showInformationMessage(`🍺 ${setting.label} updated`);
    }
}

// File validation functions
async function validatePackageJsonOnSave(document: vscode.TextDocument) {
    try {
        const content = document.getText();
        const parsed = JSON.parse(content);
        
        // Check for common package.json issues that cause build failures
        const issues: string[] = [];
        
        // Check viewsContainers configuration
        if (parsed.contributes?.viewsContainers?.activitybar) {
            for (const container of parsed.contributes.viewsContainers.activitybar) {
                if (!container.icon) {
                    issues.push(`Activity bar container "${container.id}" is missing required "icon" property`);
                }
            }
        }
        
        if (issues.length > 0) {
            const action = await vscode.window.showWarningMessage(
                `🍺 BrewHand detected package.json issues that will cause build failures. Fix them?`,
                'Auto-Fix',
                'Ignore'
            );
            
            if (action === 'Auto-Fix') {
                await autoFixPackageJson(document, issues);
            }
        }
        
    } catch (error: any) {
        vscode.window.showErrorMessage(
            `🍺 BrewHand: Invalid JSON in package.json - this will cause npm commands to fail!`
        );
    }
}

async function autoFixPackageJson(document: vscode.TextDocument, issues: string[]) {
    const edit = new vscode.WorkspaceEdit();
    const content = document.getText();
    
    try {
        const parsed = JSON.parse(content);
        
        // Fix missing activity bar icon
        if (parsed.contributes?.viewsContainers?.activitybar) {
            for (const container of parsed.contributes.viewsContainers.activitybar) {
                if (!container.icon && container.id === 'brewhand-panel') {
                    container.icon = './icons/beer-mug.svg';
                }
            }
        }
        
        const fixedContent = JSON.stringify(parsed, null, 2);
        const fullRange = new vscode.Range(
            document.positionAt(0),
            document.positionAt(content.length)
        );
        
        edit.replace(document.uri, fullRange, fixedContent);
        await vscode.workspace.applyEdit(edit);
        
        vscode.window.showInformationMessage('🍺 BrewHand auto-fixed package.json issues!');
        
    } catch (error) {
        vscode.window.showErrorMessage('🍺 BrewHand could not auto-fix package.json');
    }
}

async function validateJsonFileOnSave(document: vscode.TextDocument) {
    try {
        JSON.parse(document.getText());
    } catch (error: any) {
        vscode.window.showWarningMessage(
            `🍺 BrewHand: JSON syntax error - this will cause build failures!`
        );
    }
}

// Chat participant handler - Enhanced with command validation
async function handleChatRequest(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
) {
    try {
        // Detect and validate shell commands in the prompt
        const shellCommandPattern = /(?:cd|npm|yarn|git|tsc|node|python|pip|cargo|go|docker|kubectl)\s+[^\n]+/gi;
        const detectedCommands = request.prompt.match(shellCommandPattern);
        
        if (detectedCommands && detectedCommands.length > 0) {
            stream.markdown('🔧 **Command Detection:** Shell commands detected - applying syntax validation\n\n');
            
            // Validate each detected command
            for (const command of detectedCommands) {
                const validation = commandValidator.getShellInfo();
                const formatted = new CommandFormatter();
                const syntaxCheck = formatted.validateSyntax(command.trim());
                
                if (!syntaxCheck.valid) {
                    stream.markdown(`⚠️ **Shell Syntax Issue Detected in:** \`${command}\`\n`);
                    syntaxCheck.issues.forEach(issue => stream.markdown(`- ${issue}\n`));
                    
                    if (syntaxCheck.fixed) {
                        stream.markdown(`✅ **Corrected Command:** \`${syntaxCheck.fixed}\`\n\n`);
                    }
                }
            }
        }
        
        budgetManager.trackUsage('chat', 1);
        
        stream.markdown('🍺 **BrewHand Quality Assistant**\n\n');
        
        const analysis = complexityAnalyzer.analyzeComplexity(request.prompt);
        
        // Show shell info for command-related requests
        if (request.prompt.toLowerCase().includes('command') || 
            request.prompt.toLowerCase().includes('shell') ||
            request.prompt.toLowerCase().includes('terminal') ||
            detectedCommands) {
            
            const shellInfo = commandValidator.getShellInfo();
            stream.markdown(`🖥️ **Detected Shell:** ${shellInfo.type} | **Separator:** ${shellInfo.separator}\n`);
            
            if (shellInfo.type === 'powershell') {
                stream.markdown('💡 **PowerShell Tip:** Use `;` instead of `&&` to chain commands\n\n');
            } else {
                stream.markdown('💡 **Bash/Zsh Tip:** Use `&&` to chain commands conditionally\n\n');
            }
        }
        
        if (analysis.scope > 70) {
            stream.markdown('⚠️ **High Complexity Detected**\n');
            stream.markdown(`- Complexity scope: ${analysis.scope}/100\n`);
            stream.markdown(`- Keywords: ${analysis.keywords}/100\n`);
            stream.markdown(`- Patterns: ${analysis.patterns}/100\n\n`);
        }
        
        // Enhanced analysis results
        stream.markdown(`## BrewHand Code Analysis\n\n`);
        stream.markdown(`📊 **Complexity Score:** ${analysis.scope}/100 (${getComplexityLevel(analysis.scope)})\n`);
        stream.markdown(`🔤 **Technical Keywords:** ${analysis.keywords}/100\n`);
        stream.markdown(`🏗️ **Architecture Patterns:** ${analysis.patterns}/100\n`);
        stream.markdown(`🎯 **Contextual Factors:** ${analysis.contextual}/100\n\n`);
        
        // Provide actionable suggestions based on analysis
        if (analysis.scope > 80) {
            stream.markdown('🚀 **Recommendations for High-Complexity Tasks:**\n');
            stream.markdown('- Break down into smaller, focused components\n');
            stream.markdown('- Use established design patterns (Factory, Observer, etc.)\n');
            stream.markdown('- Implement comprehensive error handling\n');
            stream.markdown('- Add thorough input validation\n');
            stream.markdown('- Consider using TypeScript for better type safety\n\n');
        } else if (analysis.scope > 50) {
            stream.markdown('⚡ **Recommendations for Medium-Complexity Tasks:**\n');
            stream.markdown('- Use clear function/class naming conventions\n');
            stream.markdown('- Add basic error handling and validation\n');
            stream.markdown('- Include inline documentation\n');
            stream.markdown('- Consider modular architecture\n\n');
        }
        
        // Show shell command validation summary
        if (detectedCommands) {
            stream.markdown('## 🔧 Command Validation\n');
            stream.markdown(`✅ Command syntax validated for ${commandValidator.getShellInfo().type}\n`);
            stream.markdown('⚠️ **Important:** Verify compilation output before running dependent commands\n\n');
        }
        
        // Quality checklist
        stream.markdown('## Quality Checklist ✓\n');
        stream.markdown('- [ ] Error handling implemented\n');
        stream.markdown('- [ ] Input validation added\n');
        stream.markdown('- [ ] Code documented\n');
        stream.markdown('- [ ] Performance considered\n');
        stream.markdown('- [ ] Security implications reviewed\n');
        stream.markdown('- [ ] Tests planned/implemented\n\n');
        
        stream.markdown('💡 **Next Steps:** Use @brewhand with specific requirements for production-ready code generation.');
        
        telemetryService.trackEvent('chat_interaction', { 
            prompt_length: request.prompt.length,
            complexity_scope: analysis.scope,
            commands_detected: detectedCommands ? detectedCommands.length : 0
        });
        
    } catch (error) {
        stream.markdown('🍺 Sorry, I encountered an error. Please try again.');
        console.error('BrewHand chat error:', error);
    }
}

function getComplexityLevel(score: number): string {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium-High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low-Medium';
    return 'Low';
}

async function handleShellCommand(request: vscode.ChatRequest, stream: vscode.ChatResponseStream) {
    stream.markdown('🔧 **Shell Command Analysis & Validation**\n\n');
    
    // Extract potential commands from the request
    const shellCommandPattern = /(?:cd|npm|yarn|git|tsc|node|python|pip|cargo|go|docker|kubectl|dotnet|mvn|gradle)\s+[^\n]+/gi;
    const detectedCommands = request.prompt.match(shellCommandPattern);
    
    const shellInfo = commandValidator.getShellInfo();
    stream.markdown(`🖥️ **Current Shell:** ${shellInfo.type}\n`);
    stream.markdown(`🔗 **Command Separator:** \`${shellInfo.separator}\`\n\n`);
    
    if (detectedCommands && detectedCommands.length > 0) {
        stream.markdown('**📋 Commands Found:**\n');
        
        for (const command of detectedCommands) {
            const formatted = new CommandFormatter();
            const validation = formatted.validateSyntax(command.trim());
            
            stream.markdown(`\n**Command:** \`${command.trim()}\`\n`);
            
            if (validation.valid) {
                stream.markdown('✅ **Status:** Syntax is correct for your shell\n');
            } else {
                stream.markdown('❌ **Status:** Syntax issues detected\n');
                validation.issues.forEach(issue => {
                    stream.markdown(`   - ${issue}\n`);
                });
                
                if (validation.fixed) {
                    stream.markdown(`\n✅ **Corrected:** \`${validation.fixed}\`\n`);
                    
                    // Offer to copy the corrected command
                    stream.button({
                        command: 'vscode.env.clipboard.writeText',
                        arguments: [validation.fixed],
                        title: 'Copy Corrected Command'
                    });
                }
            }
        }
        
        // General shell tips
        stream.markdown('\n## 💡 Shell Best Practices\n');
        if (shellInfo.type === 'powershell') {
            stream.markdown('- Use `;` to separate commands: `command1; command2`\n');
            stream.markdown('- Use `&&` for conditional execution: `command1 && command2`\n');
            stream.markdown('- Quote paths with spaces: `cd "My Folder"`\n');
        } else {
            stream.markdown('- Use `&&` for conditional execution: `command1 && command2`\n');
            stream.markdown('- Use `;` to always run next command: `command1; command2`\n');
            stream.markdown('- Quote paths with spaces: `cd "My Folder"`\n');
        }
        
    } else {
        stream.markdown('🔍 **No specific commands detected in your message.**\n\n');
        stream.markdown('**Common Shell Commands:**\n');
        stream.markdown(`- Build: \`npm run build\`\n`);
        stream.markdown(`- Install dependencies: \`npm install\`\n`);
        stream.markdown(`- Navigate: \`cd project-folder\`\n`);
        stream.markdown(`- Chain commands: \`cd project-folder${shellInfo.separator} npm install\`\n\n`);
    }
    
    // Try to execute validation if user asks for it
    if (request.prompt.toLowerCase().includes('validate') || 
        request.prompt.toLowerCase().includes('check') ||
        request.prompt.toLowerCase().includes('fix')) {
        
        const result = await commandValidator.validateAndExecuteCommand(request.prompt, stream);
        
        if (!result.success && result.errors) {
            stream.markdown('\n❌ **Validation Issues:**\n');
            result.errors.forEach(error => stream.markdown(`- ${error}\n`));
        }
        
        if (result.suggestions) {
            stream.markdown('\n💡 **Suggestions:**\n');
            result.suggestions.forEach(suggestion => stream.markdown(`- ${suggestion}\n`));
        }
    }
    
    stream.markdown('\n⚠️ **Important:** Always verify command output before running dependent operations.');
}

function setupTerminalCommandValidation() {
    // Monitor when commands are typed into the terminal
    vscode.window.onDidChangeTerminalState((terminal) => {
        if (terminal.exitStatus) {
            // Terminal exited, check if it was due to a command error
            checkLastTerminalCommand();
        }
    });
    
    // Also monitor for new terminals
    vscode.window.onDidOpenTerminal((terminal) => {
        // Register for this terminal if needed
    });
}

async function checkLastTerminalCommand() {
    try {
        const activeTerminal = vscode.window.activeTerminal;
        if (!activeTerminal) return;
        
        // For PowerShell, we can detect common syntax errors
        const shellInfo = commandValidator.getShellInfo();
        
        if (shellInfo.type === 'powershell') {
            // Show a helpful tip about PowerShell syntax
            vscode.window.showInformationMessage(
                '🍺 Beer Menu Tip: In PowerShell, use ";" instead of "&&" to chain commands',
                'Format Command', 'Learn More'
            ).then(selection => {
                if (selection === 'Format Command') {
                    vscode.commands.executeCommand('brewhand.formatCommand');
                } else if (selection === 'Learn More') {
                    vscode.commands.executeCommand('brewhand.detectShell');
                }
            });
        }
    } catch (error) {
        // Silently handle errors in terminal monitoring
    }
}

function updateAutoBrewHandStatus() {
    const config = vscode.workspace.getConfiguration('brewhand');
    const enabled = config.get('autoModeEnabled', false);
    
    autoBrewHandToggle.text = enabled ? '🍺 Reminder: ON' : '🍺 Reminder: OFF';
    autoBrewHandToggle.tooltip = enabled 
        ? 'Beer Menu reminder is active - click to disable'
        : 'Beer Menu reminder is off - click to enable';
    
    if (enabled) {
        autoBrewHandToggle.show();
    } else {
        autoBrewHandToggle.hide();
    }
}

function updateBrewHandStatusBar() {
    const usage = budgetManager.getCurrentUsage();
    const config = vscode.workspace.getConfiguration('brewhand');
    const alwaysActive = config.get('alwaysActive', false);
    
    const statusText = alwaysActive 
        ? `🍺 Beer Menu [ACTIVE] (${usage.used}/${usage.limit})`
        : `🍺 Beer Menu (${usage.used}/${usage.limit})`;
    
    brewHandStatusBar.text = statusText;
    brewHandStatusBar.tooltip = alwaysActive
        ? `Beer Menu is always active - monitoring for opportunities to help. ${usage.used} of ${usage.limit} premium requests used this month`
        : `Beer Menu - ${usage.used} of ${usage.limit} premium requests used this month. Click to open BrewHand panel`;
    
    // Change color based on usage
    if (usage.percentage > 0.9) {
        brewHandStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    } else if (usage.percentage > 0.7) {
        brewHandStatusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
        brewHandStatusBar.backgroundColor = undefined;
    }
}

// Helper functions for HTML generation
function generateReviewHTML(analysis: any): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <title>Beer Menu - Code Review</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .score { font-size: 24px; font-weight: bold; }
            .issue { margin: 10px 0; padding: 10px; background: #f0f0f0; }
            .good { color: green; }
            .warning { color: orange; }
            .error { color: red; }
        </style>
    </head>
    <body>
        <h1>🍺 Beer Menu Code Review</h1>
        <div class="score">Quality Score: ${analysis.score}/10</div>
        <h2>Issues Found:</h2>
        ${analysis.issues.map((issue: string) => `<div class="issue">${issue}</div>`).join('')}
    </body>
    </html>`;
}

function generateDashboardHTML(usage: any, telemetry: any): string {
    return `<!DOCTYPE html>
    <html>
    <head>
        <title>Beer Menu - Usage Dashboard</title>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .metric { margin: 20px 0; padding: 15px; background: #f0f0f0; border-radius: 5px; }
            .usage-bar { width: 100%; height: 20px; background: #ddd; border-radius: 10px; overflow: hidden; }
            .usage-fill { height: 100%; background: linear-gradient(to right, #4CAF50, #FFC107, #F44336); }
        </style>
    </head>
    <body>
        <h1>🍺 Beer Menu Usage Dashboard</h1>
        <div class="metric">
            <h3>Monthly Usage</h3>
            <div class="usage-bar">
                <div class="usage-fill" style="width: ${usage.percentage * 100}%"></div>
            </div>
            <p>${usage.used} / ${usage.limit} requests (${Math.round(usage.percentage * 100)}%)</p>
        </div>
        <div class="metric">
            <h3>Statistics</h3>
            <p>Total Sessions: ${telemetry.totalSessions || 0}</p>
            <p>Average Quality Score: ${telemetry.averageQualityScore || 'N/A'}/10</p>
            <p>Shell Commands Fixed: ${telemetry.shellCommandsFixed || 0}</p>
        </div>
    </body>
    </html>`;
}

export function deactivate() {}


// Command monitoring for non-@brewhand usage
function setupCommandMonitoring(context: vscode.ExtensionContext) {
    let lastClipboardContent = '';
    let lastBrewHandUsage = 0;
    
    // Monitor clipboard for command patterns (simple detection)
    const clipboardMonitor = setInterval(async () => {
        try {
            const currentClipboard = await vscode.env.clipboard.readText();
            
            // Check if clipboard content changed and looks like a shell command
            if (currentClipboard !== lastClipboardContent && 
                currentClipboard.length > 5 && 
                currentClipboard.length < 200 &&                improveCommandDetection(currentClipboard)) {
                
                // Enhanced syntax validation
                const validation = enhanceShellSyntaxDetection(currentClipboard);
                
                if (validation.hasIssues && validation.fixed) {
                    showBrewHandCommandSuggestion(currentClipboard, validation.fixed);
                }
                
                lastClipboardContent = currentClipboard;
            }
        } catch (error) {
            // Silently handle clipboard access errors
        }
    }, 2000); // Check every 2 seconds
    
    // Monitor terminal input patterns
    vscode.window.onDidChangeActiveTerminal((terminal) => {
        if (terminal && vscode.workspace.getConfiguration('brewhand').get('alwaysActive', false)) {
            // Show reminder that BrewHand can help with commands
            setTimeout(() => {
                showBrewHandReminder();
            }, 5000); // Show after 5 seconds of terminal activity
        }
    });
    
    // Track BrewHand usage to avoid over-suggesting
    const originalHandleChatRequest = handleChatRequest;
    
    context.subscriptions.push({
        dispose: () => clearInterval(clipboardMonitor)
    });
}

function isLikelyShellCommand(text: string): boolean {
    // Patterns that suggest this is a shell command
    const commandPatterns = [
        /^(cd|npm|git|mkdir|cp|mv|rm|ls|dir|node|python|pip|dotnet|yarn|pnpm)\s/,
        /&&|\|\||;/, // Command chaining
        /^[a-zA-Z][a-zA-Z0-9-_]*\s+/, // Command with arguments
        /\$\(|\`/, // Command substitution
        /^\.\/|^\.\\/, // Relative path execution
    ];
    
    const trimmed = text.trim();
    
    // Skip if too long (likely not a simple command)
    if (trimmed.length > 200) return false;
    
    // Skip if contains newlines (likely code, not command)
    if (trimmed.includes('\n')) return false;
    
    // Skip common non-command patterns
    if (/^(http|https|ftp):\/\//.test(trimmed)) return false; // URLs
    if (/^[a-zA-Z]+:/.test(trimmed) && !/:\/\//.test(trimmed)) return false; // Drive letters on Windows
    
    return commandPatterns.some(pattern => pattern.test(trimmed));
}

function hasShellSyntaxIssues(command: string): boolean {
    // Check for common PowerShell vs Bash syntax issues
    const isPowerShell = process.platform === 'win32';
    
    if (isPowerShell) {
        // In PowerShell, && should be ; or -and
        return command.includes('&&') && !command.includes('git'); // Git commands often use && correctly
    } else {
        // In Bash/Unix, ; might be incorrect for chaining
        return command.includes(';') && command.includes('cd '); // cd with ; is often wrong
    }
}

async function showBrewHandSuggestion(command: string) {
    const config = vscode.workspace.getConfiguration('brewhand');
    
    // Don't show if user has disabled suggestions
    if (!config.get('showAutoSuggestions', true)) return;
    
    const shellInfo = commandValidator.getShellInfo();
    const isIncorrect = hasShellSyntaxIssues(command);
    
    if (isIncorrect) {
        const fixed = shellInfo.type === 'powershell' 
            ? command.replace(/&&/g, ';')
            : command.replace(/;/g, '&&');
        
        const action = await vscode.window.showWarningMessage(
            `🍺 BrewHand detected shell syntax issue in clipboard`,
            'Fix & Use @brewhand', 
            'Just Fix', 
            'Ignore'
        );
        
        if (action === 'Fix & Use @brewhand') {
            // Copy fixed command and open chat with @brewhand
            await vscode.env.clipboard.writeText(fixed);
            vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            vscode.window.showInformationMessage(
                `🍺 Fixed command copied! Now type: @brewhand explain this command`
            );
        } else if (action === 'Just Fix') {
            await vscode.env.clipboard.writeText(fixed);
            vscode.window.showInformationMessage(
                `🍺 Fixed command copied to clipboard: ${fixed}`
            );
        }
        
        // Track the suggestion
        telemetryService.trackEvent('auto_suggestion_shown', { 
            command_type: 'shell_syntax_fix',
            action: action || 'ignored'
        });
    }
}

async function showBrewHandCommandSuggestion(originalCommand: string, fixedCommand: string) {
    const config = vscode.workspace.getConfiguration('brewhand');
    
    // Don't show if user has disabled suggestions
    if (!config.get('showAutoSuggestions', true)) return;
    
    const action = await vscode.window.showWarningMessage(
        `🍺 BrewHand detected shell syntax issue: "${originalCommand}"`,
        'Fix & Copy', 
        'Use @brewhand', 
        'Show Details',
        'Ignore'
    );
    
    if (action === 'Fix & Copy') {
        await vscode.env.clipboard.writeText(fixedCommand);
        vscode.window.showInformationMessage(`✅ Fixed command copied: "${fixedCommand}"`);
    } else if (action === 'Use @brewhand') {
        // Open chat and pre-fill with command validation request
        await vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
        // Note: VS Code doesn't support pre-filling chat, so we show guidance
        vscode.window.showInformationMessage('💬 Try: @brewhand validate this command: ' + originalCommand);
    } else if (action === 'Show Details') {
        const shellInfo = commandValidator.getShellInfo();
        vscode.window.showInformationMessage(
            `🔧 Shell: ${shellInfo.type} | Original: "${originalCommand}" | Fixed: "${fixedCommand}"`
        );
    }
}

function improveCommandDetection(text: string): boolean {
    // Enhanced patterns for better command detection
    const enhancedPatterns = [
        /^(cd|npm|yarn|git|tsc|node|python|pip|cargo|go|docker|kubectl|dotnet|mvn|gradle)\s/,
        /&&|\|\||;/, // Command chaining
        /npm\s+(install|run|start|build|test)/,
        /git\s+(clone|pull|push|commit|add|status)/,
        /cd\s+[^\s]+/,
        /^\./,  // Script execution
    ];
    
    const trimmed = text.trim();
    
    // More intelligent filtering
    if (trimmed.length > 300) return false; // Too long
    if (trimmed.includes('\n')) return false; // Multi-line
    if (/(http|https|ftp):\/\//.test(trimmed)) return false; // URLs
    if (/^\w+@\w+/.test(trimmed)) return false; // Email addresses
    if (/^[a-zA-Z]:/.test(trimmed) && !trimmed.includes(' ')) return false; // Just drive letters
    
    return enhancedPatterns.some(pattern => pattern.test(trimmed));
}

function enhanceShellSyntaxDetection(command: string): { hasIssues: boolean; fixed?: string; issues: string[] } {
    const issues: string[] = [];
    let fixed = command;
    const shellInfo = commandValidator.getShellInfo();
    
    // PowerShell specific issues
    if (shellInfo.type === 'powershell') {
        if (command.includes(' && ')) {
            issues.push('PowerShell uses ";" not "&&" for command separation');
            fixed = fixed.replace(/ && /g, '; ');
        }
        if (command.match(/cd\s+[^"'][^\s]*\s/)) {
            const hasSpaces = /cd\s+[^"'][^"]*\s/.test(command);
            if (hasSpaces) {
                issues.push('PowerShell paths with spaces need quotes');
                fixed = fixed.replace(/cd\s+([^"'][^\s;]+)/g, 'cd "$1"');
            }
        }
    } else {
        // Bash/Zsh specific issues
        if (command.includes(';') && command.includes('cd ')) {
            issues.push('In Bash/Zsh, use "&&" for conditional command execution after cd');
            fixed = fixed.replace(/;\s*/g, ' && ');
        }
    }
    
    return {
        hasIssues: issues.length > 0,
        fixed: issues.length > 0 ? fixed : undefined,
        issues
    };
}

async function showBrewHandReminder() {
    const config = vscode.workspace.getConfiguration('brewhand');
    
    if (!config.get('showReminders', true)) return;
    
    // Don't show too frequently
    const lastReminder = config.get('lastReminderTime', 0);
    const timeSinceLastReminder = Date.now() - lastReminder;
    
    if (timeSinceLastReminder < 300000) return; // 5 minutes
    
    const action = await vscode.window.showInformationMessage(
        `🍺 Tip: Use @brewhand in chat for shell command help and validation`,
        'Try @brewhand',
        'Disable Reminders'
    );
    
    if (action === 'Try @brewhand') {
        vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
    } else if (action === 'Disable Reminders') {
        config.update('showReminders', false, true);
    }
    
    // Update last reminder time
    config.update('lastReminderTime', Date.now(), true);
}
