"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexityAnalyzer = void 0;
const vscode = require("vscode");
const COMPLEXITY_PATTERNS = {
    architecture: {
        patterns: [
            /\b(micro)?services?\s+architecture/i,
            /\b(event[- ]driven|message[- ]queue|pub[- ]?sub)/i,
            /\b(domain[- ]driven[- ]design|DDD|CQRS)/i,
            /\b(high[- ]availability|fault[- ]tolerant|resilient)/i,
            /\b(load[- ]balanc|distribut|scal(e|able|ing))/i
        ],
        weight: 90
    },
    algorithms: {
        patterns: [
            /\b(algorithm|data structure|complexity|big[- ]?o)/i,
            /\b(optimize|performance|efficient|cache)/i,
            /\b(recursive|dynamic programming|graph|tree)/i,
            /\b(sort|search|traverse|heap|queue)/i
        ],
        weight: 80
    },
    concurrency: {
        patterns: [
            /\b(concurrent|parallel|thread|async|await)/i,
            /\b(race condition|deadlock|mutex|semaphore)/i,
            /\b(actor model|goroutine|channel)/i,
            /\b(promise|future|coroutine)/i
        ],
        weight: 85
    },
    security: {
        patterns: [
            /\b(security|authentication|authorization|OAuth)/i,
            /\b(encrypt|decrypt|hash|salt|JWT|token)/i,
            /\b(XSS|CSRF|SQL injection|sanitize)/i,
            /\b(vulnerabilit|penetration|exploit)/i
        ],
        weight: 75
    },
    database: {
        patterns: [
            /\b(database|SQL|NoSQL|ACID|transaction)/i,
            /\b(index|query optimization|shard|partition)/i,
            /\b(replication|cluster|backup|migration)/i
        ],
        weight: 70
    },
    simple: {
        patterns: [
            /\b(simple|basic|example|demo|test|hello world)/i,
            /\b(todo|sample|tutorial|getting started)/i
        ],
        weight: -30 // Negative weight reduces complexity
    }
};
class ComplexityAnalyzer {
    analyzeComplexity(prompt, context) {
        return {
            keywords: this.analyzeKeywordComplexity(prompt),
            patterns: this.analyzePatternComplexity(prompt),
            scope: this.analyzeScopeComplexity(prompt),
            contextual: this.analyzeContextualComplexity(prompt, context)
        };
    }
    getOverallComplexity(factors) {
        const weights = {
            keywords: 0.2,
            patterns: 0.35,
            scope: 0.25,
            contextual: 0.2
        };
        return Object.entries(factors).reduce((sum, [key, value]) => sum + value * weights[key], 0);
    }
    getComplexityLevel(score) {
        if (score >= 70)
            return 'high';
        if (score >= 40)
            return 'medium';
        return 'low';
    }
    analyzeKeywordComplexity(prompt) {
        const complexKeywords = [
            'architecture', 'scalable', 'distributed', 'microservice',
            'concurrent', 'parallel', 'async', 'performance',
            'security', 'encryption', 'optimization', 'algorithm',
            'design pattern', 'refactor', 'enterprise', 'production'
        ];
        const simpleKeywords = [
            'simple', 'basic', 'example', 'test', 'demo'
        ];
        let score = 50; // Base score
        // Add points for complex keywords
        complexKeywords.forEach(keyword => {
            if (prompt.toLowerCase().includes(keyword))
                score += 10;
        });
        // Subtract points for simple keywords
        simpleKeywords.forEach(keyword => {
            if (prompt.toLowerCase().includes(keyword))
                score -= 15;
        });
        return Math.min(100, Math.max(0, score));
    }
    analyzePatternComplexity(prompt) {
        let score = 30; // Base score
        let matchedCategories = 0;
        for (const [category, config] of Object.entries(COMPLEXITY_PATTERNS)) {
            const matchCount = config.patterns.filter(pattern => pattern.test(prompt)).length;
            if (matchCount > 0) {
                matchedCategories++;
                const categoryScore = (config.weight * matchCount) / config.patterns.length;
                score += categoryScore / 2; // Normalize contribution
            }
        }
        // Bonus for matching multiple categories (indicates complex, multi-faceted request)
        if (matchedCategories > 2)
            score += 20;
        return Math.min(100, Math.max(0, score));
    }
    analyzeScopeComplexity(prompt) {
        const scopeIndicators = {
            system: {
                keywords: ['system', 'architecture', 'infrastructure', 'platform', 'ecosystem'],
                score: 90
            },
            module: {
                keywords: ['module', 'package', 'library', 'api', 'service'],
                score: 70
            },
            class: {
                keywords: ['class', 'component', 'model', 'entity', 'object'],
                score: 50
            },
            function: {
                keywords: ['function', 'method', 'handler', 'utility', 'helper'],
                score: 30
            }
        };
        for (const [scope, config] of Object.entries(scopeIndicators)) {
            const hasIndicator = config.keywords.some(keyword => prompt.toLowerCase().includes(keyword));
            if (hasIndicator)
                return config.score;
        }
        return 40; // Default medium scope
    }
    analyzeContextualComplexity(prompt, context) {
        let score = 0;
        // Check conversation history for building complexity
        if (context?.history && context.history.length > 0) {
            // More turns = more complex conversation
            score += Math.min(context.history.length * 5, 20);
        }
        // Check current file context
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const lineCount = editor.document.lineCount;
            if (lineCount > 1000)
                score += 30;
            else if (lineCount > 500)
                score += 20;
            else if (lineCount > 200)
                score += 10;
        }
        // Language-specific complexity
        const language = this.detectLanguage(prompt);
        const languageComplexity = {
            'cpp': 20,
            'rust': 20,
            'scala': 15,
            'java': 10,
            'typescript': 10,
            'python': 5,
            'javascript': 5,
            'ruby': 8
        };
        score += languageComplexity[language] || 0;
        return Math.min(100, score);
    }
    detectLanguage(prompt) {
        const languages = {
            'ruby': /\b(ruby|rails|gem|bundle|rake|rspec|minitest|sidekiq|devise|activerecord|erb|haml)\b/i,
            'typescript': /\b(typescript|ts|interface|type)\b/i,
            'javascript': /\b(javascript|js|node|npm|react|vue|angular)\b/i,
            'python': /\b(python|py|django|flask|fastapi|pandas|numpy)\b/i,
            'java': /\b(java|spring|maven|gradle|hibernate)\b/i,
            'csharp': /\b(c#|csharp|\.net|dotnet|asp\.net)\b/i,
            'go': /\b(golang|go)\b/i,
            'rust': /\b(rust|cargo)\b/i,
            'cpp': /\b(c\+\+|cpp|pointer|template)\b/i,
            'scala': /\b(scala|sbt|akka)\b/i
        };
        for (const [lang, regex] of Object.entries(languages)) {
            if (regex.test(prompt))
                return lang;
        }
        const activeEditor = vscode.window.activeTextEditor;
        return activeEditor?.document.languageId || 'javascript';
    }
}
exports.ComplexityAnalyzer = ComplexityAnalyzer;
//# sourceMappingURL=complexityAnalyzer.js.map