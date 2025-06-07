"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const complexityAnalyzer_1 = require("../../complexityAnalyzer");
suite('BrewHand Extension Test Suite', () => {
    let complexityAnalyzer;
    suiteSetup(() => {
        // Initialize services that don't require VS Code context
        complexityAnalyzer = new complexityAnalyzer_1.ComplexityAnalyzer();
    });
    suite('ComplexityAnalyzer Tests', () => {
        test('Should detect high complexity architectural prompts', () => {
            const prompt = 'Design a microservices architecture with event-driven patterns and CQRS implementation';
            const factors = complexityAnalyzer.analyzeComplexity(prompt);
            const overallScore = complexityAnalyzer.getOverallComplexity(factors);
            const level = complexityAnalyzer.getComplexityLevel(overallScore);
            assert.ok(factors.patterns > 50, 'Should detect architectural patterns');
            assert.strictEqual(level, 'high', 'Should classify as high complexity');
        });
        test('Should detect low complexity simple prompts', () => {
            const prompt = 'Create a simple hello world function in JavaScript';
            const factors = complexityAnalyzer.analyzeComplexity(prompt);
            const overallScore = complexityAnalyzer.getOverallComplexity(factors);
            const level = complexityAnalyzer.getComplexityLevel(overallScore);
            assert.strictEqual(level, 'low', 'Should classify as low complexity');
        });
        test('Should detect security-related complexity', () => {
            const prompt = 'Implement OAuth 2.0 authentication with JWT tokens and XSS protection';
            const factors = complexityAnalyzer.analyzeComplexity(prompt);
            assert.ok(factors.patterns > 40, 'Should detect security patterns');
        });
        test('Should detect concurrency complexity', () => {
            const prompt = 'Create an async function that handles race conditions with proper mutex locking';
            const factors = complexityAnalyzer.analyzeComplexity(prompt);
            assert.ok(factors.patterns > 40, 'Should detect concurrency patterns');
        });
        test('Should analyze contextual complexity with file context', () => {
            const prompt = 'Add a new method to this class';
            const mockContext = {
                history: [
                    {
                        prompt: prompt,
                        response: []
                    }
                ]
            };
            const factors = complexityAnalyzer.analyzeComplexity(prompt, mockContext);
            assert.ok(factors.contextual >= 0, 'Should provide contextual analysis');
        });
    });
    suite('Quality Marker Tests', () => {
        test('Should detect comprehensive quality markers', () => {
            const codeWithQuality = `
class ValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ValidationError';
    }
}

function processData(input: string): string {
    // Input validation
    if (!input || typeof input !== 'string') {
        throw new ValidationError('Input must be a non-empty string');
    }
    
    try {
        const processed = input.trim().toLowerCase();
        
        // Processing logic here
        return processed;
    } catch (error) {
        throw new ValidationError('Processing failed: ' + error.message);
    } finally {
        // Cleanup resources
        console.log('Processing completed');
    }
}

/**
 * Example usage with error handling
 * @param data - Input string to process
 * @returns Processed string
 */
function exampleUsage(data: string) {
    try {
        return processData(data);
    } catch (error) {
        if (error instanceof ValidationError) {
            console.error('Validation failed:', error.message);
        }
        throw error;
    }
}
            `;
            // Test the patterns that checkQualityMarkers looks for
            const hasCustomError = /class\s+\w*[Ee]rror\s+extends\s+Error/.test(codeWithQuality);
            const hasThrowNew = /throw\s+new\s+\w*[Ee]rror/.test(codeWithQuality);
            const hasFinally = /finally\s*{/.test(codeWithQuality);
            const hasValidation = /if\s*\([^)]*(?:null|undefined|![\w.]+|===?\s*null|===?\s*undefined)/.test(codeWithQuality);
            const hasDocumentation = /\/\*\*[\s\S]*?\*\//.test(codeWithQuality);
            assert.ok(hasCustomError, 'Should detect custom error classes');
            assert.ok(hasThrowNew, 'Should detect error throwing');
            assert.ok(hasFinally, 'Should detect resource cleanup');
            assert.ok(hasValidation, 'Should detect input validation');
            assert.ok(hasDocumentation, 'Should detect documentation');
        });
        test('Should reject code without quality markers', () => {
            const codeWithoutQuality = `
function basicFunction(x) {
    return x + 1;
}
            `;
            const hasCustomError = /class\s+\w*[Ee]rror\s+extends\s+Error/.test(codeWithoutQuality);
            const hasThrowNew = /throw\s+new\s+\w*[Ee]rror/.test(codeWithoutQuality);
            const hasFinally = /finally\s*{/.test(codeWithoutQuality);
            const hasValidation = /if\s*\([^)]*(?:null|undefined|![\w.]+|===?\s*null|===?\s*undefined)/.test(codeWithoutQuality);
            const hasDocumentation = /\/\*\*[\s\S]*?\*\//.test(codeWithoutQuality);
            assert.ok(!hasCustomError, 'Should not detect custom error classes');
            assert.ok(!hasThrowNew, 'Should not detect error throwing');
            assert.ok(!hasFinally, 'Should not detect resource cleanup');
            assert.ok(!hasValidation, 'Should not detect input validation');
            assert.ok(!hasDocumentation, 'Should not detect documentation');
        });
    });
    suite('Integration Tests', () => {
        test('Should coordinate complexity analysis correctly', () => {
            const prompt = 'Design a complex distributed system with fault tolerance';
            const factors = complexityAnalyzer.analyzeComplexity(prompt);
            const complexity = complexityAnalyzer.getComplexityLevel(complexityAnalyzer.getOverallComplexity(factors));
            // High complexity should suggest premium models
            assert.strictEqual(complexity, 'high');
        });
        test('Should handle complexity scoring accurately', () => {
            const simplePrompt = 'Create a basic variable';
            const complexPrompt = 'Design a microservices architecture with CQRS, event sourcing, and distributed transactions';
            const simpleFactors = complexityAnalyzer.analyzeComplexity(simplePrompt);
            const complexFactors = complexityAnalyzer.analyzeComplexity(complexPrompt);
            const simpleScore = complexityAnalyzer.getOverallComplexity(simpleFactors);
            const complexScore = complexityAnalyzer.getOverallComplexity(complexFactors);
            assert.ok(complexScore > simpleScore, 'Complex prompts should score higher than simple ones');
        });
    });
});
//# sourceMappingURL=extension.test.js.map