"use strict";
// Optional telemetry system for BrewHand extension
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelemetryService = void 0;
const vscode = require("vscode");
class TelemetryService {
    context;
    config;
    sessionEvents = [];
    constructor(context) {
        this.context = context;
        this.config = this.loadConfig();
    }
    loadConfig() {
        const config = vscode.workspace.getConfiguration('brewhand');
        return {
            enabled: config.get('telemetry.enabled', false),
            anonymizeData: config.get('telemetry.anonymizeData', true),
            localStorageOnly: config.get('telemetry.localStorageOnly', true)
        };
    }
    // Track extension usage events
    trackEvent(eventName, properties, measurements) {
        if (!this.config.enabled)
            return;
        const event = {
            eventName,
            properties: {
                timestamp: Date.now(),
                ...(this.config.anonymizeData ? this.anonymizeProperties(properties) : properties)
            },
            measurements
        };
        this.sessionEvents.push(event);
        if (this.config.localStorageOnly) {
            this.storeEventLocally(event);
        }
    }
    // Track specific BrewHand events
    trackModelUsage(modelName, complexity, cost, success) {
        this.trackEvent('model_usage', {
            model: modelName,
            complexity,
            success: success.toString()
        }, {
            cost,
            timestamp: Date.now()
        });
    }
    trackQualityEnhancement(language, hadQualityMarkers, enhanced) {
        this.trackEvent('quality_enhancement', {
            language,
            hadQualityMarkers: hadQualityMarkers.toString(),
            enhanced: enhanced.toString()
        });
    }
    trackBudgetEvent(event, details) {
        this.trackEvent('budget_event', {
            event,
            ...details
        });
    }
    trackComplexityAnalysis(complexity, selectedModel, actualCost) {
        this.trackEvent('complexity_analysis', {
            complexity,
            selectedModel
        }, {
            actualCost
        });
    }
    // Anonymize sensitive data
    anonymizeProperties(properties) {
        if (!properties)
            return undefined;
        const anonymized = {};
        for (const [key, value] of Object.entries(properties)) {
            if (typeof value === 'string') {
                // Hash or anonymize string values that might contain sensitive data
                if (key.includes('path') || key.includes('file') || key.includes('project')) {
                    anonymized[key] = this.hashString(value);
                }
                else {
                    anonymized[key] = value;
                }
            }
            else {
                anonymized[key] = value;
            }
        }
        return anonymized;
    }
    hashString(input) {
        // Simple hash for anonymization (not cryptographically secure)
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            const char = input.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return `hash_${Math.abs(hash)}`;
    }
    storeEventLocally(event) {
        const stored = this.context.workspaceState.get('telemetryEvents', []);
        stored.push(event);
        // Keep only last 1000 events
        if (stored.length > 1000) {
            stored.splice(0, stored.length - 1000);
        }
        this.context.workspaceState.update('telemetryEvents', stored);
    }
    // Get telemetry summary for user
    getTelemetrySummary() {
        const events = this.context.workspaceState.get('telemetryEvents', []);
        if (events.length === 0) {
            return 'No telemetry data collected.';
        }
        const eventCounts = {};
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
    // Get last BrewHand usage timestamp
    getLastBrewHandUsage() {
        const events = this.context.workspaceState.get('telemetryEvents', []);
        // Find the most recent BrewHand-related event
        for (let i = events.length - 1; i >= 0; i--) {
            const event = events[i];
            if (event.eventName.includes('chat_interaction') ||
                event.eventName.includes('brewhand') ||
                event.eventName.includes('command_validation')) {
                return event.properties?.timestamp || Date.now();
            }
        }
        return null;
    }
    // Check if telemetry is enabled
    isEnabled() {
        return this.config.enabled;
    }
    // Enable/disable telemetry
    setEnabled(enabled) {
        this.config.enabled = enabled;
        const config = vscode.workspace.getConfiguration('brewhand');
        config.update('telemetry.enabled', enabled, vscode.ConfigurationTarget.Global);
    }
}
exports.TelemetryService = TelemetryService;
//# sourceMappingURL=telemetry.js.map