// Optional telemetry system for BrewHand extension

import * as vscode from 'vscode';

interface TelemetryEvent {
  eventName: string;
  properties?: Record<string, any>;
  measurements?: Record<string, number>;
}

interface TelemetryConfig {
  enabled: boolean;
  anonymizeData: boolean;
  localStorageOnly: boolean;
}

export class TelemetryService {
  private config: TelemetryConfig;
  private sessionEvents: TelemetryEvent[] = [];
  
  constructor(private context: vscode.ExtensionContext) {
    this.config = this.loadConfig();
  }
  
  private loadConfig(): TelemetryConfig {
    const config = vscode.workspace.getConfiguration('brewhand');
    return {
      enabled: config.get('telemetry.enabled', false),
      anonymizeData: config.get('telemetry.anonymizeData', true),
      localStorageOnly: config.get('telemetry.localStorageOnly', true)
    };
  }
  
  // Track extension usage events
  trackEvent(eventName: string, properties?: Record<string, any>, measurements?: Record<string, number>) {
    if (!this.config.enabled) return;
    
    const event: TelemetryEvent = {
      eventName,
      properties: this.config.anonymizeData ? this.anonymizeProperties(properties) : properties,
      measurements
    };
    
    this.sessionEvents.push(event);
    
    if (this.config.localStorageOnly) {
      this.storeEventLocally(event);
    }
  }
  
  // Track specific BrewHand events
  trackModelUsage(modelName: string, complexity: string, cost: number, success: boolean) {
    this.trackEvent('model_usage', {
      model: modelName,
      complexity,
      success: success.toString()
    }, {
      cost,
      timestamp: Date.now()
    });
  }
  
  trackQualityEnhancement(language: string, hadQualityMarkers: boolean, enhanced: boolean) {
    this.trackEvent('quality_enhancement', {
      language,
      hadQualityMarkers: hadQualityMarkers.toString(),
      enhanced: enhanced.toString()
    });
  }
  
  trackBudgetEvent(event: 'threshold_reached' | 'limit_exceeded' | 'strategy_changed', details?: Record<string, any>) {
    this.trackEvent('budget_event', {
      event,
      ...details
    });
  }
  
  trackComplexityAnalysis(complexity: string, selectedModel: string, actualCost: number) {
    this.trackEvent('complexity_analysis', {
      complexity,
      selectedModel
    }, {
      actualCost
    });
  }
  
  // Anonymize sensitive data
  private anonymizeProperties(properties?: Record<string, any>): Record<string, any> | undefined {
    if (!properties) return undefined;
    
    const anonymized: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(properties)) {
      if (typeof value === 'string') {
        // Hash or anonymize string values that might contain sensitive data
        if (key.includes('path') || key.includes('file') || key.includes('project')) {
          anonymized[key] = this.hashString(value);
        } else {
          anonymized[key] = value;
        }
      } else {
        anonymized[key] = value;
      }
    }
    
    return anonymized;
  }
  
  private hashString(input: string): string {
    // Simple hash for anonymization (not cryptographically secure)
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `hash_${Math.abs(hash)}`;
  }
  
  private storeEventLocally(event: TelemetryEvent) {
    const stored = this.context.workspaceState.get<TelemetryEvent[]>('telemetryEvents', []);
    stored.push(event);
    
    // Keep only last 1000 events
    if (stored.length > 1000) {
      stored.splice(0, stored.length - 1000);
    }
    
    this.context.workspaceState.update('telemetryEvents', stored);
  }
  
  // Get telemetry summary for user
  getTelemetrySummary(): string {
    const events = this.context.workspaceState.get<TelemetryEvent[]>('telemetryEvents', []);
    
    if (events.length === 0) {
      return 'No telemetry data collected.';
    }
    
    const eventCounts: Record<string, number> = {};
    for (const event of events) {
      eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;
    }
    
    const summary = Object.entries(eventCounts)
      .map(([event, count]) => `• ${event}: ${count} events`)
      .join('\n');
    
    return `Telemetry Summary (${events.length} total events):\n${summary}`;
  }
  
  // Clear all telemetry data
  clearTelemetryData() {
    this.sessionEvents = [];
    this.context.workspaceState.update('telemetryEvents', []);
  }
  
  // Check if telemetry is enabled
  isEnabled(): boolean {
    return this.config.enabled;
  }
  
  // Enable/disable telemetry
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled;
    const config = vscode.workspace.getConfiguration('brewhand');
    config.update('telemetry.enabled', enabled, vscode.ConfigurationTarget.Global);
  }
}
