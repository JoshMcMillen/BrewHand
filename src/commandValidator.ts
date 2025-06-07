import * as vscode from 'vscode';
import { CommandFormatter } from './commandFormatter';
import { ErrorParser, CompilationResult } from './errorParser';
import { TerminalOutputMonitor } from './terminalMonitor';
import { ImportPathResolver } from './importPathResolver';

export interface CommandExecutionResult {
  success: boolean;
  output: string;
  errors?: any[];
  warnings?: any[];
  suggestions?: string[];
}

export class CommandValidator {
  private formatter: CommandFormatter;
  private monitor: TerminalOutputMonitor;
  
  constructor() {
    this.formatter = new CommandFormatter();
    this.monitor = new TerminalOutputMonitor();
  }
  
  async validateAndExecuteCommand(
    command: string,
    stream: vscode.ChatResponseStream
  ): Promise<CommandExecutionResult> {
    // Pre-validation: Fix shell syntax
    const validation = this.formatter.validateSyntax(command);
    if (!validation.valid) {
      stream.markdown('\n⚠️ **Shell Syntax Issue Detected:**\n');
      validation.issues.forEach(issue => stream.markdown(`- ${issue}\n`));
      
      if (validation.fixed) {
        stream.markdown(`\n✅ **Corrected Command:**\n\`\`\`\n${validation.fixed}\n\`\`\`\n`);
        command = validation.fixed;
      }
    }
    
    // Execute command
    stream.markdown(`\n📟 **Executing:** \`${command}\`\n`);
    const output = await this.monitor.captureCommandOutput(command);
    
    // Post-validation: Check for errors based on command type
    const result = await this.analyzeCommandOutput(command, output, stream);
    
    return result;
  }
  
  private async analyzeCommandOutput(
    command: string,
    output: string,
    stream: vscode.ChatResponseStream
  ): Promise<CommandExecutionResult> {
    let success = true;
    const errors: any[] = [];
    const warnings: any[] = [];
    const suggestions: string[] = [];
    
    // TypeScript compilation check
    if (command.includes('compile') || command.includes('tsc')) {
      const compilationResult = ErrorParser.parseTypeScriptOutput(output);
      
      if (!compilationResult.success) {
        success = false;
        stream.markdown(`\n❌ **Compilation FAILED with ${compilationResult.errorCount} errors:**\n`);
        
        for (const error of compilationResult.errors) {
          stream.markdown(`- \`${error.file}:${error.line}:${error.column}\` - ${error.code}: ${error.message}\n`);
          errors.push(error);
          
          // Try to resolve import path errors
          if (error.message.includes('Cannot find module')) {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || '';
            const resolution = await ImportPathResolver.resolveImportError(error, workspaceRoot);
            if (resolution.suggestion) {
              suggestions.push(`Consider changing import to: '${resolution.suggestion}'`);
              stream.markdown(`  💡 *Suggestion: Try importing '${resolution.suggestion}' instead*\n`);
            }
          }
        }
        
        if (compilationResult.warningCount > 0) {
          stream.markdown(`\n⚠️ **Also found ${compilationResult.warningCount} warnings**\n`);
        }
        
        return { success: false, output, errors, warnings, suggestions };
      } else {
        stream.markdown('\n✅ **Compilation succeeded!**\n');
        if (compilationResult.warningCount > 0) {
          stream.markdown(`⚠️ *Found ${compilationResult.warningCount} warnings*\n`);
        }
      }
    }
    
    // npm script execution check
    if (command.includes('npm ') || command.includes('yarn ')) {
      const npmResult = ErrorParser.parseNpmOutput(output);
      
      if (!npmResult.success) {
        success = false;
        stream.markdown(`\n❌ **npm/yarn command FAILED**\n`);
        if (npmResult.script) {
          stream.markdown(`- Failed script: ${npmResult.script}\n`);
        }
        if (npmResult.exitCode) {
          stream.markdown(`- Exit code: ${npmResult.exitCode}\n`);
        }
        if (npmResult.errorType) {
          stream.markdown(`- Error: ${npmResult.errorType}\n`);
        }
        
        return { success: false, output, errors: [npmResult] };
      }
    }
    
    // General error check for other commands
    const generalResult = ErrorParser.parseGeneralOutput(output, command);
    if (!generalResult.success) {
      success = false;
      stream.markdown(`\n❌ **Command execution had issues:**\n`);
      generalResult.issues.forEach(issue => {
        stream.markdown(`- ${issue}\n`);
        errors.push({ message: issue });
      });
    }
    
    return { success, output, errors, warnings, suggestions };
  }
    shouldBlockDependentCommands(result: CommandExecutionResult): boolean {
    // Block if there are compilation errors or critical failures
    return !result.success && result.errors !== undefined && result.errors.length > 0;
  }
  
  getShellInfo() {
    return this.formatter.getShellInfo();
  }
}
