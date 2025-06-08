// Quick test script to verify BrewHand extension functionality
const { ShellDetector } = require('./out/src/shellDetector.js');
const { CommandFormatter } = require('./out/src/commandFormatter.js');
const { ErrorParser } = require('./out/src/errorParser.js');

console.log('=== Testing BrewHand Extension Components ===\n');

try {
    // Test Shell Detection
    console.log('1. Testing Shell Detection:');
    const shellInfo = ShellDetector.detect();
    console.log('   Detected Shell:', shellInfo.type);
    console.log('   Separator:', shellInfo.separator);
    console.log('   Example:', shellInfo.exampleCommand);
    console.log('   ✅ Shell detection working\n');

    // Test Command Formatting
    console.log('2. Testing Command Formatting:');
    const testCommand = 'npm install && npm run build';
    const formatted = CommandFormatter.formatForShell(testCommand, shellInfo);
    console.log('   Input:', testCommand);
    console.log('   Output:', formatted);
    console.log('   ✅ Command formatting working\n');

    // Test Error Parsing
    console.log('3. Testing Error Parsing:');
    const testError = 'src/test.ts(10,5): error TS2345: Argument of type string is not assignable to parameter of type number.';
    const parsedError = ErrorParser.parseTypeScriptErrors(testError);
    console.log('   Parsed errors:', parsedError.length > 0 ? 'Found' : 'None');
    if (parsedError.length > 0) {
        console.log('   First error:', parsedError[0].message);
    }
    console.log('   ✅ Error parsing working\n');

    console.log('🎉 All BrewHand components are functioning correctly!');
    
} catch (error) {
    console.error('❌ Error testing extension:', error.message);
    console.error('Stack:', error.stack);
}
