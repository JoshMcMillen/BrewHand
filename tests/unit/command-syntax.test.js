// Simple test for command syntax validation without VS Code dependencies
console.log('🧪 Testing BrewHand Command Syntax Validation...\n');

// Test cases for PowerShell command syntax issues
const testCommands = [
    'cd project && npm install',           // Wrong: should use ; in PowerShell
    'npm run build && npm test',           // Wrong: should use ; in PowerShell  
    'git clone repo; cd repo',             // Mixed syntax
    'cd "My Project"; npm install',        // Correct for PowerShell
    'docker build . && docker run image', // Wrong: should use ; in PowerShell
    'npm install',                         // Simple command, no issues
    'cd project',                          // Simple command, no issues
];

// Simulate the validation logic (simplified version)
function validatePowerShellSyntax(command) {
    const issues = [];
    let fixed = command;
    
    if (command.includes(' && ')) {
        issues.push('PowerShell uses ";" not "&&" for command separation');
        fixed = fixed.replace(/ && /g, '; ');
    }
    
    // Check for unquoted paths with spaces (simplified)
    const cdMatch = command.match(/cd\s+([^"'][^;]+)/);
    if (cdMatch && cdMatch[1].includes(' ')) {
        issues.push('PowerShell paths with spaces should be quoted');
        fixed = fixed.replace(/cd\s+([^"'][^;]+)/, 'cd "$1"');
    }
    
    return {
        valid: issues.length === 0,
        fixed: issues.length > 0 ? fixed : undefined,
        issues
    };
}

// Test each command
testCommands.forEach((command, index) => {
    console.log(`Test ${index + 1}: "${command}"`);
    
    const result = validatePowerShellSyntax(command);
    
    if (result.valid) {
        console.log('  ✅ Syntax is correct for PowerShell');
    } else {
        console.log('  ❌ Issues detected:');
        result.issues.forEach(issue => console.log(`     - ${issue}`));
        if (result.fixed) {
            console.log(`  ✅ Suggested fix: "${result.fixed}"`);
        }
    }
    console.log();
});

console.log('🎉 Command syntax validation test completed!');
console.log('\n💡 This demonstrates how BrewHand will help fix common PowerShell syntax issues.');
console.log('💡 When using the extension, you\'ll get these suggestions automatically in chat.');
