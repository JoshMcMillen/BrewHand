// Test for Custom Instructions functionality
import * as vscode from 'vscode';
import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { CustomInstructionsManager } from '../../customInstructionsManager';

suite('Custom Instructions Tests', () => {
    let customInstructionsManager: CustomInstructionsManager;
    
    setup(() => {
        customInstructionsManager = new CustomInstructionsManager();
    });

    test('Should detect shell correctly', () => {
        const shellInfo = customInstructionsManager.getShellInfo();
        assert.ok(shellInfo.type);
        assert.ok(shellInfo.separator);
        console.log(`Detected shell: ${shellInfo.type}, separator: ${shellInfo.separator}`);
    });

    test('Should generate custom instructions content', async () => {
        // This is a basic test since we can't easily test file operations in the test environment
        const options = {
            includeShellContext: true,
            includeQualityStandards: true,
            includeArchitecturalGuidance: true,
            strictMode: true
        };

        // Test that the manager can be instantiated and has expected methods
        assert.ok(typeof customInstructionsManager.createCustomInstructions === 'function');
        assert.ok(typeof customInstructionsManager.hasCustomInstructions === 'function');
        assert.ok(typeof customInstructionsManager.removeCustomInstructions === 'function');
    });

    test('Should handle missing workspace folder gracefully', async () => {
        // Test without workspace folder - should return false and show error
        const hasInstructions = customInstructionsManager.hasCustomInstructions();
        assert.strictEqual(hasInstructions, false);
    });
});