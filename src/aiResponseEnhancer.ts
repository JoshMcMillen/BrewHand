// AI Response Enhancer - Prevents AI from generating incorrect shell syntax
// This system intercepts and enhances AI responses to ensure shell command correctness

import * as vscode from 'vscode';
import { CommandFormatter } from './commandFormatter';
import { ShellDetector, ShellInfo } from './shellDetector';

export interface AIResponseEnhancementOptions {
    preventIncorrectSyntax: boolean;
    autoCorrectCommands: boolean;
    addShellContext: boolean;
    includeEducationalTips: boolean;
    maintainContext?: boolean;
    iterativeSupport?: boolean;
}

export interface ConversationContext {
    sessionId: string;
    startTime: number;
    previousRequests: string[];
    detectedPatterns: string[];
    cumulativeContext: string;
    activeWorkflow: 'iterative' | 'single' | null;
}

export class AIResponseEnhancer {
    private formatter: CommandFormatter;
    private shellInfo: ShellInfo;
    private activeConversations: Map<string, ConversationContext>;
    private fileWatcher: vscode.FileSystemWatcher | null;
    private activeWorkspaceState: vscode.Memento;
    
    constructor(context?: vscode.ExtensionContext) {
        this.formatter = new CommandFormatter();
        this.shellInfo = ShellDetector.detect();
        this.activeConversations = new Map();
        this.fileWatcher = null;
        this.activeWorkspaceState = context?.workspaceState || {} as vscode.Memento;
        
        if (context) {
            this.initializeIterativeSupport(context);
        }
    }

    /**
     * Creates a shell-aware system prompt that prevents AI from generating incorrect commands
     */
    createShellAwareSystemPrompt(originalPrompt: string): string {
        const systemContext = this.buildShellSystemContext();
        return `${systemContext}\n\nUser Request: ${originalPrompt}`;
    }

    /**
     * Builds comprehensive shell context for AI system prompt
     */
    private buildShellSystemContext(): string {
        const context = `CRITICAL SHELL COMMAND REQUIREMENTS:

Current Environment: ${this.shellInfo.type.toUpperCase()}
Command Separator: ${this.shellInfo.separator}
Path Quoting: ${this.shellInfo.pathQuote}

MANDATORY COMMAND SYNTAX RULES:
${this.getShellSpecificRules()}

VERIFICATION CHECKLIST:
- ✅ Always use "${this.shellInfo.separator}" for chaining commands
- ✅ Quote paths with spaces using ${this.shellInfo.pathQuote}
- ✅ Test commands mentally for ${this.shellInfo.type} compatibility
- ❌ NEVER use incorrect separators (this causes execution failures)

COMMAND EXAMPLES FOR ${this.shellInfo.type.toUpperCase()}:
${this.getShellExamples()}

When providing ANY shell commands, you MUST follow these rules precisely. 
Incorrect syntax will cause user frustration and workflow interruption.`;

        return context;
    }

    /**
     * Gets shell-specific syntax rules
     */
    private getShellSpecificRules(): string {
        switch (this.shellInfo.type) {
            case 'powershell':
                return `1. Use ";" (semicolon) to chain commands: cmd1; cmd2; cmd3
2. NEVER use "&&" - this is bash syntax and will fail
3. Quote paths with spaces: cd "My Project"
4. Variables use $env: prefix: $env:PATH
5. Example: cd "C:\\projects"; npm install; npm start`;

            case 'bash':
            case 'zsh':
                return `1. Use "&&" for conditional execution: cmd1 && cmd2 && cmd3
2. Use ";" for sequential execution: cmd1; cmd2; cmd3
3. Quote paths with spaces: cd "My Project"
4. Variables use $ prefix: $PATH
5. Example: cd "/projects" && npm install && npm start`;

            case 'cmd':
                return `1. Use "&" to chain commands: cmd1 & cmd2 & cmd3
2. Quote paths with spaces: cd "My Project"
3. Variables use % prefix: %PATH%
4. Example: cd "C:\\projects" & npm install & npm start`;

            case 'fish':
                return `1. Use "; and" to chain commands: cmd1; and cmd2; and cmd3
2. Quote paths with spaces: cd "My Project"
3. Variables use $ prefix: $PATH
4. Example: cd "/projects"; and npm install; and npm start`;

            default:
                return `1. Use appropriate separators for the detected shell
2. Always quote paths with spaces
3. Follow platform-specific conventions`;
        }
    }

    /**
     * Gets shell-specific command examples
     */
    private getShellExamples(): string {
        const sep = this.shellInfo.separator;
        const quote = this.shellInfo.pathQuote;
        
        return `✅ CORRECT: cd ${quote}project folder${quote}${sep} npm install${sep} npm start
✅ CORRECT: git add .${sep} git commit -m ${quote}update${quote}${sep} git push
✅ CORRECT: npm run build${sep} npm test${sep} npm run deploy

❌ WRONG: Never mix separators from different shells
❌ WRONG: Never use unquoted paths with spaces`;
    }

    /**
     * Enhances AI responses by validating and correcting shell commands
     */
    async enhanceAIResponse(
        originalPrompt: string,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken,
        options: AIResponseEnhancementOptions = {
            preventIncorrectSyntax: true,
            autoCorrectCommands: true,
            addShellContext: true,
            includeEducationalTips: true,
            maintainContext: true,
            iterativeSupport: true
        }
    ): Promise<vscode.ChatResult> {
        try {
            // Generate or update conversation context
            const sessionId = this.generateSessionId();
            let context = this.activeConversations.get(sessionId);
              if (!context && options.maintainContext) {
                context = this.createConversationContext(sessionId, originalPrompt);
            } else if (context && options.maintainContext) {
                const updatedContext = this.updateConversationContext(sessionId, originalPrompt);
                if (updatedContext) {
                    context = updatedContext;
                }
            }

            // Get AI models
            const models = await vscode.lm.selectChatModels({
                vendor: 'copilot',
                family: 'gpt-4o'
            });            if (models.length === 0) {
                stream.markdown('❌ No AI language models available. Please ensure GitHub Copilot or compatible service is active.\n');
                return { metadata: { command: 'brewhand-enhanced' } };
            }

            const model = models[0];

            // Create context-aware prompt
            let enhancedPrompt = originalPrompt;
            if (options.addShellContext) {
                enhancedPrompt = this.createShellAwareSystemPrompt(originalPrompt);
            }
            
            // Add conversation context for iterative workflows
            if (context && options.iterativeSupport) {
                enhancedPrompt = this.addIterativeContext(enhancedPrompt, context);
            }

            // Create chat messages array for the API
            const messages: vscode.LanguageModelChatMessage[] = [
                vscode.LanguageModelChatMessage.User(enhancedPrompt)
            ];

            // Stream enhanced response with context indicator
            if (context?.activeWorkflow === 'iterative') {
                stream.markdown(`🍺 **BrewHand Continuous Mode** (Shell: ${this.shellInfo.type}) - Step ${context.previousRequests.length}\n\n`);
            } else {
                stream.markdown(`🍺 **BrewHand Enhanced Response** (Shell: ${this.shellInfo.type})\n\n`);
            }

            const chatResponse = await model.sendRequest(messages, {}, token);
            let responseText = '';

            for await (const fragment of chatResponse.text) {
                responseText += fragment;
                stream.markdown(fragment);
            }

            // Post-process response to validate commands
            if (options.autoCorrectCommands) {
                await this.validateAndCorrectResponseCommands(responseText, stream);
            }

            // Add iterative workflow suggestions
            if (context && options.iterativeSupport) {
                this.addIterativeWorkflowSuggestions(stream, context);
            }

            // Add educational context
            if (options.includeEducationalTips) {
                this.addEducationalTips(stream);
            }

            return { metadata: { 
                command: 'brewhand-enhanced',
                sessionId: sessionId,
                iterative: context?.activeWorkflow === 'iterative'
            } };

        } catch (error) {
            stream.markdown(`❌ **Error enhancing response:** ${error instanceof Error ? error.message : 'Unknown error'}\n`);
            stream.markdown('Falling back to standard response generation...\n\n');
            
            // Fall back to basic response
            return this.generateBasicResponse(originalPrompt, stream);
        }
    }

    /**
     * Add iterative context to the prompt
     */
    private addIterativeContext(prompt: string, context: ConversationContext): string {
        const iterativeContext = `
ITERATIVE WORKFLOW CONTEXT:
- Session: ${context.sessionId}
- Step: ${context.previousRequests.length}
- Patterns: ${context.detectedPatterns.join(', ')}
- Duration: ${Math.round((Date.now() - context.startTime) / 1000 / 60)} minutes

${context.cumulativeContext}

CONTINUE ASSISTING with this iterative workflow. Provide:
1. Immediate solution for current request
2. Next step suggestions
3. Potential issues to watch for
4. Relevant commands for the detected shell

${prompt}`;

        return iterativeContext;
    }

    /**
     * Add suggestions for continuing the iterative workflow
     */
    private addIterativeWorkflowSuggestions(stream: vscode.ChatResponseStream, context: ConversationContext) {
        stream.markdown('\n---\n');
        stream.markdown('## 🔄 **Continuous Workflow Assistance**\n\n');
        
        // Suggest next steps based on detected patterns
        const suggestions = this.generateNextStepSuggestions(context);
        
        if (suggestions.length > 0) {
            stream.markdown('**💡 Suggested Next Steps:**\n');
            suggestions.forEach((suggestion, i) => {
                stream.markdown(`${i + 1}. ${suggestion}\n`);
            });
            stream.markdown('\n');
        }
        
        // Add workflow controls
        stream.markdown('**🎮 Workflow Controls:**\n');
        stream.button({
            command: 'brewhand.continueWorkflow',
            arguments: [context.sessionId],
            title: '⏭️ Continue Workflow'
        });
        
        stream.button({
            command: 'brewhand.pauseWorkflow',
            arguments: [context.sessionId],
            title: '⏸️ Pause Assistance'
        });
        
        stream.button({
            command: 'brewhand.showWorkflowSummary',
            arguments: [context.sessionId],
            title: '📊 Show Summary'
        });
        
        stream.markdown('\n');
    }

    /**
     * Generate next step suggestions based on workflow patterns
     */
    private generateNextStepSuggestions(context: ConversationContext): string[] {
        const suggestions: string[] = [];
        const patterns = context.detectedPatterns;
        
        if (patterns.includes('creation')) {
            suggestions.push('Test the created functionality');
            suggestions.push('Add error handling and validation');
            suggestions.push('Create documentation');
        }
        
        if (patterns.includes('modification')) {
            suggestions.push('Verify the changes work as expected');
            suggestions.push('Run tests to ensure no regressions');
            suggestions.push('Update related code if needed');
        }
        
        if (patterns.includes('troubleshooting')) {
            suggestions.push('Check error logs for additional clues');
            suggestions.push('Test the fix in isolation');
            suggestions.push('Consider edge cases');
        }
        
        if (patterns.includes('validation')) {
            suggestions.push('Review test coverage');
            suggestions.push('Consider adding integration tests');
            suggestions.push('Document the testing approach');
        }
        
        // Add shell-specific suggestions
        suggestions.push(`Run commands using ${this.shellInfo.separator} separator`);
        
        return suggestions.slice(0, 4); // Limit to most relevant suggestions
    }

    /**
     * Generate a session ID for conversation tracking
     */
    private generateSessionId(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `brewhand-${timestamp}-${random}`;
    }

    /**
     * Validates and corrects commands found in AI response
     */
    private async validateAndCorrectResponseCommands(
        responseText: string,
        stream: vscode.ChatResponseStream
    ): Promise<void> {
        // Extract code blocks that might contain commands
        const codeBlockRegex = /```(?:bash|shell|powershell|cmd|terminal)?\n([\s\S]*?)```/g;
        const inlineCodeRegex = /`([^`]+)`/g;
        
        const foundCommands: string[] = [];
        let match;

        // Extract from code blocks
        while ((match = codeBlockRegex.exec(responseText)) !== null) {
            const commands = this.extractCommandsFromText(match[1]);
            foundCommands.push(...commands);
        }

        // Extract from inline code
        while ((match = inlineCodeRegex.exec(responseText)) !== null) {
            const commands = this.extractCommandsFromText(match[1]);
            foundCommands.push(...commands);
        }

        if (foundCommands.length > 0) {
            stream.markdown('\n---\n');
            stream.markdown('## 🔍 **BrewHand Command Validation**\n\n');
            
            let hasIssues = false;

            for (const command of foundCommands) {
                const validation = this.formatter.validateSyntax(command.trim());
                
                if (!validation.valid) {
                    hasIssues = true;
                    stream.markdown(`⚠️ **Command Issue Detected:**\n`);
                    stream.markdown(`- Original: \`${command}\`\n`);
                    stream.markdown(`- Issues: ${validation.issues.join(', ')}\n`);
                    
                    if (validation.fixed) {
                        stream.markdown(`- ✅ **Corrected:** \`${validation.fixed}\`\n`);
                        stream.button({
                            command: 'vscode.env.clipboard.writeText',
                            arguments: [validation.fixed],
                            title: '📋 Copy Corrected Command'
                        });
                    }
                    stream.markdown('\n');
                }
            }

            if (!hasIssues) {
                stream.markdown('✅ All commands are correctly formatted for your shell!\n');
            }
        }
    }

    /**
     * Extracts potential shell commands from text
     */
    private extractCommandsFromText(text: string): string[] {
        const commandPatterns = [
            /(?:^|\n)\s*((?:cd|npm|yarn|git|tsc|node|python|pip|docker|kubectl|mvn|gradle)\s+[^\n]+)/gm,
            /(?:^|\n)\s*([^#\n]+(?:&&|;|\|)[^#\n]+)/gm // Multi-command lines
        ];

        const commands: string[] = [];
        
        for (const pattern of commandPatterns) {
            let match;
            while ((match = pattern.exec(text)) !== null) {
                const command = match[1].trim();
                if (command && !commands.includes(command)) {
                    commands.push(command);
                }
            }
        }

        return commands;
    }

    /**
     * Adds educational tips about shell usage
     */
    private addEducationalTips(stream: vscode.ChatResponseStream): void {
        stream.markdown('\n---\n');
        stream.markdown('## 💡 **BrewHand Shell Tips**\n\n');
        stream.markdown(`**Current Shell:** ${this.shellInfo.type}\n`);
        stream.markdown(`**Command Separator:** \`${this.shellInfo.separator}\`\n`);
        stream.markdown(`**Path Quoting:** Use ${this.shellInfo.pathQuote} for paths with spaces\n\n`);
        
        stream.markdown('**🎯 Pro Tips:**\n');
        stream.markdown('- Always validate commands before execution\n');
        stream.markdown('- Use BrewHand for cross-platform command compatibility\n');
        stream.markdown('- Consider using `@brewhand` for shell-specific guidance\n');
    }

    /**
     * Generates a basic response when enhanced mode fails
     */
    private async generateBasicResponse(
        prompt: string,
        stream: vscode.ChatResponseStream
    ): Promise<vscode.ChatResult> {
        stream.markdown('🍺 **BrewHand Basic Response**\n\n');
        stream.markdown(`I understand you're asking: "${prompt}"\n\n`);
        stream.markdown('For accurate shell commands, please ensure you:\n');
        stream.markdown(`- Use \`${this.shellInfo.separator}\` to chain commands in ${this.shellInfo.type}\n`);
        stream.markdown(`- Quote paths with spaces using ${this.shellInfo.pathQuote}\n`);
        stream.markdown('- Test commands in a safe environment first\n\n');
        stream.markdown('💡 Try asking your question again with more specific details for better assistance.\n');
        
        return { metadata: { command: 'brewhand-basic' } };
    }

    /**
     * Creates a command reference card for the current shell
     */
    createShellReferenceCard(): string {
        return `
# ${this.shellInfo.type.toUpperCase()} Command Reference

## Command Chaining
- **Separator:** \`${this.shellInfo.separator}\`
- **Example:** \`cmd1${this.shellInfo.separator}cmd2${this.shellInfo.separator}cmd3\`

## Path Handling
- **Quote Character:** \`${this.shellInfo.pathQuote}\`
- **Example:** \`cd ${this.shellInfo.pathQuote}My Project${this.shellInfo.pathQuote}\`

## Environment Variables
- **Prefix:** \`${this.shellInfo.envPrefix}\`

## Sample Commands
\`\`\`${this.shellInfo.type}
${this.shellInfo.exampleCommand}
\`\`\`
`;
    }

    /**
     * Initialize continuous assistance features
     */
    private initializeIterativeSupport(context: vscode.ExtensionContext) {
        // Monitor workspace changes to detect iterative workflows
        this.fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.{ts,js,py,json,md}');
        
        this.fileWatcher.onDidChange((uri) => {
            this.handleFileChange(uri);
        });
        
        this.fileWatcher.onDidCreate((uri) => {
            this.handleFileChange(uri);
        });
        
        context.subscriptions.push(this.fileWatcher);
        
        // Monitor terminal activity for shell command patterns
        vscode.window.onDidChangeActiveTerminal((terminal) => {
            if (terminal) {
                this.monitorTerminalForIterativePatterns(terminal);
            }
        });
    }

    /**
     * Handle file changes to detect iterative development patterns
     */
    private handleFileChange(uri: vscode.Uri) {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (!workspaceFolder) return;
        
        // Detect if this is part of an iterative workflow
        const relativePath = vscode.workspace.asRelativePath(uri);
        const config = vscode.workspace.getConfiguration('brewhand');
        const iterativeSupport = config.get('enableIterativeSupport', true);
        
        if (iterativeSupport) {
            this.suggestBrewHandAssistance(uri, relativePath);
        }
    }

    /**
     * Monitor terminal for iterative command patterns
     */
    private monitorTerminalForIterativePatterns(terminal: vscode.Terminal) {
        // This would be enhanced with proper terminal monitoring
        // For now, we'll integrate with the existing terminal monitoring system
    }

    /**
     * Suggest BrewHand assistance during iterative workflows
     */
    private async suggestBrewHandAssistance(uri: vscode.Uri, relativePath: string) {
        const recentActivity = this.getRecentIterativeActivity();
        
        if (recentActivity.length > 2) { // Detected iterative pattern
            const config = vscode.workspace.getConfiguration('brewhand');
            const showSuggestions = config.get('showIterativeSuggestions', true);
            
            if (showSuggestions) {
                const suggestion = await vscode.window.showInformationMessage(
                    `🍺 BrewHand: Detected iterative development. Would you like continuous assistance?`,
                    'Yes, help continuously',
                    'Just this once',
                    'No thanks'
                );
                
                if (suggestion === 'Yes, help continuously') {
                    this.enableContinuousMode();
                } else if (suggestion === 'Just this once') {
                    this.provideSingleIterationHelp(uri);
                }
            }
        }
    }

    /**
     * Get recent iterative activity patterns
     */
    private getRecentIterativeActivity(): string[] {
        // Simplified - would analyze recent file changes, terminal commands, etc.
        return this.activeWorkspaceState.get('recentActivity', []);
    }

    /**
     * Enable continuous assistance mode
     */
    private async enableContinuousMode() {
        const config = vscode.workspace.getConfiguration('brewhand');
        await config.update('continuousAssistanceMode', true, vscode.ConfigurationTarget.Workspace);
        
        vscode.window.showInformationMessage(
            '🍺 BrewHand Continuous Mode Enabled! I\'ll provide ongoing assistance.',
            'Show Dashboard'
        ).then(selection => {
            if (selection === 'Show Dashboard') {
                vscode.commands.executeCommand('brewhand.showUsageDashboard');
            }
        });
    }

    /**
     * Provide single iteration help
     */
    private async provideSingleIterationHelp(uri: vscode.Uri) {
        const document = await vscode.workspace.openTextDocument(uri);
        const diagnostics = vscode.languages.getDiagnostics(uri);
        
        if (diagnostics.length > 0) {
            const message = `🍺 Found ${diagnostics.length} issues in ${uri.fsPath.split('/').pop()}. Use @brewhand to fix these systematically.`;
            vscode.window.showInformationMessage(message, 'Open @brewhand Chat').then(selection => {
                if (selection === 'Open @brewhand Chat') {
                    vscode.commands.executeCommand('workbench.panel.chat.view.copilot.focus');
                }
            });
        }
    }

    /**
     * Enhanced conversation context tracking
     */
    createConversationContext(sessionId: string, initialPrompt: string): ConversationContext {
        const context: ConversationContext = {
            sessionId,
            startTime: Date.now(),
            previousRequests: [initialPrompt],
            detectedPatterns: this.detectWorkflowPatterns(initialPrompt),
            cumulativeContext: this.buildCumulativeContext(initialPrompt),
            activeWorkflow: this.detectWorkflowType(initialPrompt)
        };
        
        this.activeConversations.set(sessionId, context);
        return context;
    }

    /**
     * Update conversation context with new request
     */
    updateConversationContext(sessionId: string, newPrompt: string): ConversationContext | null {
        const context = this.activeConversations.get(sessionId);
        if (!context) return null;
        
        context.previousRequests.push(newPrompt);
        context.detectedPatterns.push(...this.detectWorkflowPatterns(newPrompt));
        context.cumulativeContext = this.buildCumulativeContext(newPrompt, context);
        
        // Update workflow type based on patterns
        if (context.previousRequests.length > 1) {
            context.activeWorkflow = 'iterative';
        }
        
        return context;
    }

    /**
     * Get conversation context by session ID
     */
    getConversationContext(sessionId: string): ConversationContext | undefined {
        return this.activeConversations.get(sessionId);
    }

    /**
     * Get shell information
     */
    getShellInfo(): ShellInfo {
        return this.shellInfo;
    }

    /**
     * Clear all conversation contexts
     */
    clearAllConversations(): void {
        this.activeConversations.clear();
    }

    /**
     * Get all active conversation contexts
     */
    getAllConversations(): Map<string, ConversationContext> {
        return new Map(this.activeConversations);
    }

    /**
     * Remove expired conversations (older than 2 hours)
     */
    cleanupExpiredConversations(): void {
        const twoHoursAgo = Date.now() - (2 * 60 * 60 * 1000);
        
        for (const [sessionId, context] of this.activeConversations.entries()) {
            if (context.startTime < twoHoursAgo) {
                this.activeConversations.delete(sessionId);
            }
        }
    }

    /**
     * Detect workflow patterns from prompt
     */
    private detectWorkflowPatterns(prompt: string): string[] {
        const patterns: string[] = [];
        
        // Detect iterative keywords
        if (/(?:fix|update|modify|change|improve|refactor)/i.test(prompt)) {
            patterns.push('modification');
        }
        
        if (/(?:add|implement|create|build)/i.test(prompt)) {
            patterns.push('creation');
        }
        
        if (/(?:test|debug|check|verify)/i.test(prompt)) {
            patterns.push('validation');
        }
        
        if (/(?:error|issue|problem|bug)/i.test(prompt)) {
            patterns.push('troubleshooting');
        }
        
        return patterns;
    }

    /**
     * Detect workflow type
     */
    private detectWorkflowType(prompt: string): 'iterative' | 'single' | null {
        const iterativeKeywords = /(?:step|next|then|after|continue|follow|iterative|workflow)/i;
        const singleKeywords = /(?:quick|simple|just|only|single)/i;
        
        if (iterativeKeywords.test(prompt)) return 'iterative';
        if (singleKeywords.test(prompt)) return 'single';
        return null;
    }

    /**
     * Build cumulative context from conversation history
     */
    private buildCumulativeContext(newPrompt: string, existingContext?: ConversationContext): string {
        let context = `Current shell: ${this.shellInfo.type}\nSeparator: ${this.shellInfo.separator}\n\n`;
        
        if (existingContext) {
            context += `Conversation history:\n`;
            existingContext.previousRequests.slice(-3).forEach((req, i) => {
                context += `${i + 1}. ${req}\n`;
            });
            
            context += `\nDetected patterns: ${existingContext.detectedPatterns.join(', ')}\n`;
            context += `Workflow type: ${existingContext.activeWorkflow}\n\n`;
        }
        
        context += `Current request: ${newPrompt}\n\n`;
        context += `CONTINUE PROVIDING ASSISTANCE throughout this ${existingContext?.activeWorkflow || 'workflow'}.\n`;
        
        return context;
    }
}
