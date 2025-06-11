// BrewHand Extension for VS Code - Clean Version
// Focused on fixing shell command syntax issues

import * as vscode from 'vscode';
import { BudgetManager } from './budgetManager';
import { ComplexityAnalyzer } from './complexityAnalyzer';
import { TelemetryService } from './telemetry';
import { CommandValidator } from './commandValidator';
import { CommandFormatter } from './commandFormatter';
import { ShellDetector } from './shellDetector';
import { AIResponseEnhancer } from './aiResponseEnhancer';

// Global instances
let budgetManager: BudgetManager;
let complexityAnalyzer: ComplexityAnalyzer;
let telemetryService: TelemetryService;
let commandValidator: CommandValidator;
let aiResponseEnhancer: AIResponseEnhancer;
let statusBarItem: vscode.StatusBarItem;

// Import view providers
import { FeaturesProvider, SettingsProvider, UsageProvider } from './viewProviders';

// Extension activation
export function activate(context: vscode.ExtensionContext) {
    // Initialize managers with context for iterative support
    budgetManager = new BudgetManager(context);
    complexityAnalyzer = new ComplexityAnalyzer();
    telemetryService = new TelemetryService(context);
    commandValidator = new CommandValidator();
    aiResponseEnhancer = new AIResponseEnhancer(context); // Pass context for iterative features
    
    // Create status bar item with iterative mode indicator
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    updateStatusBarForIterativeMode();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);    // Register view providers
    const featuresProvider = new FeaturesProvider();
    const settingsProvider = new SettingsProvider();
    
    // Register tree views
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('brewhand-features', featuresProvider),
        vscode.window.registerTreeDataProvider('brewhand-settings', settingsProvider)
    );
    
    // Register refresh views command
    context.subscriptions.push(        vscode.commands.registerCommand('brewhand.refreshViews', () => {
            featuresProvider.refresh();
            settingsProvider.refresh();
        })
    );

    // Register toggle feature command
    context.subscriptions.push(
        vscode.commands.registerCommand('brewhand.toggleFeature', async (configKey) => {
            const config = vscode.workspace.getConfiguration();
            const currentValue = config.get(configKey);
            await config.update(configKey, !currentValue, vscode.ConfigurationTarget.Global);
            featuresProvider.refresh();
        })
    );

    // Register edit setting command
    context.subscriptions.push(
        vscode.commands.registerCommand('brewhand.editSetting', async (setting) => {
            if (setting.type === 'boolean') {
                const config = vscode.workspace.getConfiguration();
                await config.update(setting.configKey, !setting.value, vscode.ConfigurationTarget.Global);
                settingsProvider.refresh();
            } else if (setting.type === 'enum' && setting.options) {
                const selected = await vscode.window.showQuickPick(setting.options, {
                    placeHolder: `Select ${setting.label}`
                });
                if (selected) {
                    await vscode.workspace.getConfiguration().update(setting.configKey, selected, vscode.ConfigurationTarget.Global);
                    settingsProvider.refresh();
                }
            } else {
                const input = await vscode.window.showInputBox({
                    prompt: `Enter new value for ${setting.label}`,
                    value: String(setting.value)
                });
                if (input !== undefined) {
                    const value = setting.type === 'number' ? Number(input) : input;
                    await vscode.workspace.getConfiguration().update(setting.configKey, value, vscode.ConfigurationTarget.Global);
                    settingsProvider.refresh();
                }
            }
        })
    );

    // Register chat participant
    const brewhandParticipant = vscode.chat.createChatParticipant('brewhand', handleBrewHandChat);
    brewhandParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icons', 'beer-mug.svg');
    context.subscriptions.push(brewhandParticipant);    // Register commands including new iterative workflow commands
    context.subscriptions.push(
        vscode.commands.registerCommand('brewhand.detectShell', () => {
            const shellInfo = commandValidator.getShellInfo();
            vscode.window.showInformationMessage(
                `🔧 Detected Shell: ${shellInfo.type} | Correct separator: "${shellInfo.separator}"`
            );
        }),
        vscode.commands.registerCommand('brewhand.validateCommand', validateCommand),
        vscode.commands.registerCommand('brewhand.toggleEnhancedMode', toggleEnhancedMode),
        vscode.commands.registerCommand('brewhand.showShellReference', showShellReference),
        
        // Beer Menu navigation commands
        vscode.commands.registerCommand('brewhand.openFeatures', () => {
            vscode.commands.executeCommand('workbench.view.extension.brewhand-panel');
            vscode.commands.executeCommand('brewhand-features.focus');
        }),
        vscode.commands.registerCommand('brewhand.openSettings', () => {
            vscode.commands.executeCommand('workbench.view.extension.brewhand-panel');
            vscode.commands.executeCommand('brewhand-settings.focus');
        }),
        
        // New iterative workflow commands
        vscode.commands.registerCommand('brewhand.toggleIterativeMode', toggleIterativeMode),
        vscode.commands.registerCommand('brewhand.continueWorkflow', continueWorkflow),
        vscode.commands.registerCommand('brewhand.pauseWorkflow', pauseWorkflow),
        vscode.commands.registerCommand('brewhand.showWorkflowSummary', showWorkflowSummary),
        vscode.commands.registerCommand('brewhand.clearWorkflowHistory', clearWorkflowHistory)
    );
    
    // Monitor workspace for iterative patterns
    setupIterativeWorkflowMonitoring(context);
}

/**
 * Update status bar to show Beer Menu
 */
function updateStatusBarForIterativeMode() {
    const config = vscode.workspace.getConfiguration('brewhand');
    const iterativeMode = config.get('enableIterativeSupport', true);
    
    let statusText = "🍺 Beer Menu";
    let tooltip = "BrewHand - Open Beer Menu for features and settings";
    
    if (iterativeMode) {
        tooltip += " | Iterative assistance enabled";
    }
    
    statusBarItem.text = statusText;
    statusBarItem.tooltip = tooltip;
    // Change command to open features panel instead of toggling
    statusBarItem.command = 'brewhand.openFeatures';
}

/**
 * Setup monitoring for iterative workflow patterns
 */
function setupIterativeWorkflowMonitoring(context: vscode.ExtensionContext) {
    // Monitor file saves for iterative patterns
    vscode.workspace.onDidSaveTextDocument((document) => {
        const config = vscode.workspace.getConfiguration('brewhand');
        const iterativeSupport = config.get('enableIterativeSupport', true);
        
        if (iterativeSupport) {
            detectIterativePattern(document);
        }
    });
      // Monitor terminal commands
    let terminalCommandCount = 0;
    const terminalWatcher = vscode.window.onDidChangeActiveTerminal(() => {
        terminalCommandCount++;        if (terminalCommandCount > 3) {
            suggestIterativeAssistance('terminal');
        }
    });
    
    context.subscriptions.push(terminalWatcher);
}

/**
 * Toggle iterative mode
 */
async function toggleIterativeMode() {
    const config = vscode.workspace.getConfiguration('brewhand');
    const currentMode = config.get('enableIterativeSupport', true);
    
    await config.update('enableIterativeSupport', !currentMode, vscode.ConfigurationTarget.Workspace);
    
    // Update UI elements
    updateStatusBarForIterativeMode();
    refreshViewProviders();
    
    // Show notification
    const modeText = !currentMode ? 'ENABLED' : 'DISABLED';
    vscode.window.showInformationMessage(
        `🍺 BrewHand Iterative Support: ${modeText}`,
        'Learn More'
    ).then(selection => {
        if (selection === 'Learn More') {
            vscode.commands.executeCommand('brewhand.showWorkflowSummary', 'help');
        }
    });
}

/**
 * Continue a specific workflow
 */
async function continueWorkflow(sessionId: string) {
    if (!sessionId) {
        vscode.window.showErrorMessage('No active workflow session found.');
        return;
    }
    
    const context = aiResponseEnhancer.getConversationContext(sessionId);
    if (context) {
        vscode.window.showInformationMessage(
            `🔄 Continuing workflow session ${sessionId.split('-')[1]}...`,
            'Open Chat'
        ).then(selection => {
            if (selection === 'Open Chat') {
                vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
            }
        });
    } else {
        vscode.window.showWarningMessage('Workflow session not found or expired.');
    }
}

/**
 * Pause a workflow
 */
async function pauseWorkflow(sessionId: string) {
    const config = vscode.workspace.getConfiguration('brewhand');
    await config.update('continuousAssistanceMode', false, vscode.ConfigurationTarget.Workspace);
    
    // Update UI elements
    updateStatusBarForIterativeMode();
    refreshViewProviders();
    
    vscode.window.showInformationMessage(
        '⏸️ Workflow paused. Use @brewhand to continue when ready.'
    );
}

/**
 * Show workflow summary
 */
async function showWorkflowSummary(sessionId: string) {
    if (sessionId === 'help') {
        // Show help information
        const helpContent = createIterativeHelpContent();
        const doc = await vscode.workspace.openTextDocument({
            content: helpContent,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
        return;
    }
    
    const context = aiResponseEnhancer.getConversationContext(sessionId);
    if (context) {
        const summaryContent = createWorkflowSummary(context);
        const doc = await vscode.workspace.openTextDocument({
            content: summaryContent,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
    } else {
        vscode.window.showWarningMessage('No workflow summary available.');
    }
}

/**
 * Clear workflow history
 */
async function clearWorkflowHistory() {
    const response = await vscode.window.showWarningMessage(
        'Clear all workflow history? This cannot be undone.',
        'Clear History',
        'Cancel'
    );
    
    if (response === 'Clear History') {
        aiResponseEnhancer.clearAllConversations();
        vscode.window.showInformationMessage('🗑️ Workflow history cleared.');
    }
}

/**
 * Create iterative help content
 */
function createIterativeHelpContent(): string {
    return `# BrewHand Iterative Workflow Support

## What is Iterative Support?

BrewHand's iterative support helps you throughout multi-step development processes by:

1. **Tracking Context**: Remembers your previous requests and patterns
2. **Continuous Assistance**: Provides ongoing help throughout workflows
3. **Smart Suggestions**: Recommends next steps based on your activity
4. **Shell Awareness**: Maintains shell-specific context throughout

## How It Works

### Automatic Detection
- Monitors file changes for iterative patterns
- Detects multiple terminal commands
- Recognizes development workflows

### Iterative Mode
- Enable with Beer Menu panel or command palette
- Provides ongoing assistance without repeated @brewhand calls
- Maintains conversation context across interactions

### Workflow Controls
- **Continue**: Resume an active workflow
- **Pause**: Temporarily disable iterative assistance
- **Summary**: View workflow history and patterns

## Configuration

\`\`\`json
{
  "brewhand.enableIterativeSupport": true,
  "brewhand.showIterativeSuggestions": true
}
\`\`\`

## Best Practices

1. **Start with @brewhand** for complex, multi-step tasks
2. **Enable iterative mode** for long development sessions
3. **Use workflow controls** to manage assistance level
4. **Review summaries** to track progress and patterns
`;
}

/**
 * Create workflow summary content
 */
function createWorkflowSummary(context: any): string {
    const duration = Math.round((Date.now() - context.startTime) / 1000 / 60);
    
    return `# Workflow Summary

**Session ID**: ${context.sessionId}
**Duration**: ${duration} minutes
**Workflow Type**: ${context.activeWorkflow}
**Total Requests**: ${context.previousRequests.length}

## Detected Patterns
${context.detectedPatterns.map((pattern: string) => `- ${pattern}`).join('\n')}

## Request History
${context.previousRequests.map((req: string, i: number) => `${i + 1}. ${req}`).join('\n')}

## Shell Context
- **Type**: ${aiResponseEnhancer.getShellInfo().type}
- **Separator**: ${aiResponseEnhancer.getShellInfo().separator}

## Recommendations
Based on this workflow, consider:
1. Testing the implemented changes
2. Adding error handling where appropriate
3. Documenting the process for future reference
4. Running relevant tests to ensure quality
`;
}

// Main chat participant handler - enhanced for AI response quality
async function handleBrewHandChat(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    try {
        const shellInfo = commandValidator.getShellInfo();
        const config = vscode.workspace.getConfiguration('brewhand');
        const enhancedModeEnabled = config.get('enhancedAIMode', true);
        
        // Detect if this is a request that would benefit from enhanced AI responses
        const needsEnhancedResponse = detectNeedsEnhancement(request.prompt);
        
        // Use enhanced AI response for complex requests
        if (enhancedModeEnabled && needsEnhancedResponse) {
            return await aiResponseEnhancer.enhanceAIResponse(
                request.prompt,
                stream,
                token,
                {
                    preventIncorrectSyntax: true,
                    autoCorrectCommands: true,
                    addShellContext: true,
                    includeEducationalTips: true
                }
            );
        }
        
        // Fall back to command validation mode for simple command fixes
        return await handleCommandValidation(request, stream, shellInfo);
        
    } catch (error) {
        stream.markdown(`❌ **Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        stream.markdown('Please try again or report this issue.\n');
        return { metadata: { command: 'brewhand' } };
    }
}

// Detect if request needs enhanced AI response
function detectNeedsEnhancement(prompt: string): boolean {
    const enhancementTriggers = [
        /(?:create|generate|write|build|implement)/i,
        /(?:how (?:do|to)|show me|example)/i,
        /(?:script|function|class|component)/i,
        /(?:setup|configure|install)/i,
        /(?:deploy|run|start|compile)/i,
        /(?:test|debug|fix)/i
    ];
    
    return enhancementTriggers.some(pattern => pattern.test(prompt));
}

// Handle simple command validation (legacy behavior)
async function handleCommandValidation(
    request: vscode.ChatRequest,
    stream: vscode.ChatResponseStream,
    shellInfo: any
): Promise<vscode.ChatResult> {
    // Enhanced command detection
    const commandPatterns = [
        /(?:cd|npm|yarn|git|tsc|node|python|pip|docker|kubectl)\s+[^\n]+/gi,
        /[^&;|\n]+(?:&&|;|\|)[^&;|\n]+/gi  // Chained commands
    ];
    
    let detectedCommands: string[] = [];
    commandPatterns.forEach(pattern => {
        const matches = request.prompt.match(pattern);
        if (matches) {
            detectedCommands.push(...matches);
        }
    });
    
    // Check if user is asking for command help
    const isCommandRequest = /(?:command|shell|terminal|syntax|&&|;|how to|help)/i.test(request.prompt);
    
    stream.markdown('🍺 **BrewHand Command Assistant**\n\n');
    stream.markdown(`🖥️ **Detected Shell:** ${shellInfo.type}\n`);
    stream.markdown(`🔗 **Correct Separator:** \`${shellInfo.separator}\`\n\n`);
    
    if (detectedCommands.length > 0) {
        stream.markdown('**📋 Commands Found & Validated:**\n\n');
        
        for (const command of detectedCommands) {
            const formatter = new CommandFormatter();
            const validation = formatter.validateSyntax(command.trim());
            
            stream.markdown(`**Command:** \`${command.trim()}\`\n`);
            
            if (!validation.valid) {
                stream.markdown(`❌ **Issues Found:**\n`);
                validation.issues.forEach(issue => {
                    stream.markdown(`   - ${issue}\n`);
                });
                
                if (validation.fixed) {
                    stream.markdown(`✅ **Corrected:** \`${validation.fixed}\`\n`);
                    stream.button({
                        command: 'vscode.env.clipboard.writeText',
                        arguments: [validation.fixed],
                        title: '📋 Copy Fixed Command'
                    });
                }
            } else {
                stream.markdown(`✅ **Status:** Syntax is correct for ${shellInfo.type}\n`);
            }
            stream.markdown('\n');
        }
    }
    
    // Provide shell-specific syntax help
    stream.markdown('## 💡 Shell Syntax Guide\n\n');
    
    if (shellInfo.type === 'powershell') {
        stream.markdown('**PowerShell Commands:**\n');
        stream.markdown('- ✅ Use `;` to chain: `cd project; npm install; npm start`\n');
        stream.markdown('- ❌ Avoid `&&`: PowerShell uses different conditional logic\n');
        stream.markdown('- 📁 Quote paths: `cd "My Project"`\n');
        stream.markdown('- 🔄 Example: `cd "d:\\projects\\app"; npm run compile; npm start`\n\n');
    } else if (shellInfo.type === 'bash' || shellInfo.type === 'zsh') {
        stream.markdown('**Bash/Zsh Commands:**\n');
        stream.markdown('- ✅ Use `&&` for conditional: `cd project && npm install && npm start`\n');
        stream.markdown('- ⚡ Use `;` for sequential: `cd project; npm install; npm start`\n');
        stream.markdown('- 📁 Quote paths: `cd "My Project"`\n');
        stream.markdown('- 🔄 Example: `cd "~/projects/app" && npm run compile && npm start`\n\n');
    } else if (shellInfo.type === 'cmd') {
        stream.markdown('**Command Prompt (CMD):**\n');
        stream.markdown('- ✅ Use `&` to chain: `cd project & npm install & npm start`\n');
        stream.markdown('- 📁 Quote paths: `cd "My Project"`\n');
        stream.markdown('- 🔄 Example: `cd "C:\\projects\\app" & npm run compile & npm start`\n\n');
    }
    
    // Common commands with correct syntax for current shell
    stream.markdown('## 🚀 Common Development Commands\n\n');
    stream.markdown(`**Navigation & Build:**\n`);
    stream.markdown(`\`cd "project-folder"${shellInfo.separator} npm install${shellInfo.separator} npm run build\`\n\n`);
    stream.markdown(`**Compile & Start:**\n`);
    stream.markdown(`\`npm run compile${shellInfo.separator} npm start\`\n\n`);
    stream.markdown(`**Git & Deploy:**\n`);
    stream.markdown(`\`git add .${shellInfo.separator} git commit -m "update"${shellInfo.separator} git push\`\n\n`);
    
    if (isCommandRequest && detectedCommands.length === 0) {
        stream.markdown('💬 **Ask me about specific commands!** For example:\n');
        stream.markdown('- "How do I compile and run my project?"\n');
        stream.markdown('- "Fix this command: cd project && npm start"\n');
        stream.markdown('- "What\'s the correct syntax for my shell?"\n\n');
    }
    
    stream.markdown('---\n');
    stream.markdown('**🎯 Pro Tip:** Always verify compilation output before running dependent commands!\n');
    
    // Track usage
    telemetryService.trackEvent('chat_interaction', {
        shell_type: shellInfo.type,
        commands_detected: detectedCommands.length,
        is_command_request: isCommandRequest
    });
    
    return { metadata: { command: 'brewhand' } };
}

// Standalone command validation
async function validateCommand() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('No active editor found');
        return;
    }

    const selection = editor.selection;
    const text = editor.document.getText(selection);
    
    if (!text) {
        vscode.window.showErrorMessage('No text selected');
        return;
    }

    const formatter = new CommandFormatter();
    const validation = formatter.validateSyntax(text);
    
    if (validation.valid) {
        vscode.window.showInformationMessage('✅ Command syntax is correct!');
    } else {
        const message = `❌ Issues found: ${validation.issues.join(', ')}`;
        if (validation.fixed) {
            vscode.window.showWarningMessage(message, 'Use Fixed Version').then(response => {
                if (response === 'Use Fixed Version') {
                    editor.edit(editBuilder => {
                        editBuilder.replace(selection, validation.fixed!);
                    });
                }
            });
        } else {
            vscode.window.showErrorMessage(message);
        }
    }
}

// Toggle enhanced AI response mode
async function toggleEnhancedMode() {
    const config = vscode.workspace.getConfiguration('brewhand');
    const currentMode = config.get('enhancedAIMode', true);
    
    await config.update('enhancedAIMode', !currentMode, vscode.ConfigurationTarget.Global);
    refreshViewProviders();
    
    const modeText = !currentMode ? 'ENABLED' : 'DISABLED';
    vscode.window.showInformationMessage(
        `🍺 BrewHand Enhanced AI Mode: ${modeText}`,
        'Learn More'
    ).then(selection => {
        if (selection === 'Learn More') {
            vscode.commands.executeCommand('brewhand.showShellReference');
        }
    });
}

// Show shell reference card
async function showShellReference() {
    const referenceContent = aiResponseEnhancer.createShellReferenceCard();
    
    // Create a new untitled document with the reference
    const doc = await vscode.workspace.openTextDocument({
        content: referenceContent,
        language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
}

/**
 * Suggest iterative assistance based on detected patterns
 */
async function suggestIterativeAssistance(trigger: 'terminal' | 'file_changes') {
    const config = vscode.workspace.getConfiguration('brewhand');
    const showSuggestions = config.get('showIterativeSuggestions', true);
    const lastSuggestion = config.get('lastIterativeSuggestion', 0);
    
    // Cooldown period to avoid spam
    if (Date.now() - lastSuggestion < 300000) return; // 5 minutes
    
    if (showSuggestions) {        const message = trigger === 'terminal' 
            ? '🍺 BrewHand: Detected multiple terminal commands. Enable iterative assistance?'
            : '🍺 BrewHand: Detected iterative editing. Want help throughout this workflow?';
            
        const response = await vscode.window.showInformationMessage(
            message,
            'Enable Iterative Mode',
            'Just for this session',
            'No thanks'
        );
        
        config.update('lastIterativeSuggestion', Date.now(), vscode.ConfigurationTarget.Global);        if (response === 'Enable Iterative Mode') {
            await config.update('enableIterativeSupport', true, vscode.ConfigurationTarget.Workspace);
            updateStatusBarForIterativeMode();
            refreshViewProviders();
            vscode.window.showInformationMessage('🍺 Iterative assistance enabled! BrewHand will help throughout your workflow.');
        } else if (response === 'Just for this session') {
            await config.update('enableIterativeSupport', true, vscode.ConfigurationTarget.Workspace);
            updateStatusBarForIterativeMode();
            refreshViewProviders();
            vscode.window.showInformationMessage('🍺 Iterative support enabled for this session.');
        }
    }
}

/**
 * Detect iterative development patterns
 */
function detectIterativePattern(document: vscode.TextDocument) {
    // Simplified pattern detection - in practice, this would be more sophisticated
    const diagnostics = vscode.languages.getDiagnostics(document.uri);
    
    // If there are errors, suggest assistance
    if (diagnostics.length > 0) {
        suggestIterativeAssistance('file_changes');
    }
}

/**
 * Refresh all view providers
 * This function can be called when settings change to update the UI
 */
function refreshViewProviders() {
    vscode.commands.executeCommand('brewhand.refreshViews');
}

export function deactivate() {
    // Clean up any active conversations
    if (aiResponseEnhancer) {
        aiResponseEnhancer.clearAllConversations();
    }
}
