"use strict";
// This file implements local session tracking of premium request usage
// Since we cannot detect the user's actual GitHub Copilot tier, users configure their own limits
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetManager = void 0;
const vscode = require("vscode");
class BudgetManager {
    context;
    sessionUsage = new Map();
    monthlyUsage = 0;
    config = {
        monthlyLimit: 300,
        warningThreshold: 0.8,
        strictMode: false,
        resetDate: 1,
        budgetStrategy: 'balanced'
    };
    statusBarItem;
    constructor(context) {
        this.context = context;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.loadConfiguration();
        this.loadStoredUsage();
        this.context.subscriptions.push(this.statusBarItem);
    }
    loadConfiguration() {
        const config = vscode.workspace.getConfiguration('brewhand');
        this.config = {
            monthlyLimit: config.get('budgetLimit', 300),
            warningThreshold: config.get('budgetWarningThreshold', 0.8),
            strictMode: config.get('budgetStrictMode', false),
            resetDate: config.get('budgetResetDate', 1),
            budgetStrategy: config.get('budgetStrategy', 'balanced')
        };
    }
    loadStoredUsage() {
        const stored = this.context.workspaceState.get('monthlyUsage', {
            usage: 0,
            lastReset: new Date().toISOString(),
            byModel: {}
        });
        if (this.shouldReset(stored.lastReset)) {
            this.monthlyUsage = 0;
            this.saveUsage();
        }
        else {
            this.monthlyUsage = stored.usage;
        }
    }
    shouldReset(lastReset) {
        const last = new Date(lastReset);
        const now = new Date();
        // Check if we've passed the reset date this month
        if (now.getDate() >= this.config.resetDate && last.getDate() < this.config.resetDate) {
            return true;
        }
        // Check if we're in a new month
        return now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
    }
    async trackUsage(modelId, requestCost) {
        // Track in current session
        const current = this.sessionUsage.get(modelId) || 0;
        this.sessionUsage.set(modelId, current + requestCost);
        // Track monthly
        this.monthlyUsage += requestCost;
        this.saveUsage();
        // Show notifications at thresholds
        this.checkThresholds();
        // Update status bar with enhanced context
        this.updateStatusBarWithContext();
    }
    updateStatusBarWithContext() {
        const remaining = this.getRemainingBudget();
        const limit = this.config.monthlyLimit;
        const usagePercent = Math.round((this.monthlyUsage / limit) * 100);
        // Visual indicators based on budget status
        let icon = '🔋'; // Default battery icon
        let color;
        if (usagePercent >= 90) {
            icon = '⚠️'; // Warning for high usage
            color = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
        else if (usagePercent >= 75) {
            icon = '🟡'; // Yellow for moderate usage
            color = new vscode.ThemeColor('statusBarItem.warningBackground');
        }
        else if (usagePercent >= 50) {
            icon = '🟢'; // Green for normal usage
        }
        else {
            icon = '🔋'; // Full battery for low usage
        }
        // Enhanced status text with strategy context
        const strategyTip = this.getStrategyTip();
        this.statusBarItem.text = `${icon} BrewHand: ${remaining}/${limit} (${usagePercent}%)`;
        this.statusBarItem.tooltip = `BrewHand Budget Status\n\nRemaining: ${remaining} requests\nUsed: ${this.monthlyUsage}/${limit} (${usagePercent}%)\nStrategy: ${this.config.budgetStrategy}\n\n💡 ${strategyTip}`;
        this.statusBarItem.backgroundColor = color;
        this.statusBarItem.show();
    }
    getStrategyTip() {
        const strategy = this.config.budgetStrategy;
        const remaining = this.getRemainingBudget();
        const daysLeft = this.getDaysUntilReset();
        switch (strategy) {
            case 'conservative':
                return `Conservative mode: Save premium requests for complex tasks. Use standard models for simple queries.`;
            case 'aggressive':
                return `Aggressive mode: Use premium models freely. ${remaining} requests for ${daysLeft} days remaining.`;
            case 'balanced':
            default:
                const dailyBudget = Math.floor(remaining / Math.max(daysLeft, 1));
                return `Balanced mode: ~${dailyBudget} premium requests per day recommended.`;
        }
    }
    getDaysUntilReset() {
        const now = new Date();
        const resetDate = new Date(now.getFullYear(), now.getMonth(), this.config.resetDate);
        // If reset date has passed this month, calculate for next month
        if (now.getDate() >= this.config.resetDate) {
            resetDate.setMonth(resetDate.getMonth() + 1);
        }
        const msPerDay = 24 * 60 * 60 * 1000;
        return Math.max(1, Math.ceil((resetDate.getTime() - now.getTime()) / msPerDay));
    }
    saveUsage() {
        const data = {
            usage: this.monthlyUsage,
            lastReset: new Date().toISOString(),
            byModel: Object.fromEntries(this.sessionUsage)
        };
        this.context.workspaceState.update('monthlyUsage', data);
    }
    checkThresholds() {
        const percentUsed = this.monthlyUsage / this.config.monthlyLimit;
        const showNotifications = vscode.workspace.getConfiguration('brewhand').get('showUsageNotifications', true);
        if (!showNotifications)
            return;
        if (percentUsed >= 1 && this.monthlyUsage === this.config.monthlyLimit) {
            vscode.window.showWarningMessage('BrewHand: Monthly premium request limit reached. Using standard models only.');
        }
        else if (percentUsed >= 0.8 && Math.floor((this.monthlyUsage - 1) / this.config.monthlyLimit * 100) < 80) {
            vscode.window.showInformationMessage('BrewHand: 80% of monthly premium requests used.');
        }
        else if (percentUsed >= 0.5 && Math.floor((this.monthlyUsage - 1) / this.config.monthlyLimit * 100) < 50) {
            vscode.window.showInformationMessage('BrewHand: 50% of monthly premium requests used.');
        }
    }
    canAffordModel(cost) {
        if (!this.config.strictMode)
            return true;
        return (this.monthlyUsage + cost) <= this.config.monthlyLimit;
    }
    // Enhanced dashboard with better formatting and strategy tips
    showUsageDashboard() {
        const remaining = this.getRemainingBudget();
        const limit = this.config.monthlyLimit;
        const usagePercent = Math.round((this.monthlyUsage / limit) * 100);
        const daysLeft = this.getDaysUntilReset();
        const dailyBudget = Math.floor(remaining / Math.max(daysLeft, 1));
        // Generate visual progress bar
        const barLength = 20;
        const filledBars = Math.round((this.monthlyUsage / limit) * barLength);
        const progressBar = '█'.repeat(filledBars) + '░'.repeat(barLength - filledBars);
        // Model usage breakdown with enhanced formatting
        const modelStats = this.getFormattedModelStats();
        // Strategy-specific recommendations
        const recommendations = this.getStrategyRecommendations();
        const dashboard = `
📊 **BrewHand Usage Dashboard**

**Budget Overview**
${progressBar} ${usagePercent}%
Used: ${this.monthlyUsage}/${limit} premium requests
Remaining: ${remaining} requests (${daysLeft} days left)
Daily budget: ~${dailyBudget} requests

**Strategy**: ${this.config.budgetStrategy.toUpperCase()}
${recommendations}

**Model Usage Breakdown**
${modelStats}

**Configuration**
• Warning threshold: ${Math.round(this.config.warningThreshold * 100)}%
• Strict mode: ${this.config.strictMode ? 'ON' : 'OFF'}
• Reset date: ${this.config.resetDate}${this.getOrdinalSuffix(this.config.resetDate)} of each month

💡 **Pro Tips**
• Use '@brewhand' for complex architectural questions
• Standard models (Claude 3.5 Sonnet, GPT-4o) are free and excellent for most tasks
• Premium models excel at sustained reasoning and complex system design
• Set strict mode ON to prevent accidental overuse
`;
        const panel = vscode.window.createWebviewPanel('brewhandDashboard', 'BrewHand Usage Dashboard', vscode.ViewColumn.One, {
            enableScripts: true
        });
        panel.webview.html = this.getDashboardHTML(dashboard);
        // Handle messages from webview
        panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.command) {
                case 'exportUsageData':
                    await this.exportUsageData();
                    break;
            }
        }, undefined, this.context.subscriptions);
    }
    getFormattedModelStats() {
        if (this.sessionUsage.size === 0) {
            return '• No premium models used this session';
        }
        const sortedModels = Array.from(this.sessionUsage.entries())
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5); // Top 5 models
        return sortedModels
            .map(([model, usage]) => `• ${model}: ${usage} requests`)
            .join('\n');
    }
    getStrategyRecommendations() {
        const remaining = this.getRemainingBudget();
        const daysLeft = this.getDaysUntilReset();
        switch (this.config.budgetStrategy) {
            case 'conservative':
                return '🛡️ Save premium requests for architectural decisions, complex algorithms, and system design';
            case 'aggressive':
                return '🚀 Use premium models freely for faster development and higher code quality';
            case 'balanced':
            default:
                if (remaining > daysLeft * 5) {
                    return '⚖️ You have budget flexibility - consider using premium models for complex tasks';
                }
                else if (remaining < daysLeft * 2) {
                    return '⚖️ Budget is tight - prioritize premium requests for critical/complex work';
                }
                else {
                    return '⚖️ On track with balanced usage - continue current pattern';
                }
        }
    }
    getOrdinalSuffix(day) {
        if (day >= 11 && day <= 13)
            return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }
    getDashboardHTML(content) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BrewHand Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            line-height: 1.6;
            margin: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        pre {
            background-color: var(--vscode-textBlockQuote-background);
            padding: 15px;
            border-radius: 5px;
            white-space: pre-wrap;
            font-family: 'Consolas', 'Monaco', monospace;
            border-left: 4px solid var(--vscode-textBlockQuote-border);
        }
        .export-button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
        .export-button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
    </style>
</head>
<body>
    <pre>${content}</pre>
    <button class="export-button" onclick="exportData()">📊 Export Usage Data</button>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        function exportData() {
            vscode.postMessage({
                command: 'exportUsageData'
            });
        }
    </script>
</body>
</html>`;
    }
    // Export usage data functionality
    async exportUsageData() {
        const data = {
            exportDate: new Date().toISOString(),
            monthlyUsage: this.monthlyUsage,
            monthlyLimit: this.config.monthlyLimit,
            budgetStrategy: this.config.budgetStrategy,
            modelUsage: Object.fromEntries(this.sessionUsage),
            remainingBudget: this.getRemainingBudget(),
            usagePercentage: Math.round((this.monthlyUsage / this.config.monthlyLimit) * 100),
            daysUntilReset: this.getDaysUntilReset(),
            configuration: this.config
        };
        const jsonString = JSON.stringify(data, null, 2);
        const fileName = `brewhand-usage-${new Date().toISOString().split('T')[0]}.json`;
        try {
            const uri = await vscode.window.showSaveDialog({
                defaultUri: vscode.Uri.file(fileName),
                filters: {
                    'JSON files': ['json'],
                    'All files': ['*']
                }
            });
            if (uri) {
                await vscode.workspace.fs.writeFile(uri, Buffer.from(jsonString, 'utf8'));
                vscode.window.showInformationMessage(`✅ Usage data exported to ${uri.fsPath}`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`❌ Failed to export usage data: ${error}`);
        }
    }
    getRemainingBudget() {
        return Math.max(0, this.config.monthlyLimit - this.monthlyUsage);
    }
    getMonthlyLimit() {
        return this.config.monthlyLimit;
    }
    getBudgetStrategy() {
        return this.config.budgetStrategy;
    }
    getSuggestion() {
        const percentUsed = this.monthlyUsage / this.config.monthlyLimit;
        if (percentUsed >= 1)
            return 'standard';
        if (percentUsed >= this.config.warningThreshold)
            return 'warning';
        return 'premium';
    }
    getDetailedUsage() {
        return {
            monthlyUsage: this.monthlyUsage,
            sessionUsage: Object.fromEntries(this.sessionUsage),
            byModel: Object.fromEntries(this.sessionUsage),
            resetDate: this.config.resetDate,
            strategy: this.config.budgetStrategy
        };
    }
    resetMonthlyUsage() {
        this.monthlyUsage = 0;
        this.sessionUsage.clear();
        this.saveUsage();
        this.updateStatusBarWithContext();
        vscode.window.showInformationMessage('BrewHand: Monthly usage reset successfully.');
    }
}
exports.BudgetManager = BudgetManager;
//# sourceMappingURL=budgetManager.js.map