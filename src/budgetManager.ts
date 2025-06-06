// This file implements local session tracking of premium request usage
// Since we cannot detect the user's actual GitHub Copilot tier, users configure their own limits

import * as vscode from 'vscode';

interface ModelCost {
  modelId: string;
  displayName: string;
  requestCost: number;
  tier: 'premium' | 'standard';
}

interface BudgetConfig {
  monthlyLimit: number;
  warningThreshold: number;
  strictMode: boolean;
  resetDate: number;
  budgetStrategy: 'conservative' | 'balanced' | 'aggressive';
}

interface UsageData {
  usage: number;
  lastReset: string;
  byModel: Record<string, number>;
}

export class BudgetManager {
  private sessionUsage: Map<string, number> = new Map();
  private monthlyUsage: number = 0;
  private config: BudgetConfig = {
    monthlyLimit: 300,
    warningThreshold: 0.8,
    strictMode: false,
    resetDate: 1,
    budgetStrategy: 'balanced'
  };
  private statusBarItem: vscode.StatusBarItem;
  
  constructor(private context: vscode.ExtensionContext) {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.loadConfiguration();
    this.loadStoredUsage();
    this.context.subscriptions.push(this.statusBarItem);
  }
  
  private loadConfiguration() {
    const config = vscode.workspace.getConfiguration('brewhand');
    
    this.config = {
      monthlyLimit: config.get('budgetLimit', 300),
      warningThreshold: config.get('budgetWarningThreshold', 0.8),
      strictMode: config.get('budgetStrictMode', false),
      resetDate: config.get('budgetResetDate', 1),
      budgetStrategy: config.get('budgetStrategy', 'balanced')
    };
  }
  
  private loadStoredUsage() {
    const stored = this.context.workspaceState.get<UsageData>('monthlyUsage', {
      usage: 0,
      lastReset: new Date().toISOString(),
      byModel: {}
    });
    
    if (this.shouldReset(stored.lastReset)) {
      this.monthlyUsage = 0;
      this.saveUsage();
    } else {
      this.monthlyUsage = stored.usage;
    }
  }
  
  private shouldReset(lastReset: string): boolean {
    const last = new Date(lastReset);
    const now = new Date();
    
    // Check if we've passed the reset date this month
    if (now.getDate() >= this.config.resetDate && last.getDate() < this.config.resetDate) {
      return true;
    }
    
    // Check if we're in a new month
    return now.getMonth() !== last.getMonth() || now.getFullYear() !== last.getFullYear();
  }
  
  async trackUsage(modelId: string, requestCost: number) {
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
  
  private saveUsage() {
    const data: UsageData = {
      usage: this.monthlyUsage,
      lastReset: new Date().toISOString(),
      byModel: Object.fromEntries(this.sessionUsage)
    };
    
    this.context.workspaceState.update('monthlyUsage', data);
  }
  
  private checkThresholds() {
    const percentUsed = this.monthlyUsage / this.config.monthlyLimit;
    const showNotifications = vscode.workspace.getConfiguration('brewhand').get('showUsageNotifications', true);
    
    if (!showNotifications) return;
    
    if (percentUsed >= 1 && this.monthlyUsage === this.config.monthlyLimit) {
      vscode.window.showWarningMessage('BrewHand: Monthly premium request limit reached. Using standard models only.');
    } else if (percentUsed >= 0.8 && Math.floor((this.monthlyUsage - 1) / this.config.monthlyLimit * 100) < 80) {
      vscode.window.showInformationMessage('BrewHand: 80% of monthly premium requests used.');
    } else if (percentUsed >= 0.5 && Math.floor((this.monthlyUsage - 1) / this.config.monthlyLimit * 100) < 50) {
      vscode.window.showInformationMessage('BrewHand: 50% of monthly premium requests used.');
    }
  }
  
  canAffordModel(cost: number): boolean {
    if (!this.config.strictMode) return true;
    return (this.monthlyUsage + cost) <= this.config.monthlyLimit;
  }
  
  getRemainingBudget(): number {
    return Math.max(0, this.config.monthlyLimit - this.monthlyUsage);
  }
  
  getMonthlyLimit(): number {
    return this.config.monthlyLimit;
  }
  
  getBudgetStrategy(): string {
    return this.config.budgetStrategy;
  }
  
  getSuggestion(): 'premium' | 'standard' | 'warning' {
    const percentUsed = this.monthlyUsage / this.config.monthlyLimit;
    
    if (percentUsed >= 1) return 'standard';
    if (percentUsed >= this.config.warningThreshold) return 'warning';
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
  
  private updateStatusBar() {
    const showInStatusBar = vscode.workspace.getConfiguration('brewhand').get('showUsageInStatusBar', true);
    
    if (!showInStatusBar) {
      this.statusBarItem.hide();
      return;
    }
    
    const remaining = this.getRemainingBudget();
    const percentUsed = (this.monthlyUsage / this.config.monthlyLimit * 100).toFixed(0);
    
    this.statusBarItem.text = `$(rocket) ${remaining} requests (${percentUsed}% used)`;    this.statusBarItem.tooltip = `BrewHand: ${remaining} premium requests remaining this month`;
    this.statusBarItem.command = 'brewhand.showUsageDashboard';
    this.statusBarItem.show();
  }
}
