export interface CompilationError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CompilationResult {
  success: boolean;
  errorCount: number;
  warningCount: number;
  errors: CompilationError[];
  output: string;
}

export class ErrorParser {
  static parseTypeScriptOutput(output: string): CompilationResult {
    const errors: CompilationError[] = [];
    let errorCount = 0;
    let warningCount = 0;
    
    // Parse TypeScript errors - multiple patterns to catch different formats
    const tsErrorPatterns = [
      // Standard TSC format: file(line,col): error TSxxxx: message
      /^(.+?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s*(.+)$/gm,
      // Alternative format: file:line:col - error TSxxxx: message
      /^(.+?):(\d+):(\d+)\s*-\s*(error|warning)\s+(TS\d+):\s*(.+)$/gm,
      // VSCode format: file(line,col): error TSxxxx: message
      /^(.+?)\((\d+),(\d+)\):\s*(error|warning)\s+(TS\d+):\s*(.+)$/gm
    ];
    
    for (const pattern of tsErrorPatterns) {
      let match;
      while ((match = pattern.exec(output)) !== null) {
        const severity = match[4] as 'error' | 'warning';
        errors.push({
          file: match[1].trim(),
          line: parseInt(match[2]),
          column: parseInt(match[3]),
          severity,
          code: match[5],
          message: match[6].trim()
        });
        
        if (severity === 'error') errorCount++;
        else warningCount++;
      }
    }
    
    // Check for summary line patterns
    const summaryPatterns = [
      /Found (\d+) error/,
      /(\d+) error\(s\)/,
      /error count:\s*(\d+)/i
    ];
    
    for (const pattern of summaryPatterns) {
      const summaryMatch = output.match(pattern);
      if (summaryMatch) {
        errorCount = Math.max(errorCount, parseInt(summaryMatch[1]));
        break;
      }
    }
    
    return {
      success: errorCount === 0,
      errorCount,
      warningCount,
      errors,
      output
    };
  }
  
  static parseNpmOutput(output: string): { 
    success: boolean; 
    exitCode?: number; 
    script?: string;
    errorType?: string;
  } {
    // Check for npm error patterns
    const exitCodeMatch = output.match(/npm ERR! Exit status (\d+)/);
    const scriptMatch = output.match(/npm ERR! Failed at the (.+?) script/);
    const errorTypeMatch = output.match(/npm ERR! (.+?)$/m);
    
    const hasError = output.includes('npm ERR!') || 
                    output.includes('ELIFECYCLE') ||
                    output.includes('failed with exit code');
    
    return {
      success: !hasError,
      exitCode: exitCodeMatch ? parseInt(exitCodeMatch[1]) : undefined,
      script: scriptMatch ? scriptMatch[1] : undefined,
      errorType: errorTypeMatch ? errorTypeMatch[1] : undefined
    };
  }
  
  static parseGeneralOutput(output: string, command: string): {success: boolean; issues: string[]} {
    const issues: string[] = [];
    const lowercaseOutput = output.toLowerCase();
    
    // Common error indicators
    const errorPatterns = [
      'error:',
      'failed',
      'exception',
      'cannot find',
      'permission denied',
      'access denied',
      'no such file',
      'command not found',
      'syntax error'
    ];
    
    for (const pattern of errorPatterns) {
      if (lowercaseOutput.includes(pattern)) {
        // Extract the line containing the error
        const lines = output.split('\n');
        const errorLine = lines.find(line => 
          line.toLowerCase().includes(pattern)
        );
        if (errorLine) {
          issues.push(errorLine.trim());
        }
      }
    }
    
    return {
      success: issues.length === 0,
      issues
    };
  }
}
