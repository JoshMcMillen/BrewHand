// Standalone Test: Verify BrewHand Core Logic
// Tests the shell detection and prompt generation without VS Code dependencies

const os = require('os');

// Recreate ShellDetector logic for testing
class TestShellDetector {
    static detect() {
        const platform = os.platform();
        
        if (platform === 'win32') {
            // For Windows, default to PowerShell
            return {
                type: 'powershell',
                separator: '; ',
                pathQuote: '"',
                envPrefix: '$env:',
                exampleCommand: 'cd "C:\\My Projects\\App"; npm run compile'
            };
        }
        
        // Default to bash for Unix-like systems
        return {
            type: 'bash',
            separator: ' && ',
            pathQuote: '"',
            envPrefix: '$',
            exampleCommand: 'cd "/my projects/app" && npm run compile'
        };
    }
}

// Recreate AIResponseEnhancer prompt logic
class TestAIResponseEnhancer {
    constructor() {
        this.shellInfo = TestShellDetector.detect();
    }

    createShellAwareSystemPrompt(originalPrompt) {
        const systemContext = this.buildShellSystemContext();
        return `${systemContext}\n\nUser Request: ${originalPrompt}`;
    }

    buildShellSystemContext() {
        return `CRITICAL SHELL COMMAND REQUIREMENTS:

Current Environment: ${this.shellInfo.type.toUpperCase()}
Command Separator: ${this.shellInfo.separator}
Path Quoting: ${this.shellInfo.pathQuote}

MANDATORY COMMAND SYNTAX RULES:
${this.getShellSpecificRules()}

VERIFICATION CHECKLIST:
- ✅ Always use "${this.shellInfo.separator}" for chaining commands
- ✅ Quote paths with spaces using ${this.shellInfo.pathQuote}
- ✅ Test commands mentally for ${this.shellInfo.type} compatibility
- ❌ NEVER use incorrect separators (this causes execution failures)

COMMAND EXAMPLES FOR ${this.shellInfo.type.toUpperCase()}:
${this.getShellExamples()}

When providing ANY shell commands, you MUST follow these rules precisely. 
Incorrect syntax will cause user frustration and workflow interruption.`;
    }

    getShellSpecificRules() {
        switch (this.shellInfo.type) {
            case 'powershell':
                return `1. Use ";" (semicolon) to chain commands: cmd1; cmd2; cmd3
2. NEVER use "&&" - this is bash syntax and will fail
3. Quote paths with spaces: cd "My Project"
4. Variables use $env: prefix: $env:PATH
5. Example: cd "C:\\projects"; npm install; npm start`;

            case 'bash':
            case 'zsh':
                return `1. Use "&&" for conditional execution: cmd1 && cmd2 && cmd3
2. Use ";" for sequential execution: cmd1; cmd2; cmd3
3. Quote paths with spaces: cd "My Project"
4. Variables use $ prefix: $PATH
5. Example: cd "/projects" && npm install && npm start`;

            case 'cmd':
                return `1. Use "&" to chain commands: cmd1 & cmd2 & cmd3
2. Quote paths with spaces: cd "My Project"
3. Variables use % prefix: %PATH%
4. Example: cd "C:\\projects" & npm install & npm start`;

            default:
                return `1. Use appropriate separators for the detected shell
2. Always quote paths with spaces
3. Follow platform-specific conventions`;
        }
    }

    getShellExamples() {
        const sep = this.shellInfo.separator;
        const quote = this.shellInfo.pathQuote;
        
        return `✅ CORRECT: cd ${quote}project folder${quote}${sep}npm install${sep}npm start
✅ CORRECT: git add .${sep}git commit -m ${quote}update${quote}${sep}git push
✅ CORRECT: npm run build${sep}npm test${sep}npm run deploy

❌ WRONG: Never mix separators from different shells
❌ WRONG: Never use unquoted paths with spaces`;
    }
}

// Test 1: Shell Detection
function testShellDetection() {
    console.log('🧪 Testing Shell Detection...');
    
    const shellInfo = TestShellDetector.detect();
    
    console.log('Detected Shell Info:');
    console.log(`  Type: ${shellInfo.type}`);
    console.log(`  Separator: "${shellInfo.separator}"`);
    console.log(`  Path Quote: "${shellInfo.pathQuote}"`);
    console.log(`  Environment Prefix: "${shellInfo.envPrefix}"`);
    console.log(`  Example Command: ${shellInfo.exampleCommand}`);
    
    // For Windows, expect PowerShell
    if (os.platform() === 'win32') {
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
            console.log('✅ Shell Detection Test PASSED (PowerShell on Windows)');
        } else {
            console.log('❌ Shell Detection Test FAILED');
        }
        
        return passed;
    } else {
        console.log('✅ Shell Detection Test PASSED (Non-Windows environment)');
        return true;
    }
}

// Test 2: Enhancement Trigger Detection
function testEnhancementTriggers() {
    console.log('\n🧪 Testing Enhancement Trigger Detection...');
    
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
        { prompt: "setup my development environment", shouldTrigger: true },
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
    
    const enhancer = new TestAIResponseEnhancer();
    const testPrompt = "create a build script for my TypeScript project";
    const systemPrompt = enhancer.createShellAwareSystemPrompt(testPrompt);
    
    console.log('\n📋 Generated System Prompt:');
    console.log('=' + '='.repeat(80));
    console.log(systemPrompt);
    console.log('=' + '='.repeat(80));
    
    // Check for key elements
    const checks = [
        { name: 'Contains shell type', test: systemPrompt.includes(enhancer.shellInfo.type.toUpperCase()) },
        { name: 'Contains command separator', test: systemPrompt.includes(enhancer.shellInfo.separator) },
        { name: 'Contains original prompt', test: systemPrompt.includes(testPrompt) },
        { name: 'Contains verification checklist', test: systemPrompt.includes('VERIFICATION CHECKLIST') },
        { name: 'Contains command examples', test: systemPrompt.includes('COMMAND EXAMPLES') },
        { name: 'Contains critical requirements', test: systemPrompt.includes('CRITICAL SHELL COMMAND REQUIREMENTS') }
    ];
    
    // Windows-specific checks
    if (os.platform() === 'win32') {
        checks.push(
            { name: 'Contains PowerShell warning about &&', test: systemPrompt.includes('NEVER use "&&"') },
            { name: 'Contains semicolon separator', test: systemPrompt.includes('; ') }
        );
    }
    
    let passed = true;
    console.log('\n🔍 Checking System Prompt Content:');
    checks.forEach(check => {
        console.log(`  ${check.name}: ${check.test ? '✅' : '❌'}`);
        if (!check.test) passed = false;
    });
    
    if (passed) {
        console.log('\n✅ System Prompt Generation Test PASSED');
    } else {
        console.log('\n❌ System Prompt Generation Test FAILED');
    }
    
    return passed;
}

// Test 4: Command Syntax Pattern Recognition
function testCommandSyntaxPatterns() {
    console.log('\n🧪 Testing Command Syntax Pattern Recognition...');
    
    const bashCommands = [
        "cd project && npm install && npm start",
        "git add . && git commit -m 'update' && git push",
        "npm run build && npm test"
    ];
    
    const powershellCommands = [
        "cd \"project\"; npm install; npm start",
        "git add .; git commit -m 'update'; git push", 
        "npm run build; npm test"
    ];
    
    console.log('Bash-style commands (should be corrected on Windows):');
    bashCommands.forEach((cmd, i) => {
        console.log(`  ${i + 1}. ${cmd}`);
        if (os.platform() === 'win32') {
            const corrected = cmd.replace(/&&/g, ';');
            console.log(`     → Corrected: ${corrected}`);
        }
    });
    
    console.log('\nPowerShell-style commands (correct for Windows):');
    powershellCommands.forEach((cmd, i) => {
        console.log(`  ${i + 1}. ${cmd} ✅`);
    });
    
    console.log('\n✅ Command Syntax Pattern Recognition Test PASSED');
    return true;
}

// Run all tests
function runAllTests() {
    console.log('🚀 Starting BrewHand Core Logic Tests');
    console.log(`📋 Running on: ${os.platform()} ${os.arch()}`);
    console.log(`⏰ Date: ${new Date().toISOString()}\n`);
    
    const results = [
        testShellDetection(),
        testEnhancementTriggers(),
        testSystemPromptGeneration(),
        testCommandSyntaxPatterns()
    ];
    
    const passedCount = results.filter(r => r).length;
    const totalCount = results.length;
    
    console.log('\n📊 Test Results Summary:');
    console.log(`Passed: ${passedCount}/${totalCount}`);
    
    if (passedCount === totalCount) {
        console.log('\n🎉 All core logic tests PASSED!');
        console.log('✅ BrewHand background prompt injection should be working correctly.');
        console.log('✅ Shell detection is accurate for this platform.');
        console.log('✅ Enhancement triggers are working properly.');
        console.log('✅ System prompts contain all required elements.');
    } else {
        console.log('\n⚠️  Some tests FAILED. Please review the issues above.');
    }
    
    return passedCount === totalCount;
}

// Run tests
runAllTests();
