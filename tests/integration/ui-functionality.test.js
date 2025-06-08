// Test script for BrewHand status bar and left panel functionality
const vscode = require('vscode');

async function testBrewHandUI() {
    console.log('🧪 Testing BrewHand UI Components...\n');

    try {
        // Test 1: Check if extension is active
        const extension = vscode.extensions.getExtension('BrewCode.brewhand');
        if (!extension) {
            throw new Error('BrewHand extension not found');
        }
        
        if (!extension.isActive) {
            await extension.activate();
        }
        console.log('✅ Extension activated successfully');

        // Test 2: Test command availability
        const commands = await vscode.commands.getCommands();
        const brewHandCommands = commands.filter(cmd => cmd.startsWith('brewhand.'));
        
        console.log('\n📋 Available BrewHand Commands:');
        brewHandCommands.forEach(cmd => {
            console.log(`   • ${cmd}`);
        });

        // Test 3: Test opening features panel
        console.log('\n🔧 Testing Features Panel...');
        try {
            await vscode.commands.executeCommand('brewhand.openFeatures');
            console.log('✅ Features panel command executed');
        } catch (error) {
            console.log('❌ Features panel command failed:', error.message);
        }

        // Test 4: Test settings panel
        console.log('\n⚙️  Testing Settings Commands...');
        try {
            await vscode.commands.executeCommand('brewhand.refreshViews');
            console.log('✅ Views refresh command executed');
        } catch (error) {
            console.log('❌ Views refresh command failed:', error.message);
        }

        // Test 5: Check configuration
        console.log('\n📊 Current BrewHand Configuration:');
        const config = vscode.workspace.getConfiguration('brewhand');
        console.log(`   • Auto Mode: ${config.get('autoModeEnabled', false)}`);
        console.log(`   • Strict Mode: ${config.get('strictMode', true)}`);
        console.log(`   • Budget Limit: ${config.get('budgetLimit', 300)}`);
        console.log(`   • Default Model: ${config.get('defaultModel', 'auto')}`);

        console.log('\n🎉 BrewHand UI test completed successfully!');
        console.log('\n💡 Check the VS Code status bar for:');
        console.log('   • BrewHand status indicator on the left');
        console.log('   • Auto-reminder toggle on the right');
        console.log('\n💡 Check the activity bar for:');
        console.log('   • BrewHand panel icon (beaker symbol)');

    } catch (error) {
        console.error('❌ BrewHand UI test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Export for VS Code extension host
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { testBrewHandUI };
}

// Run if executed directly
if (typeof vscode !== 'undefined') {
    testBrewHandUI();
}
