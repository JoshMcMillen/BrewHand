import * as vscode from 'vscode';
import * as path from 'path';

export class ImportPathResolver {
  static async resolveImportError(
    error: any,
    workspaceRoot: string
  ): Promise<{ suggestion?: string; actualPath?: string }> {
    if (!error.message.includes('Cannot find module')) {
      return {};
    }
    
    // Extract the problematic import path
    const importMatch = error.message.match(/Cannot find module '(.+)'/);
    if (!importMatch) return {};
    
    const importPath = importMatch[1];
    const errorFile = path.join(workspaceRoot, error.file);
    const errorDir = path.dirname(errorFile);
    
    // Check if it's a relative import
    if (importPath.startsWith('.')) {
      // Try to find the actual file
      const possiblePaths = [
        path.join(errorDir, importPath + '.ts'),
        path.join(errorDir, importPath + '.js'),
        path.join(errorDir, importPath, 'index.ts'),
        path.join(errorDir, importPath, 'index.js'),
        path.join(errorDir, importPath + '.tsx'),
        path.join(errorDir, importPath + '.jsx')
      ];
      
      for (const possiblePath of possiblePaths) {
        if (await this.fileExists(possiblePath)) {
          const relativePath = path.relative(errorDir, possiblePath)
            .replace(/\\/g, '/')
            .replace(/\.(ts|js|tsx|jsx)$/, '');
          
          return {
            suggestion: relativePath.startsWith('.') ? relativePath : './' + relativePath,
            actualPath: possiblePath
          };
        }
      }
    }
    
    return {};
  }
  
  private static async fileExists(filePath: string): Promise<boolean> {
    try {
      await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
      return true;
    } catch {
      return false;
    }
  }
}
