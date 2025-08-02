// Simplified BrewHand Extension - Focused on Custom Instructions for Agent Mode
// Streamlined version that emphasizes VS Code's native custom instructions system

import * as vscode from 'vscode';
import { CommandValidator } from './commandValidator';
import { CommandFormatter } from './commandFormatter';
import { ShellDetector } from './shellDetector';
import { CustomInstructionsManager } from './customInstructionsManager';

// Global instances
let commandValidator: CommandValidator;
let customInstructionsManager: CustomInstructionsManager;
let statusBarItem: vscode.StatusBarItem;

// Import view providers
import { FeaturesProvider, SettingsProvider } from './viewProviders';

// Extension activation
export function activate(context: vscode.ExtensionContext) {
    // Initialize core components
    commandValidator = new CommandValidator();
    customInstructionsManager = new CustomInstructionsManager();
    
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register view providers
    const featuresProvider = new FeaturesProvider();
    const settingsProvider = new SettingsProvider();
    
    // Register tree views
    context.subscriptions.push(
        vscode.window.registerTreeDataProvider('brewhand-features', featuresProvider),
        vscode.window.registerTreeDataProvider('brewhand-settings', settingsProvider)
    );
    
    // Register refresh views command
    context.subscriptions.push(
        vscode.commands.registerCommand('brewhand.refreshViews', () => {
            featuresProvider.refresh();
            settingsProvider.refresh();
        })
    );

    // Register toggle feature command with custom instructions support
    context.subscriptions.push(
        vscode.commands.registerCommand('brewhand.toggleFeature', async (configKey) => {
            // Special handling for custom instructions
            if (configKey === 'brewhand.customInstructions.enabled') {
                const config = vscode.workspace.getConfiguration();
                const currentValue = config.get(configKey, false);
                
                if (!currentValue) {
                    // Enabling - create custom instructions
                    await vscode.commands.executeCommand('brewhand.createCustomInstructions');
                } else {
                    // Disabling - remove custom instructions
                    await vscode.commands.executeCommand('brewhand.removeCustomInstructions');
                }
            } else {
                // Standard toggle for other features
                const config = vscode.workspace.getConfiguration();
                const currentValue = config.get(configKey);
                await config.update(configKey, !currentValue, vscode.ConfigurationTarget.Global);
            }
            featuresProvider.refresh();
            updateStatusBar();
        })
    );

    // Register setting edit command
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
                    
                    // Update custom instructions if they exist and auto-update is enabled
                    const config = vscode.workspace.getConfiguration('brewhand');
                    if (config.get('customInstructions.enabled', false) && 
                        config.get('customInstructions.autoUpdate', false)) {
                        await updateCustomInstructions();
                    }
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

    // Register simplified chat participant (optional - for ask mode compatibility)
    const brewhandParticipant = vscode.chat.createChatParticipant('brewhand', handleSimplifiedChat);
    brewhandParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icons', 'beer-mug.svg');
    context.subscriptions.push(brewhandParticipant);

    // Register core commands
    context.subscriptions.push(
        // Basic shell commands
        vscode.commands.registerCommand('brewhand.detectShell', detectShell),
        vscode.commands.registerCommand('brewhand.validateCommand', validateCommand),
        vscode.commands.registerCommand('brewhand.showShellReference', showShellReference),
        
        // Beer Menu navigation
        vscode.commands.registerCommand('brewhand.openFeatures', () => {
            vscode.commands.executeCommand('workbench.view.extension.brewhand-panel');
            vscode.commands.executeCommand('brewhand-features.focus');
        }),
        vscode.commands.registerCommand('brewhand.openSettings', () => {
            vscode.commands.executeCommand('workbench.view.extension.brewhand-panel');
            vscode.commands.executeCommand('brewhand-settings.focus');
        }),
        
        // Custom instructions commands (main focus)
        vscode.commands.registerCommand('brewhand.createCustomInstructions', createCustomInstructions),
        vscode.commands.registerCommand('brewhand.updateCustomInstructions', updateCustomInstructions),
        vscode.commands.registerCommand('brewhand.removeCustomInstructions', removeCustomInstructions),
        vscode.commands.registerCommand('brewhand.viewCustomInstructions', viewCustomInstructions)
    );

    // Monitor configuration changes for auto-update
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async (e) => {
            if (e.affectsConfiguration('brewhand')) {
                updateStatusBar();
                
                // Auto-update custom instructions if enabled
                const config = vscode.workspace.getConfiguration('brewhand');
                if (config.get('customInstructions.enabled', false) && 
                    config.get('customInstructions.autoUpdate', false) &&
                    customInstructionsManager.hasCustomInstructions()) {
                    await updateCustomInstructions();
                }
            }
        })
    );
}

/**
 * Update status bar display
 */
function updateStatusBar() {
    const config = vscode.workspace.getConfiguration('brewhand');
    const customInstructionsEnabled = config.get('customInstructions.enabled', false);
    
    statusBarItem.text = "🍺 Beer Menu";
    statusBarItem.tooltip = customInstructionsEnabled 
        ? "BrewHand - Custom Instructions Active | Open Beer Menu" 
        : "BrewHand - Open Beer Menu for features and settings";
    statusBarItem.command = 'brewhand.openFeatures';
}

/**
 * Simplified chat participant for basic shell command help
 */
async function handleSimplifiedChat(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    const shellInfo = commandValidator.getShellInfo();
    
    stream.markdown('🍺 **BrewHand Shell Assistant**\n\n');
    stream.markdown(`🖥️ **Current Shell:** ${shellInfo.type}\n`);
    stream.markdown(`🔗 **Command Separator:** \`${shellInfo.separator}\`\n\n`);
    
    // Check for commands in the request
    const commandPatterns = [
        /(?:cd|npm|yarn|git|tsc|node|python|pip|docker|kubectl)\s+[^\n]+/gi,
        /[^&;|\n]+(?:&&|;|\|)[^&;|\n]+/gi
    ];
    
    let detectedCommands: string[] = [];
    commandPatterns.forEach(pattern => {
        const matches = request.prompt.match(pattern);
        if (matches) {
            detectedCommands.push(...matches);
        }
    });
    
    if (detectedCommands.length > 0) {
        stream.markdown('**🔍 Command Validation:**\n\n');
        
        for (const command of detectedCommands) {
            const formatter = new CommandFormatter();
            const validation = formatter.validateSyntax(command.trim());
            
            stream.markdown(`**Command:** \`${command.trim()}\`\n`);
            
            if (!validation.valid) {
                stream.markdown(`❌ **Issues:** ${validation.issues.join(', ')}\n`);
                if (validation.fixed) {
                    stream.markdown(`✅ **Corrected:** \`${validation.fixed}\`\n`);
                }
            } else {
                stream.markdown(`✅ **Status:** Correct for ${shellInfo.type}\n`);
            }
            stream.markdown('\n');
        }
    } else {
        stream.markdown('💡 **Quick Shell Tips:**\n\n');
        stream.markdown(`- Use \`${shellInfo.separator}\` to chain commands\n`);
        stream.markdown(`- Quote paths with spaces using \`${shellInfo.pathQuote}\`\n`);
        stream.markdown('- Ask me to validate specific commands\n\n');
    }
    
    // Promote custom instructions
    const config = vscode.workspace.getConfiguration('brewhand');
    const customInstructionsEnabled = config.get('customInstructions.enabled', false);
    
    if (!customInstructionsEnabled) {
        stream.markdown('---\n');
        stream.markdown('💡 **Pro Tip:** Enable Custom Instructions for enhanced Copilot agent mode!\n');
        stream.button({
            command: 'brewhand.createCustomInstructions',
            title: 'Create Custom Instructions'
        });
    } else {
        stream.markdown('---\n'); 
        stream.markdown('✨ **Custom Instructions Active** - Copilot agent mode enhanced with BrewHand quality standards!\n');
    }
    
    return { metadata: { command: 'brewhand-simplified' } };
}

// Core command implementations

async function detectShell() {
    const shellInfo = commandValidator.getShellInfo();
    vscode.window.showInformationMessage(
        `🔧 Detected Shell: ${shellInfo.type} | Separator: "${shellInfo.separator}"`
    );
}

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
        const message = `❌ Issues: ${validation.issues.join(', ')}`;
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

async function showShellReference() {
    const shellInfo = commandValidator.getShellInfo();
    const referenceContent = `# ${shellInfo.type.toUpperCase()} Command Reference

## Command Chaining
- **Separator:** \`${shellInfo.separator}\`
- **Example:** \`cmd1${shellInfo.separator}cmd2${shellInfo.separator}cmd3\`

## Path Handling  
- **Quote Character:** \`${shellInfo.pathQuote}\`
- **Example:** \`cd ${shellInfo.pathQuote}My Project${shellInfo.pathQuote}\`

## Sample Commands
\`\`\`${shellInfo.type}
${shellInfo.exampleCommand}
\`\`\`
`;
    
    const doc = await vscode.workspace.openTextDocument({
        content: referenceContent,
        language: 'markdown'
    });
    
    await vscode.window.showTextDocument(doc);
}

// Custom Instructions Commands

async function createCustomInstructions() {
    const config = vscode.workspace.getConfiguration('brewhand');
    
    const options = {
        includeShellContext: config.get('customInstructions.includeShellContext', true),
        includeQualityStandards: config.get('customInstructions.includeQualityStandards', true),
        includeArchitecturalGuidance: config.get('customInstructions.includeArchitecturalGuidance', true),
        strictMode: config.get('strictMode', true)
    };

    const success = await customInstructionsManager.createCustomInstructions(options);
    
    if (success) {
        await config.update('customInstructions.enabled', true, vscode.ConfigurationTarget.Workspace);
        updateStatusBar();
        vscode.commands.executeCommand('brewhand.refreshViews');
    }
}

async function updateCustomInstructions() {
    if (!customInstructionsManager.hasCustomInstructions()) {
        const response = await vscode.window.showInformationMessage(
            'No custom instructions found. Create them?',
            'Create', 'Cancel'
        );
        
        if (response === 'Create') {
            await createCustomInstructions();
        }
        return;
    }

    const config = vscode.workspace.getConfiguration('brewhand');
    
    const options = {
        includeShellContext: config.get('customInstructions.includeShellContext', true),
        includeQualityStandards: config.get('customInstructions.includeQualityStandards', true),
        includeArchitecturalGuidance: config.get('customInstructions.includeArchitecturalGuidance', true),
        strictMode: config.get('strictMode', true)
    };

    await customInstructionsManager.updateCustomInstructions(options);
}

async function removeCustomInstructions() {
    if (!customInstructionsManager.hasCustomInstructions()) {
        vscode.window.showWarningMessage('No custom instructions found.');
        return;
    }

    const response = await vscode.window.showWarningMessage(
        'Remove BrewHand custom instructions? This will affect Copilot suggestions.',
        'Remove', 'Cancel'
    );

    if (response === 'Remove') {
        const success = await customInstructionsManager.removeCustomInstructions();
        
        if (success) {
            const config = vscode.workspace.getConfiguration('brewhand');
            await config.update('customInstructions.enabled', false, vscode.ConfigurationTarget.Workspace);
            updateStatusBar();
            vscode.commands.executeCommand('brewhand.refreshViews');
        }
    }
}

async function viewCustomInstructions() {
    if (!vscode.workspace.workspaceFolders?.length) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return;
    }

    if (!customInstructionsManager.hasCustomInstructions()) {
        const response = await vscode.window.showInformationMessage(
            'No custom instructions found. Create them?',
            'Create', 'Cancel'
        );
        
        if (response === 'Create') {
            await createCustomInstructions();
        }
        return;
    }

    const workspaceFolder = vscode.workspace.workspaceFolders[0];
    const instructionsPath = vscode.Uri.joinPath(workspaceFolder.uri, '.vscode', 'copilot-instructions.md');

    try {
        const document = await vscode.workspace.openTextDocument(instructionsPath);
        await vscode.window.showTextDocument(document);
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to open custom instructions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export function deactivate() {
    // Cleanup
}