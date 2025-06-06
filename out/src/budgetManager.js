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
        // Update status bar
        this.updateStatusBar();
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
        this.updateStatusBar();
        vscode.window.showInformationMessage('BrewHand: Monthly usage reset successfully.');
    }
    updateStatusBar() {
        const showInStatusBar = vscode.workspace.getConfiguration('brewhand').get('showUsageInStatusBar', true);
        if (!showInStatusBar) {
            this.statusBarItem.hide();
            return;
        }
        const remaining = this.getRemainingBudget();
        const percentUsed = (this.monthlyUsage / this.config.monthlyLimit * 100).toFixed(0);
        this.statusBarItem.text = `$(rocket) ${remaining} requests (${percentUsed}% used)`;
        this.statusBarItem.tooltip = `BrewHand: ${remaining} premium requests remaining this month`;
        this.statusBarItem.command = 'brewhand.showUsageDashboard';
        this.statusBarItem.show();
    }
}
exports.BudgetManager = BudgetManager;
//# sourceMappingURL=budgetManager.js.map