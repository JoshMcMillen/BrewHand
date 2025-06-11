// View Providers for BrewHand Extension
import * as vscode from 'vscode';

export interface FeatureItem {
    label: string;
    description: string;
    enabled: boolean;
    configKey: string;
    tooltip: string;
}

export interface SettingItem {
    label: string;
    description: string;
    value: any;
    configKey: string;
    type: 'boolean' | 'string' | 'number' | 'enum';
    options?: string[];
}

export interface UsageItem {
    label: string;
    description: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
}

export class BrewHandTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue?: string,
        public readonly description?: string,
        public readonly tooltip?: string
    ) {
        super(label, collapsibleState);
        this.description = description;
        this.tooltip = tooltip;
        this.contextValue = contextValue;
    }
}

export class FeaturesProvider implements vscode.TreeDataProvider<BrewHandTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<BrewHandTreeItem | undefined | null | void> = new vscode.EventEmitter<BrewHandTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BrewHandTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;    private features: FeatureItem[] = [        {
            label: 'Iterative Mode',
            description: 'Context-aware workflow assistance',
            enabled: vscode.workspace.getConfiguration('brewhand').get('enableIterativeSupport', true),
            configKey: 'brewhand.enableIterativeSupport',
            tooltip: 'Enable intelligent workflow assistance that remembers context across multiple steps and provides continuous help throughout complex development tasks'
        },
        {
            label: 'Auto Mode Reminder',
            description: 'Chat usage reminders',
            enabled: vscode.workspace.getConfiguration('brewhand').get('autoModeEnabled', false),
            configKey: 'brewhand.autoModeEnabled',
            tooltip: 'Show periodic reminders in status bar to use @brewhand for enhanced code generation and quality assistance'
        },
        {
            label: 'Strict Mode',
            description: 'Production-ready code standards',
            enabled: vscode.workspace.getConfiguration('brewhand').get('strictMode', true),
            configKey: 'brewhand.strictMode',
            tooltip: 'Enforce strict quality standards: eliminates TODO comments, ensures comprehensive error handling, and requires production-ready code patterns'
        },
        {
            label: 'Include Tests',
            description: 'Automatic test suggestions',
            enabled: vscode.workspace.getConfiguration('brewhand').get('includeTests', false),
            configKey: 'brewhand.includeTests',
            tooltip: 'Automatically suggest unit tests and testing strategies when generating code to improve code reliability and maintainability'
        },
        {
            label: 'Shell Command Monitoring',
            description: 'Real-time terminal error detection',
            enabled: vscode.workspace.getConfiguration('brewhand').get('monitorTerminalCommands', true),
            configKey: 'brewhand.monitorTerminalCommands',
            tooltip: 'Actively monitor your terminal for shell syntax errors and provide real-time suggestions to fix command issues'
        },        {
            label: 'Auto Fix Shell Syntax',
            description: 'Smart command syntax correction',
            enabled: vscode.workspace.getConfiguration('brewhand').get('autoFixShellSyntax', true),
            configKey: 'brewhand.autoFixShellSyntax',
            tooltip: 'Automatically detect and fix shell command syntax errors for your current shell environment (PowerShell, Bash, etc.)'
        }
    ];

    constructor() {
        // Listen for configuration changes
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('brewhand')) {
                this.updateFeatures();
                this.refresh();
            }
        });
    }

    private updateFeatures() {
        this.features.forEach(feature => {
            feature.enabled = vscode.workspace.getConfiguration().get(feature.configKey, false);
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: BrewHandTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: BrewHandTreeItem): Thenable<BrewHandTreeItem[]> {
        if (!element) {
            // Root level - return feature items
            return Promise.resolve(this.features.map(feature => {
                const item = new BrewHandTreeItem(
                    feature.label,
                    vscode.TreeItemCollapsibleState.None,
                    'feature',
                    feature.enabled ? '✅ Enabled' : '❌ Disabled',
                    feature.tooltip
                );
                item.command = {
                    command: 'brewhand.toggleFeature',
                    title: 'Toggle Feature',
                    arguments: [feature.configKey]
                };
                return item;
            }));
        }
        return Promise.resolve([]);
    }
}

export class SettingsProvider implements vscode.TreeDataProvider<BrewHandTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<BrewHandTreeItem | undefined | null | void> = new vscode.EventEmitter<BrewHandTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BrewHandTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;    private settings: SettingItem[] = [        {
            label: 'Iterative Assistance',
            description: 'Intelligent workflow support with context memory',
            value: vscode.workspace.getConfiguration('brewhand').get('enableIterativeSupport', true),
            configKey: 'brewhand.enableIterativeSupport',
            type: 'boolean'
        },
        {
            label: 'Architectural Focus',
            description: 'Primary principle for code generation',
            value: vscode.workspace.getConfiguration('brewhand').get('architecturalFocus', 'balanced'),
            configKey: 'brewhand.architecturalFocus',
            type: 'enum',
            options: ['performance', 'maintainability', 'security', 'scalability', 'balanced']
        },
        {
            label: 'Shell Detection',
            description: 'Shell environment auto-detection',
            value: vscode.workspace.getConfiguration('brewhand').get('shellDetection', 'auto'),
            configKey: 'brewhand.shellDetection',
            type: 'enum',
            options: ['auto', 'powershell', 'cmd', 'bash', 'zsh']
        }
    ];

    constructor() {
        vscode.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('brewhand')) {
                this.updateSettings();
                this.refresh();
            }
        });
    }

    private updateSettings() {
        this.settings.forEach(setting => {
            setting.value = vscode.workspace.getConfiguration().get(setting.configKey);
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: BrewHandTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: BrewHandTreeItem): Thenable<BrewHandTreeItem[]> {
        if (!element) {
            return Promise.resolve(this.settings.map(setting => {
                const item = new BrewHandTreeItem(
                    setting.label,
                    vscode.TreeItemCollapsibleState.None,
                    'setting',
                    String(setting.value),
                    `${setting.description} (Current: ${setting.value})`
                );
                item.command = {
                    command: 'brewhand.editSetting',
                    title: 'Edit Setting',
                    arguments: [setting]
                };
                return item;
            }));
        }
        return Promise.resolve([]);
    }
}

export class UsageProvider implements vscode.TreeDataProvider<BrewHandTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<BrewHandTreeItem | undefined | null | void> = new vscode.EventEmitter<BrewHandTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<BrewHandTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private usageItems: UsageItem[] = [];

    constructor(private budgetManager: any, private telemetryService: any) {
        this.updateUsageItems();
        
        // Refresh usage data periodically
        setInterval(() => {
            this.updateUsageItems();
            this.refresh();
        }, 60000); // Every minute
    }

    private updateUsageItems() {
        const usage = this.budgetManager.getCurrentUsage();
        const telemetry = this.telemetryService.getTelemetrySummary();
        
        this.usageItems = [
            {
                label: 'Monthly Usage',
                description: 'Premium requests this month',
                value: `${usage.used}/${usage.limit}`
            },
            {
                label: 'Budget Remaining',
                description: 'Remaining premium requests',
                value: usage.limit - usage.used
            },
            {
                label: 'Usage Percentage',
                description: 'Percentage of budget used',
                value: `${Math.round((usage.used / usage.limit) * 100)}%`
            },
            {
                label: 'Total Sessions',
                description: 'Total coding sessions',
                value: telemetry.totalSessions || 0
            },
            {
                label: 'Code Quality Score',
                description: 'Average quality score',
                value: `${telemetry.averageQualityScore || 'N/A'}/10`
            },
            {
                label: 'Shell Commands Fixed',
                description: 'Shell syntax errors corrected',
                value: telemetry.shellCommandsFixed || 0
            }
        ];
    }

    refresh(): void {
        this.updateUsageItems();
        this._onDidChangeTreeData.fire();
    }    getTreeItem(element: BrewHandTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: BrewHandTreeItem): Thenable<BrewHandTreeItem[]> {
        if (!element) {
            return Promise.resolve(this.usageItems.map(item => {
                // Add trend indicators
                let label = item.label;
                if (item.trend) {
                    const trendIcon = item.trend === 'up' ? '📈' : item.trend === 'down' ? '📉' : '📊';
                    label = `${trendIcon} ${item.label}`;
                }
                
                const treeItem = new BrewHandTreeItem(
                    label,
                    vscode.TreeItemCollapsibleState.None,
                    'usage',
                    String(item.value),
                    item.description
                );
                
                return treeItem;
            }));
        }
        return Promise.resolve([]);
    }
}
