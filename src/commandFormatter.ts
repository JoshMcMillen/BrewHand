import { ShellDetector, ShellInfo } from './shellDetector';
import * as path from 'path';

export class CommandFormatter {
  private shellInfo: ShellInfo;
  
  constructor() {
    this.shellInfo = ShellDetector.detect();
  }
  
  formatCommand(commands: string | string[]): string {
    const cmdArray = Array.isArray(commands) ? commands : [commands];
    return cmdArray
      .map(cmd => this.formatSingleCommand(cmd))
      .join(this.shellInfo.separator);
  }
  
  private formatSingleCommand(command: string): string {
    // Handle cd commands with proper quoting
    const cdMatch = command.match(/^cd\s+(.+)$/);
    if (cdMatch) {
      const targetPath = cdMatch[1].trim();
      // Remove existing quotes
      const cleanPath = targetPath.replace(/["']/g, '');
      // Add appropriate quotes if path contains spaces
      if (cleanPath.includes(' ')) {
        return `cd ${this.shellInfo.pathQuote}${cleanPath}${this.shellInfo.pathQuote}`;
      }
      return `cd ${cleanPath}`;
    }
    
    return command;
  }
  
  validateSyntax(command: string): { valid: boolean; fixed?: string; issues: string[] } {
    const issues: string[] = [];
    let fixed = command;
    
    // Check for wrong separators
    if (this.shellInfo.type === 'powershell') {
      if (command.includes(' && ')) {
        issues.push('PowerShell uses ; not && for command separation');
        fixed = fixed.replace(/ && /g, this.shellInfo.separator);
      }
    } else if (this.shellInfo.type === 'bash' || this.shellInfo.type === 'zsh') {
      // Check for PowerShell syntax in bash/zsh
      if (command.match(/;\s*(?!;)/)) {
        issues.push('Bash/Zsh uses && not ; for conditional command execution');
        fixed = fixed.replace(/;\s*(?!;)/g, this.shellInfo.separator);
      }
    } else if (this.shellInfo.type === 'cmd') {
      if (command.includes(' && ')) {
        issues.push('CMD uses & not && for command separation');
        fixed = fixed.replace(/ && /g, this.shellInfo.separator);
      }
    }
    
    return {
      valid: issues.length === 0,
      fixed: issues.length > 0 ? fixed : undefined,
      issues
    };
  }
  
  getShellInfo(): ShellInfo {
    return this.shellInfo;
  }
}
