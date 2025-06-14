# Changelog

All notable changes to the BrewHand extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# Changelog

All notable changes to the BrewHand extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-06-10

### 🔧 **Settings Simplification**
- **Unified Iterative Mode** - Consolidated `continuousAssistanceMode` and `enableIterativeSupport` into a single intuitive setting
- **Removed Complex UI** - Temporarily removed default model selection and budget management UI for better user experience
- **Streamlined Interface** - Focused on core functionality with cleaner, more accessible controls
- **Removed Usage Notifications** - Disabled usage tracking notifications and status bar display for cleaner UX
- **Removed Status Bar Usage Display** - Eliminated budget tracking from status bar to focus on core functionality

### 🍺 **Enhanced User Experience** 
- **Beer Menu Status Bar** - Changed status bar text from "BrewHand [CONTINUOUS]" to friendly "🍺 Beer Menu"
- **Simplified Quick Settings** - Removed confusing budget and model options from settings panel
- **Enhanced Setting Descriptions** - Comprehensive, helpful tooltips and descriptions for all settings and features:
  - Detailed explanations for each configuration option
  - Context-aware descriptions that explain the impact of each setting
  - Educational guidance to help users understand shell syntax features
  - Clear architectural focus explanations (performance, maintainability, security, etc.)
- **Improved Feature Labels** - Enhanced clarity in Beer Menu panel with better descriptions
- **Marketplace-Ready Documentation** - Updated README with VS Code Marketplace focused content

### 🐛 **Bug Fixes**
- **Improved Shell Syntax Detection** - Fixed regex pattern to catch `&&` syntax errors with or without spaces in PowerShell
- **Better Command Validation** - Enhanced detection of cross-shell syntax issues

### 🎯 **User Interface Improvements**
- **Removed Usage View** - Temporarily removed usage tracking panel to focus on core features
- **Consolidated Settings** - Single "Iterative Assistance" toggle instead of multiple confusing modes
- **Cleaner Activity Panel** - Beer Menu now shows only Features and Quick Settings
- **Better Feature Labels** - Improved clarity of feature names and descriptions in Beer Menu panel

### 📋 **Documentation Updates**
- **VS Code Marketplace Focus** - Restructured README for better marketplace presentation
- **Simplified Getting Started** - Clear, step-by-step instructions for new users
- **Better Feature Organization** - Grouped features logically for easier understanding

### 🔧 **Technical Changes**
- Removed `brewhand.continuousAssistanceMode` configuration option
- Disabled `showUsageNotifications` and `showUsageInStatusBar` configurations  
- **Command Palette Cleanup** - Removed 11 unimplemented commands to prevent user confusion:
  - Removed: `enhanceSelection`, `generateWithQuality`, `reviewCode`
  - Removed: `showUsageDashboard`, `exportUsageData`, `showTelemetrySummary`
  - Removed: `clearTelemetryData`, `resetUsage`, `formatCommand`
  - Removed: `toggleAutoMode`, `toggleAlwaysActive`
  - **Kept Only Working Commands**: 13 implemented commands remain for a clean, functional command palette
- Updated keybindings to reflect available commands
- Cleaned up context menus to show only functional options
- Removed `brewhand.defaultModel` configuration panel (functionality preserved)
- Removed `brewhand.budgetLimit`, `brewhand.budgetStrategy` from UI (functionality preserved)
- Updated status bar text and tooltip generation
- Streamlined view provider registration

### 📝 **Notes for Users**
- **Settings Migration**: Existing continuous mode settings automatically convert to iterative mode
- **Hidden Features**: Budget and model management still work internally but are not exposed in UI
- **Future Updates**: Complex features will return in future versions with better UX

### 🎯 **Key Innovation**
**Before**: AI generates `cd project && npm install` → User copies → Command fails in PowerShell → User manually fixes
**After**: AI receives PowerShell context → Generates `cd "project"; npm install` → Command works immediately

This represents a fundamental shift from **reactive correction** to **proactive prevention** of shell syntax issues.

## [1.0.2] - 2025-06-08

### 🧹 **Workspace & Code Quality**
- **Comprehensive workspace cleanup** - Organized test files and removed outdated documentation
- **Test file reorganization** - Moved tests to proper directory structure (`tests/unit/`, `tests/integration/`, `tests/fixtures/`)
- **Configuration analysis tools** - Added Jupyter notebook for extension configuration validation
- **Effectiveness assessment framework** - Created tools to measure BrewHand's impact on code quality
- **Documentation cleanup** - Removed outdated Ruby files and old release notes
- **Workspace structure optimization** - Clean, organized project layout for better maintainability

### 📊 **Analysis & Monitoring Tools**
- **Configuration Analysis Notebook** - Comprehensive analysis of extension setup and validation
- **Effectiveness Assessment** - Tools to measure code quality improvements
- **Installation verification** - Automated checks for proper extension installation and functionality
- **Usage tracking preparation** - Framework for monitoring BrewHand's impact on development workflow

### 🔧 **Development Infrastructure**
- **Enhanced test organization** - Better separation of unit, integration, and fixture files
- **Improved project structure** - Cleaner workspace for ongoing development
- **Analysis documentation** - Created assessment tools for measuring extension effectiveness
- **Quality verification** - Tools to ensure BrewHand is providing better code quality

### 📚 **Documentation Updates**
- **Workspace cleanup documentation** - Complete record of cleanup actions
- **Assessment framework** - Guide for measuring BrewHand effectiveness
- **Installation verification** - Automated tools to confirm proper setup

---

## [1.0.1] - 2025-06-07

### 🆕 Added
- **Always-Active Monitoring Mode** - Proactive assistance that monitors for opportunities to help
  - New command: `BrewHand: Toggle Always Active Mode`
  - Clipboard monitoring for shell command syntax issues
  - Auto-suggestions when syntax errors are detected
  - Smart reminders to use @brewhand (with intelligent cooldowns)
  - Status bar indicator shows `[ACTIVE]` when enabled

- **Enhanced Shell Command Monitoring**
  - Detects PowerShell vs Bash syntax issues in real-time
  - Proactive notifications for command syntax problems
  - Options to "Fix & Use @brewhand", "Just Fix", or "Ignore"
  - 30-second cooldown to prevent over-suggesting

- **Proactive Command Detection**
  - Monitors clipboard for shell commands
  - Pattern recognition for common command structures
  - Cross-platform syntax validation (PowerShell `;` vs Bash `&&`)
  - Automatic guidance to @brewhand usage

- **New Configuration Options**
  - `brewhand.alwaysActive` - Enable/disable always-active monitoring
  - `brewhand.showAutoSuggestions` - Control automatic suggestions
  - `brewhand.showReminders` - Control periodic reminders
  - `brewhand.lastReminderTime` - Internal cooldown tracking

### ✨ Enhanced
- **Status Bar Integration**
  - Shows `🍺 Beer Menu [ACTIVE]` when always-active mode is enabled
  - Click status bar to toggle between active/manual modes
  - Enhanced tooltips with more detailed information
  - Better visual indicators for different states

- **Chat Participant (@brewhand)**
  - Improved shell command detection and validation
  - Better integration with always-active monitoring
  - Enhanced error reporting for command issues
  - Tracks usage to avoid over-suggesting

- **Terminal Monitoring**
  - Enhanced terminal activity detection
  - Smart reminders when terminal is actively used
  - 5-minute cooldown between reminders
  - Context-aware suggestions

### 🐛 Fixed
- Improved shell detection accuracy for Windows PowerShell
- Better handling of command validation edge cases
- Fixed clipboard monitoring performance issues
- Enhanced error handling in command detection

### 📚 Documentation
- Updated README with always-active mode documentation
- Added configuration examples for new features
- Enhanced troubleshooting section
- Added usage examples for proactive monitoring

---

## [1.0.0] - 2025-06-06

### 🎉 Initial Release
- **Core BrewHand Extension** - Production-ready AI development assistant

### 🧠 **AI Chat Integration**
- **@brewhand chat participant** with quality-focused responses
- **Context-aware conversations** that understand project structure
- **Budget-aware model selection** automatically choosing optimal AI models
- **Visual chat reminder** in status bar for consistent usage

### 🐚 **Shell Command System**
- **Automatic shell detection** (PowerShell, CMD, Bash, Zsh)
- **Command syntax validation** and correction before execution
- **Cross-platform command formatting** for different shell environments
- **Compilation error detection** with dependency blocking
- **Terminal monitoring** with real-time command validation

### 📊 **Budget & Usage Management**
- **Visual status bar tracking** with real-time budget indicators
- **Intelligent model selection** based on complexity and budget constraints
- **Usage analytics dashboard** with detailed cost breakdowns
- **Flexible budget strategies** (Conservative, Balanced, Aggressive)
- **Monthly usage reset** with customizable reset dates

### 🔍 **Code Quality & Analysis**
- **Import path resolution** with automatic error detection
- **Error parsing system** for compilation and runtime errors
- **Code complexity scoring** with recommendations
- **Architectural pattern suggestions** based on project analysis

### 🎯 **Quality-First Development**
- **Production-ready code generation** with comprehensive error handling
- **Architectural best practices** for performance, maintainability, security
- **Multi-language support** for JavaScript, TypeScript, Python, Java, C#, Go, Rust
- **Complexity analysis engine** that adapts AI responses to task difficulty

### 🔒 **Privacy & Security**
- **Local-first data storage** by default
- **Anonymized sensitive information** (file paths, project names)
- **Complete control** over data collection and sharing
- **Optional telemetry** with clear benefit explanations

### ⚙️ **Configuration System**
- **Comprehensive settings** for all features
- **Visual settings panel** with easy configuration
- **Feature toggles** for granular control
- **Usage dashboard** with detailed analytics

### 🛠️ **Command Suite**
- **BrewHand: Enhance Selected Code** - Improve code with production patterns
- **BrewHand: Generate Quality Code** - Create new code with error handling
- **BrewHand: Review Code Quality** - Analyze and suggest improvements
- **BrewHand: Show Usage Dashboard** - View detailed usage analytics
- **BrewHand: Detect Current Shell** - Display shell type and configuration
- **BrewHand: Format Command** - Format commands for current shell
- **BrewHand: Toggle Chat Reminder** - Enable/disable @brewhand reminders

### 📁 **File System Integration**
- **Proactive package.json validation** with auto-fix capabilities
- **JSON syntax validation** to prevent build failures
- **Import path verification** and correction suggestions
- **File save monitoring** for early error detection

### 🏗️ **Architecture & Integration**
- **Modular design** with separate managers for different concerns
- **Event-driven architecture** for responsive user experience
- **VS Code API integration** following best practices
- **Extensible plugin system** for future enhancements

---

## Version History Summary

- **v1.0.2** (Current) - Workspace cleanup, analysis tools, and quality assessment framework
- **v1.0.1** - Added always-active monitoring and proactive assistance
- **v1.0.0** - Initial release with core BrewHand functionality

## Upgrade Notes

### From v1.0.1 to v1.0.2
- **Workspace organization** improvements with better test structure
- **Analysis tools** added for measuring extension effectiveness
- **No functional changes** - all existing features work exactly the same
- **Clean project structure** for better development experience

### From v1.0.0 to v1.0.1
- New always-active mode is **disabled by default** to maintain current user experience
- Enable with `BrewHand: Toggle Always Active Mode` command or `"brewhand.alwaysActive": true` setting
- All existing functionality remains unchanged
- New features are additive and optional

## Feedback & Support

- **Issues & Bugs**: [GitHub Issues](https://github.com/JoshMcMillen/BrewHand/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/JoshMcMillen/BrewHand/discussions)
- **Community Support**: [GitHub Discussions](https://github.com/JoshMcMillen/BrewHand/discussions)

## Contributors

- **Josh McMillen** - Project Creator and Lead Developer
- **Community Contributors** - Feature suggestions and testing

---

🍺 **BrewHand**: Crafting Quality Code, One Request at a Time
