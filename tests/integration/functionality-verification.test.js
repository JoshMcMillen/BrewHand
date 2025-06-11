// Test Script: Verify BrewHand Shell Detection and Prompt Injection
// This script tests the core functionality of BrewHand

const vscode = require('vscode');

// Test 1: Shell Detection
function testShellDetection() {
    console.log('🧪 Testing Shell Detection...');
    
    // Import shell detector
    const { ShellDetector } = require('./src/shellDetector');
    const shellInfo = ShellDetector.detect();
    
    console.log('Detected Shell Info:');
    console.log(`  Type: ${shellInfo.type}`);
    console.log(`  Separator: "${shellInfo.separator}"`);
    console.log(`  Path Quote: "${shellInfo.pathQuote}"`);
    console.log(`  Environment Prefix: "${shellInfo.envPrefix}"`);
    console.log(`  Example Command: ${shellInfo.exampleCommand}`);
    
    // For Windows PowerShell, expect:
    const expected = {
        type: 'powershell',
        separator: '; ',
        pathQuote: '"',
        envPrefix: '$env:',
    };
    
    let passed = true;
    if (shellInfo.type !== expected.type) {
        console.log(`❌ Expected type '${expected.type}', got '${shellInfo.type}'`);
        passed = false;
    }
    if (shellInfo.separator !== expected.separator) {
        console.log(`❌ Expected separator '${expected.separator}', got '${shellInfo.separator}'`);
        passed = false;
    }
    
    if (passed) {
        console.log('✅ Shell Detection Test PASSED');
    } else {
        console.log('❌ Shell Detection Test FAILED');
    }
    
    return passed;
}

// Test 2: Enhancement Trigger Detection
function testEnhancementTriggers() {
    console.log('\n🧪 Testing Enhancement Trigger Detection...');
    
    // Import the detection function (we need to extract it or recreate it)
    const enhancementTriggers = [
        /(?:create|generate|write|build|implement)/i,
        /(?:how (?:do|to)|show me|example)/i,
        /(?:script|function|class|component)/i,
        /(?:setup|configure|install)/i,
        /(?:deploy|run|start|compile)/i,
        /(?:test|debug|fix)/i
    ];
    
    function detectNeedsEnhancement(prompt) {
        return enhancementTriggers.some(pattern => pattern.test(prompt));
    }
    
    const testCases = [
        { prompt: "create a build script", shouldTrigger: true },
        { prompt: "how do I run my project", shouldTrigger: true },
        { prompt: "generate a function", shouldTrigger: true },
        { prompt: "fix command: cd project && npm start", shouldTrigger: true }, // Has "fix"
        { prompt: "what is the weather", shouldTrigger: false },
        { prompt: "hello world", shouldTrigger: false }
    ];
    
    let passed = true;
    testCases.forEach((testCase, index) => {
        const result = detectNeedsEnhancement(testCase.prompt);
        const success = result === testCase.shouldTrigger;
        
        console.log(`  Test ${index + 1}: "${testCase.prompt}"`);
        console.log(`    Expected: ${testCase.shouldTrigger}, Got: ${result} ${success ? '✅' : '❌'}`);
        
        if (!success) passed = false;
    });
    
    if (passed) {
        console.log('✅ Enhancement Trigger Test PASSED');
    } else {
        console.log('❌ Enhancement Trigger Test FAILED');
    }
    
    return passed;
}

// Test 3: System Prompt Generation
function testSystemPromptGeneration() {
    console.log('\n🧪 Testing System Prompt Generation...');
    
    try {
        const { AIResponseEnhancer } = require('./src/aiResponseEnhancer');
        const enhancer = new AIResponseEnhancer();
        
        const testPrompt = "create a build script";
        const systemPrompt = enhancer.createShellAwareSystemPrompt(testPrompt);
        
        console.log('Generated System Prompt:');
        console.log('=' + '='.repeat(50));
        console.log(systemPrompt);
        console.log('=' + '='.repeat(50));
        
        // Check for key elements
        const checks = [
            { name: 'Contains POWERSHELL', test: systemPrompt.includes('POWERSHELL') },
            { name: 'Contains semicolon separator', test: systemPrompt.includes('; ') },
            { name: 'Contains NEVER use &&', test: systemPrompt.includes('NEVER use "&&"') },
            { name: 'Contains original prompt', test: systemPrompt.includes(testPrompt) },
            { name: 'Contains verification checklist', test: systemPrompt.includes('VERIFICATION CHECKLIST') },
            { name: 'Contains examples', test: systemPrompt.includes('COMMAND EXAMPLES') }
        ];
        
        let passed = true;
        checks.forEach(check => {
            console.log(`  ${check.name}: ${check.test ? '✅' : '❌'}`);
            if (!check.test) passed = false;
        });
        
        if (passed) {
            console.log('✅ System Prompt Generation Test PASSED');
        } else {
            console.log('❌ System Prompt Generation Test FAILED');
        }
        
        return passed;
        
    } catch (error) {
        console.log(`❌ System Prompt Generation Test FAILED: ${error.message}`);
        return false;
    }
}

// Test 4: Command Validation
function testCommandValidation() {
    console.log('\n🧪 Testing Command Validation...');
    
    try {
        const { CommandFormatter } = require('./src/commandFormatter');
        const formatter = new CommandFormatter();
        
        const testCommands = [
            {
                input: "cd project && npm install",
                shouldHaveIssues: true,
                expectedFix: 'cd "project"; npm install'
            },
            {
                input: "cd \"My Project\"; npm start",
                shouldHaveIssues: false,
                expectedFix: null
            }
        ];
        
        let passed = true;
        testCommands.forEach((testCase, index) => {
            const validation = formatter.validateSyntax(testCase.input);
            
            console.log(`  Test ${index + 1}: "${testCase.input}"`);
            console.log(`    Valid: ${validation.valid}`);
            console.log(`    Issues: ${validation.issues ? validation.issues.join(', ') : 'None'}`);
            console.log(`    Fixed: ${validation.fixed || 'None'}`);
            
            const correctValidation = validation.valid === !testCase.shouldHaveIssues;
            if (!correctValidation) {
                console.log(`    ❌ Expected valid=${!testCase.shouldHaveIssues}, got valid=${validation.valid}`);
                passed = false;
            } else {
                console.log(`    ✅ Validation correct`);
            }
        });
        
        if (passed) {
            console.log('✅ Command Validation Test PASSED');
        } else {
            console.log('❌ Command Validation Test FAILED');
        }
        
        return passed;
        
    } catch (error) {
        console.log(`❌ Command Validation Test FAILED: ${error.message}`);
        return false;
    }
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting BrewHand Functionality Tests\n');
    
    const results = [
        testShellDetection(),
        testEnhancementTriggers(),
        testSystemPromptGeneration(),
        testCommandValidation()
    ];
    
    const passedCount = results.filter(r => r).length;
    const totalCount = results.length;
    
    console.log('\n📊 Test Results Summary:');
    console.log(`Passed: ${passedCount}/${totalCount}`);
    
    if (passedCount === totalCount) {
        console.log('🎉 All tests PASSED! BrewHand functionality is working correctly.');
    } else {
        console.log('⚠️  Some tests FAILED. Please review the issues above.');
    }
    
    return passedCount === totalCount;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testShellDetection,
        testEnhancementTriggers,
        testSystemPromptGeneration,
        testCommandValidation
    };
}

// Run tests if called directly
if (require.main === module) {
    runAllTests();
}
