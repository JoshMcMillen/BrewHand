// BrewHand Extension for VS Code - Clean Version
// Focused on fixing shell command syntax issues

import * as vscode from 'vscode';
import { BudgetManager } from './budgetManager';
import { ComplexityAnalyzer } from './complexityAnalyzer';
import { TelemetryService } from './telemetry';
import { CommandValidator } from './commandValidator';
import { CommandFormatter } from './commandFormatter';
import { ShellDetector } from './shellDetector';

// Global instances
let budgetManager: BudgetManager;
let complexityAnalyzer: ComplexityAnalyzer;
let telemetryService: TelemetryService;
let commandValidator: CommandValidator;
let statusBarItem: vscode.StatusBarItem;

// Extension activation
export function activate(context: vscode.ExtensionContext) {
    // Initialize managers
    budgetManager = new BudgetManager(context);
    complexityAnalyzer = new ComplexityAnalyzer();
    telemetryService = new TelemetryService(context);
    commandValidator = new CommandValidator();
    
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    statusBarItem.text = "🍺 BrewHand";
    statusBarItem.tooltip = "BrewHand - Shell command validation and quality assistance";
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);

    // Register chat participant
    const brewhandParticipant = vscode.chat.createChatParticipant('brewhand', handleBrewHandChat);
    brewhandParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'icons', 'beer-mug.svg');
    context.subscriptions.push(brewhandParticipant);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('brewhand.detectShell', () => {
            const shellInfo = commandValidator.getShellInfo();
            vscode.window.showInformationMessage(
                `🔧 Detected Shell: ${shellInfo.type} | Correct separator: "${shellInfo.separator}"`
            );
        }),
        vscode.commands.registerCommand('brewhand.validateCommand', validateCommand)
    );
}

// Main chat participant handler - focused on command validation
async function handleBrewHandChat(
    request: vscode.ChatRequest,
    context: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
    try {
        const shellInfo = commandValidator.getShellInfo();
        
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
        
    } catch (error) {
        stream.markdown(`❌ **Error:** ${error instanceof Error ? error.message : 'Unknown error'}\n`);
        stream.markdown('Please try again or report this issue.\n');
        return { metadata: { command: 'brewhand' } };
    }
}

// Standalone command validation
async function validateCommand() {
    const input = await vscode.window.showInputBox({
        prompt: 'Enter command to validate for your current shell',
        placeHolder: 'cd project && npm install'
    });
    
    if (input) {
        const formatter = new CommandFormatter();
        const validation = formatter.validateSyntax(input);
        const shellInfo = commandValidator.getShellInfo();
        
        if (validation.valid) {
            vscode.window.showInformationMessage(
                `✅ Command syntax is correct for ${shellInfo.type}: ${input}`
            );
        } else {
            const issues = validation.issues.join(', ');
            if (validation.fixed) {
                vscode.window.showWarningMessage(
                    `⚠️ Syntax issues: ${issues}`,
                    'Copy Fixed Command', 'Cancel'
                ).then(selection => {
                    if (selection === 'Copy Fixed Command') {
                        vscode.env.clipboard.writeText(validation.fixed!);
                        vscode.window.showInformationMessage(`✅ Fixed command copied: ${validation.fixed}`);
                    }
                });
            } else {
                vscode.window.showErrorMessage(`❌ Syntax issues: ${issues}`);
            }
        }
    }
}

export function deactivate() {}
