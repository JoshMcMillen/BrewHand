import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class TerminalOutputMonitor {
  private outputBuffer: Map<string, string> = new Map();
  private activeTerminal: vscode.Terminal | undefined;
  
  constructor() {
    // Monitor terminal creation and output
    vscode.window.onDidOpenTerminal(terminal => {
      this.monitorTerminal(terminal);
    });
    
    // Monitor existing terminals
    vscode.window.terminals.forEach(terminal => {
      this.monitorTerminal(terminal);
    });
  }
  
  private monitorTerminal(terminal: vscode.Terminal) {
    // VS Code doesn't provide direct terminal output API
    // We'll need to use a workaround or enhancement
    this.activeTerminal = terminal;
  }
  
  async captureCommandOutput(command: string): Promise<string> {
    // Execute command and capture output
    try {
      const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || process.cwd();      const shellOption = process.platform === 'win32' ? 'powershell.exe' : '/bin/bash';
      
      const { stdout, stderr } = await execAsync(command, {
        cwd: workspaceRoot,
        shell: shellOption,
        env: process.env,
        maxBuffer: 1024 * 1024 // 1MB buffer
      });
      
      const combinedOutput = stdout + stderr;
      this.outputBuffer.set(command, combinedOutput);
      return combinedOutput;
    } catch (error: any) {
      // Even on error, we want the output
      const errorOutput = (error.stdout || '') + (error.stderr || '');
      this.outputBuffer.set(command, errorOutput);
      return errorOutput;
    }
  }
  
  getLastOutput(): string {
    // Return the last captured output
    const outputs = Array.from(this.outputBuffer.values());
    return outputs[outputs.length - 1] || '';
  }
  
  getOutputForCommand(command: string): string {
    return this.outputBuffer.get(command) || '';
  }
  
  clearBuffer(): void {
    this.outputBuffer.clear();
  }
}
