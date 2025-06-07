import * as vscode from 'vscode';
import * as os from 'os';

export type ShellType = 'powershell' | 'cmd' | 'bash' | 'zsh' | 'fish';

export interface ShellInfo {
  type: ShellType;
  separator: string;
  pathQuote: string;
  envPrefix: string;
  exampleCommand: string;
}

export class ShellDetector {
  static detect(): ShellInfo {
    const platform = os.platform();
    const terminal = vscode.workspace.getConfiguration('terminal');
    
    // VS Code's terminal profile settings
    const defaultProfile = platform === 'win32' 
      ? terminal.get<string>('integrated.defaultProfile.windows')
      : terminal.get<string>('integrated.defaultProfile.linux') || 
        terminal.get<string>('integrated.defaultProfile.osx');
    
    // Detect based on profile or platform
    if (platform === 'win32') {
      if (defaultProfile?.includes('PowerShell') || !defaultProfile) {
        return this.getPowerShellInfo();
      } else if (defaultProfile.includes('Command Prompt')) {
        return this.getCmdInfo();
      } else if (defaultProfile.includes('Git Bash')) {
        return this.getBashInfo();
      }
    }
    
    // Unix-like systems
    if (defaultProfile?.includes('zsh')) return this.getZshInfo();
    if (defaultProfile?.includes('fish')) return this.getFishInfo();
    return this.getBashInfo(); // Default to bash
  }
  
  private static getPowerShellInfo(): ShellInfo {
    return {
      type: 'powershell',
      separator: '; ',
      pathQuote: '"',
      envPrefix: '$env:',
      exampleCommand: 'cd "C:\\My Projects\\App"; npm run compile'
    };
  }
  
  private static getCmdInfo(): ShellInfo {
    return {
      type: 'cmd',
      separator: ' & ',
      pathQuote: '"',
      envPrefix: '%',
      exampleCommand: 'cd "C:\\My Projects\\App" & npm run compile'
    };
  }
  
  private static getBashInfo(): ShellInfo {
    return {
      type: 'bash',
      separator: ' && ',
      pathQuote: '"',
      envPrefix: '$',
      exampleCommand: 'cd "/my projects/app" && npm run compile'
    };
  }
  
  private static getZshInfo(): ShellInfo {
    return {
      type: 'zsh',
      separator: ' && ',
      pathQuote: '"',
      envPrefix: '$',
      exampleCommand: 'cd "/my projects/app" && npm run compile'
    };
  }
  
  private static getFishInfo(): ShellInfo {
    return {
      type: 'fish',
      separator: '; and ',
      pathQuote: '"',
      envPrefix: '$',
      exampleCommand: 'cd "/my projects/app"; and npm run compile'
    };
  }
}
