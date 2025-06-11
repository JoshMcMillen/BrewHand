// Quick test of BrewHand shell detection and command formatting
// Run this in Node.js to test the logic

// Simulate what BrewHand does
function testShellDetection() {
    const os = require('os');
    const platform = os.platform();
    console.log(`Platform: ${platform}`);
    
    // This simulates VS Code's terminal detection
    const isWindows = platform === 'win32';
    console.log(`Is Windows: ${isWindows}`);
    
    // Test command that should fail in PowerShell
    const testCommand = "cd project && npm install && npm start";
    console.log(`Test command: ${testCommand}`);
    
    // PowerShell syntax check
    if (isWindows) {
        if (testCommand.includes(' && ')) {
            console.log('❌ Issue detected: PowerShell uses ; not && for command separation');
            const fixed = testCommand.replace(/ && /g, '; ');
            console.log(`✅ Corrected: ${fixed}`);
        }
    }
}

// Run the test
console.log('🍺 BrewHand Shell Detection Test');
console.log('================================');
testShellDetection();
console.log('\n💡 Now test @brewhand in VS Code Chat with: "cd project && npm install"');
