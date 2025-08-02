// Custom Instructions Manager for VS Code Copilot Integration
// Manages .vscode/copilot-instructions.md files for agent mode integration

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { ShellDetector, ShellInfo } from './shellDetector';

export interface CustomInstructionsOptions {
    includeShellContext: boolean;
    includeQualityStandards: boolean;
    includeArchitecturalGuidance: boolean;
    strictMode: boolean;
}

export class CustomInstructionsManager {
    private shellInfo: ShellInfo;
    
    constructor() {
        this.shellInfo = ShellDetector.detect();
    }

    /**
     * Create or update custom instructions file in workspace
     */
    async createCustomInstructions(options: CustomInstructionsOptions): Promise<boolean> {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder found. Open a workspace to create custom instructions.');
            return false;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        const vscodeFolderPath = path.join(workspaceFolder.uri.fsPath, '.vscode');
        const instructionsPath = path.join(vscodeFolderPath, 'copilot-instructions.md');

        try {
            // Ensure .vscode directory exists
            if (!fs.existsSync(vscodeFolderPath)) {
                fs.mkdirSync(vscodeFolderPath, { recursive: true });
            }

            // Generate instructions content
            const instructionsContent = this.generateInstructionsContent(options);

            // Write instructions file
            fs.writeFileSync(instructionsPath, instructionsContent, 'utf8');

            vscode.window.showInformationMessage(
                'BrewHand custom instructions created! Copilot will now use these guidelines for all suggestions.',
                'View Instructions'
            ).then(selection => {
                if (selection === 'View Instructions') {
                    vscode.workspace.openTextDocument(instructionsPath).then(doc => {
                        vscode.window.showTextDocument(doc);
                    });
                }
            });

            return true;
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create custom instructions: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    /**
     * Remove custom instructions from workspace
     */
    async removeCustomInstructions(): Promise<boolean> {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('No workspace folder found.');
            return false;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        const instructionsPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'copilot-instructions.md');

        try {
            if (fs.existsSync(instructionsPath)) {
                fs.unlinkSync(instructionsPath);
                vscode.window.showInformationMessage('BrewHand custom instructions removed.');
                return true;
            } else {
                vscode.window.showWarningMessage('No custom instructions file found.');
                return false;
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to remove custom instructions: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    /**
     * Check if custom instructions exist in current workspace
     */
    hasCustomInstructions(): boolean {
        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            return false;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders[0];
        const instructionsPath = path.join(workspaceFolder.uri.fsPath, '.vscode', 'copilot-instructions.md');
        
        return fs.existsSync(instructionsPath);
    }

    /**
     * Update existing custom instructions with new options
     */
    async updateCustomInstructions(options: CustomInstructionsOptions): Promise<boolean> {
        if (!this.hasCustomInstructions()) {
            return await this.createCustomInstructions(options);
        }

        return await this.createCustomInstructions(options); // Recreate with new options
    }

    /**
     * Generate the custom instructions content based on BrewHand settings
     */
    private generateInstructionsContent(options: CustomInstructionsOptions): string {
        const config = vscode.workspace.getConfiguration('brewhand');
        const architecturalFocus = config.get('architecturalFocus', 'balanced');
        
        let content = `# BrewHand Custom Instructions

These instructions guide GitHub Copilot to generate production-ready, high-quality code that follows BrewHand's "do it right the first time" philosophy.

## Core Principles

- **Production-Ready**: Generate code with comprehensive error handling, input validation, and edge case coverage
- **Quality First**: Prioritize maintainable, readable, and well-structured solutions over quick fixes
- **Best Practices**: Follow language-specific conventions, security guidelines, and performance considerations
`;

        if (options.includeShellContext) {
            content += this.generateShellInstructions();
        }

        if (options.includeQualityStandards) {
            content += this.generateQualityStandards(options.strictMode);
        }

        if (options.includeArchitecturalGuidance) {
            content += this.generateArchitecturalGuidance(architecturalFocus as string);
        }

        content += `
## General Guidelines

- Always include comprehensive error handling
- Add input validation for all functions and methods  
- Use descriptive variable and function names
- Include relevant comments for complex logic
- Consider performance implications of solutions
- Follow security best practices
- Write testable, modular code
- Handle edge cases appropriately

## Code Quality Standards

- No TODO comments in production code - complete implementations
- Prefer explicit error handling over silent failures
- Use appropriate data structures and algorithms for the context
- Follow the DRY (Don't Repeat Yourself) principle
- Implement proper logging where appropriate
`;

        return content;
    }

    /**
     * Generate shell-specific instructions
     */
    private generateShellInstructions(): string {
        return `
## Shell Command Guidelines

**Current Environment:** ${this.shellInfo.type}  
**Command Separator:** \`${this.shellInfo.separator}\`  
**Path Quoting:** Use \`${this.shellInfo.pathQuote}\` for paths with spaces

### Shell Command Rules
${this.getShellSpecificRules()}

### Examples
\`\`\`${this.shellInfo.type}
${this.shellInfo.exampleCommand}
\`\`\`

**Important:** Always generate shell commands compatible with ${this.shellInfo.type}. Never mix separators from different shells.
`;
    }

    /**
     * Generate quality standards section
     */
    private generateQualityStandards(strictMode: boolean): string {
        let standards = `
## Code Quality Standards

- Write comprehensive unit tests alongside implementation
- Include proper documentation and type annotations
- Implement graceful error handling and recovery
- Use design patterns appropriately
- Optimize for readability and maintainability
`;

        if (strictMode) {
            standards += `
### Strict Mode Requirements

- **No TODO/FIXME comments** - Complete all implementations
- **Comprehensive error handling** - Handle all possible failure scenarios  
- **Input validation** - Validate all inputs and parameters
- **Resource cleanup** - Properly dispose of resources and handle cleanup
- **Security considerations** - Follow security best practices for all code
- **Performance optimization** - Consider performance implications of all decisions
`;
        }

        return standards;
    }

    /**
     * Generate architectural guidance based on focus
     */
    private generateArchitecturalGuidance(focus: string): string {
        const baseGuidance = `
## Architectural Guidance

### Primary Focus: ${focus.toUpperCase()}
`;

        switch (focus) {
            case 'performance':
                return baseGuidance + `
- Optimize for speed and memory efficiency
- Use appropriate data structures for performance
- Consider algorithmic complexity (Big O notation)
- Minimize object creation and garbage collection pressure
- Profile and benchmark critical code paths
- Use caching strategies where appropriate
`;

            case 'maintainability':
                return baseGuidance + `
- Prioritize code readability and clarity
- Use clear, descriptive naming conventions
- Break complex functions into smaller, focused units
- Follow SOLID principles and clean code practices
- Maintain consistent code style and formatting
- Document complex business logic and edge cases
`;

            case 'security':
                return baseGuidance + `
- Validate and sanitize all inputs
- Use secure coding practices (avoid SQL injection, XSS, etc.)
- Implement proper authentication and authorization
- Handle sensitive data securely (no plaintext passwords, etc.)
- Follow principle of least privilege
- Keep dependencies updated and secure
`;

            case 'scalability':
                return baseGuidance + `
- Design for horizontal and vertical scaling
- Use async/await patterns for I/O operations
- Implement proper resource pooling and connection management
- Consider database indexing and query optimization
- Design stateless, loosely coupled components
- Plan for load balancing and distributed systems
`;

            default: // balanced
                return baseGuidance + `
- Balance performance, maintainability, security, and scalability
- Make architectural decisions based on context and requirements
- Consider long-term maintenance implications
- Follow established patterns and conventions
- Optimize critical paths while maintaining code clarity
- Implement security measures appropriate to the use case
`;
        }
    }

    /**
     * Get shell-specific syntax rules
     */
    private getShellSpecificRules(): string {
        switch (this.shellInfo.type) {
            case 'powershell':
                return `- Use ";" (semicolon) to chain commands: \`cmd1; cmd2; cmd3\`
- NEVER use "&&" - this is bash syntax and will fail
- Quote paths with spaces: \`cd "My Project"\`
- Variables use $env: prefix: \`$env:PATH\``;

            case 'bash':
            case 'zsh':
                return `- Use "&&" for conditional execution: \`cmd1 && cmd2 && cmd3\`
- Use ";" for sequential execution: \`cmd1; cmd2; cmd3\`
- Quote paths with spaces: \`cd "My Project"\`
- Variables use $ prefix: \`$PATH\``;

            case 'cmd':
                return `- Use "&" to chain commands: \`cmd1 & cmd2 & cmd3\`
- Quote paths with spaces: \`cd "My Project"\`
- Variables use % prefix: \`%PATH%\``;

            default:
                return `- Use appropriate separators for the detected shell
- Always quote paths with spaces
- Follow platform-specific conventions`;
        }
    }

    /**
     * Get current shell information for display
     */
    getShellInfo(): ShellInfo {
        return this.shellInfo;
    }
}