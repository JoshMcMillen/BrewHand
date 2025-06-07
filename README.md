# BrewHand

> Production-Ready AI Development Assistant for VS Code

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/visual-studio-marketplace/v/your-publisher-name.brewhand)](https://marketplace.visualstudio.com/items?itemName=your-publisher-name.brewhand)

**BrewHand** is a comprehensive VS Code extension that enhances AI-powered development with production-ready code generation, intelligent shell command validation, budget management, and quality-first development principles.

## ✨ Key Features

### 🎯 **Quality-First AI Development**
- **Production-ready code generation** with comprehensive error handling
- **Architectural best practices** for performance, maintainability, security, and scalability
- **Multi-language support** for JavaScript, TypeScript, Python, Java, C#, Go, Rust, and more
- **Complexity analysis engine** that adapts AI responses to task difficulty

### 🐚 **Intelligent Shell Command System**
- **Automatic shell detection** (PowerShell, CMD, Bash, Zsh)
- **Command syntax validation** and correction before execution
- **Cross-platform command formatting** for different shell environments
- **Compilation error detection** with dependency blocking
- **Terminal monitoring** with real-time command validation

### 🧠 **Smart AI Chat Integration**
- **@brewhand chat participant** with quality-focused responses
- **Context-aware conversations** that understand your project structure
- **Budget-aware model selection** automatically choosing optimal AI models
- **Visual chat reminder** in status bar for consistent @brewhand usage
- **Follow-up suggestions** for error handling, testing, and architecture review

### 📊 **Advanced Budget & Usage Management**
- **Visual status bar tracking** with real-time budget indicators
- **Intelligent model selection** based on complexity and budget constraints
- **Usage analytics dashboard** with detailed cost breakdowns
- **Flexible budget strategies** (Conservative, Balanced, Aggressive)
- **Monthly usage reset** with customizable reset dates

### 🔍 **Code Quality & Analysis Tools**
- **Import path resolution** with automatic error detection and suggestions
- **Error parsing system** for compilation and runtime errors
- **Code complexity scoring** with recommendations for simplification
- **Architectural pattern suggestions** based on project analysis

### 🔒 **Privacy-First Telemetry**
- **Local-first data storage** by default
- **Anonymized sensitive information** (file paths, project names)
- **Complete control** over data collection and sharing
- **Optional telemetry** with clear benefit explanations

## 🚀 Installation

### From VS Code Marketplace (Recommended)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "BrewHand"
4. Click **Install**

### From VSIX File
1. Download the latest `brewhand-1.0.0.vsix` file
2. Open VS Code
3. Press `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
4. Select the downloaded `.vsix` file

## 🛠️ Quick Start Guide

### 1. **Activate BrewHand**
BrewHand automatically activates when you open supported file types. Look for the BrewHand budget indicator in your status bar.

### 2. **Enable Chat Reminders**
Click the `⚡ @brewhand Reminder` button in the status bar or use the command:
```
BrewHand: Toggle Chat Reminder
```

### 3. **Use the AI Chat Participant**
```
@brewhand Create a user authentication system with JWT, input validation, and error handling
```

### 4. **Enhance Existing Code**
1. Select code in your editor
2. Right-click → "BrewHand: Enhance Selected Code"
3. Or use keyboard shortcut `Ctrl+Shift+Q`

### 5. **Validate Shell Commands**
BrewHand automatically detects and validates shell commands in your AI conversations, providing syntax corrections and cross-platform compatibility.

## 📋 System Requirements

- **VS Code**: Version 1.93.0 or higher
- **AI Language Model**: GitHub Copilot, Claude, or compatible language model
- **Operating Systems**: Windows, macOS, Linux
- **Node.js**: 16.x or higher (development only)

## ⚙️ Configuration

### **Core Settings**
```json
{
  "brewhand.defaultModel": "auto",
  "brewhand.strictMode": true,
  "brewhand.includeTests": false,
  "brewhand.architecturalFocus": "balanced"
}
```

### **Budget Management**
```json
{
  "brewhand.budgetLimit": 300,
  "brewhand.budgetWarningThreshold": 0.8,
  "brewhand.budgetStrategy": "balanced",
  "brewhand.showUsageInStatusBar": true
}
```

### **Shell Command System**
```json
{
  "brewhand.shellDetection": "auto",
  "brewhand.autoFixShellSyntax": true,
  "brewhand.blockOnCompileErrors": true,
  "brewhand.showCommandCorrections": true
}
```

### **Chat Integration**
```json
{
  "brewhand.autoModeEnabled": false
}
```

### **Privacy & Telemetry**
```json
{
  "brewhand.telemetry.enabled": false,
  "brewhand.telemetry.localStorageOnly": true,
  "brewhand.telemetry.anonymizeData": true
}
```

### **Import Path Resolution**
```json
{
  "brewhand.verifyImportPaths": true
}
```

## 🎮 Usage Examples

### **Enhanced JavaScript Code Generation**
**Before**: Basic function
```javascript
function calc(a, b) {
  return a + b;
}
```

**After**: BrewHand enhancement
```javascript
/**
 * Performs arithmetic addition with comprehensive error handling
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @returns {number} Sum of a and b
 * @throws {TypeError} When operands are not numbers
 * @throws {RangeError} When operands are not finite
 */
function calculateSum(a, b) {
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new TypeError('Both operands must be numbers');
  }
  
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new RangeError('Operands must be finite numbers');
  }
  
  return a + b;
}
```

### **Shell Command Validation**
**Input**: `@brewhand How do I install packages and run tests?`

**BrewHand Response**: Detects shell commands and provides validated, cross-platform solutions:

**Windows (PowerShell)**:
```powershell
npm install; npm test
```

**Unix/macOS (Bash)**:
```bash
npm install && npm test
```

### **Budget-Aware Model Selection**
BrewHand automatically selects the most appropriate AI model based on:
- Task complexity (analyzed in real-time)
- Remaining budget
- Your configured strategy
- Model capabilities and costs

## 🔧 Complete Command Reference

| Command | Shortcut | Description |
|---------|----------|-------------|
| **BrewHand: Enhance Selected Code** | `Ctrl+Shift+Q` | Improve selected code with production-ready patterns |
| **BrewHand: Generate Quality Code** | `Ctrl+Shift+G` | Generate new code with comprehensive error handling |
| **BrewHand: Review Code Quality** | - | Analyze code and suggest architectural improvements |
| **BrewHand: Show Usage Dashboard** | - | View detailed usage analytics and budget status |
| **BrewHand: Export Usage Data** | - | Export usage data to JSON format |
| **BrewHand: Show Telemetry Summary** | - | View collected telemetry data summary |
| **BrewHand: Clear Telemetry Data** | - | Clear all locally stored telemetry data |
| **BrewHand: Reset Monthly Usage** | - | Reset monthly usage tracking |
| **BrewHand: Detect Current Shell** | - | Display detected shell type and separator |
| **BrewHand: Format Command for Current Shell** | - | Format shell commands for current environment |
| **BrewHand: Toggle Chat Reminder** | - | Toggle status bar reminder to use @brewhand |

## 📊 Usage Dashboard

The comprehensive dashboard provides:

### **Budget Overview**
- Visual progress bar showing monthly usage
- Remaining requests counter
- Days until monthly reset
- Strategy-specific recommendations

### **Model Usage Analytics**
- Distribution of AI models used
- Cost breakdown by model type
- Usage patterns over time
- Efficiency recommendations

### **Quality Metrics**
- Code enhancement statistics
- Error prevention tracking
- Complexity analysis results
- Architectural improvement suggestions

### **Shell Command Statistics**
- Command validation success rate
- Cross-platform compatibility reports
- Error prevention metrics
- Most used shell commands

## 🧩 Architecture & Integration

### **Complexity Analysis Engine**
BrewHand analyzes each request across multiple dimensions:
- **Technical complexity**: Code patterns, algorithms, architecture
- **Context requirements**: Project size, dependencies, integration needs
- **Quality demands**: Error handling, testing, documentation needs
- **Performance considerations**: Optimization requirements, scalability needs

### **Shell Detection System**
Advanced shell environment detection supporting:
- **Windows**: PowerShell Core, Windows PowerShell, Command Prompt
- **macOS/Linux**: Bash, Zsh, Fish, and other POSIX shells
- **Cross-platform**: Automatic command syntax translation
- **Validation**: Pre-execution syntax checking and error prevention

### **Budget Management Strategy**
Intelligent model selection based on:
- **Conservative**: Prioritizes cost savings, uses premium models sparingly
- **Balanced**: Optimal cost-performance ratio for most scenarios
- **Aggressive**: Uses best available models regardless of cost

## 🔍 Advanced Features

### **Import Path Resolution**
- Automatically detects and suggests corrections for import path errors
- Supports relative and absolute path resolution
- Cross-platform path compatibility checking
- Integration with popular bundlers and module systems

### **Terminal Monitoring**
- Real-time command execution tracking
- Error detection and parsing
- Compilation failure prevention
- Dependency blocking for failed builds

### **Error Parsing System**
- Intelligent error message analysis
- Contextual suggestions for common errors
- Integration with popular frameworks and tools
- Multi-language error pattern recognition

## 🔒 Privacy & Security

### **Data Collection Principles**
- **Minimal Collection**: Only collect data necessary for functionality
- **Local Storage**: All data stored locally by default
- **User Control**: Complete control over what data is collected
- **Transparency**: Clear explanations of data usage

### **Anonymization Features**
- Automatic removal of sensitive file paths
- Project name anonymization
- User identifier hashing
- IP address exclusion

### **Security Measures**
- No external data transmission by default
- Encrypted local storage for sensitive data
- Regular security audits and updates
- Compliance with privacy regulations

## 🐛 Troubleshooting

### **Common Issues**

**BrewHand not activating**
- Ensure you have a compatible AI language model (GitHub Copilot, etc.)
- Check if you're working with supported file types
- Restart VS Code and check the Output panel for errors

**Chat participant (@brewhand) not appearing**
- Restart VS Code
- Verify the extension is enabled in Extensions view
- Check that your AI language model extension is active

**Shell command validation not working**
- Verify `brewhand.shellDetection` is set to "auto"
- Check if `brewhand.autoFixShellSyntax` is enabled
- Ensure you're using supported shell environments

**Budget tracking showing incorrect data**
- Verify your AI language model subscription is active
- Check BrewHand settings for correct budget configuration
- Use "BrewHand: Reset Monthly Usage" if data is corrupted

**Status bar not showing**
- Enable `brewhand.showUsageInStatusBar` in settings
- Restart VS Code if the status bar item doesn't appear
- Check for conflicting extensions that might hide status bar items

### **Performance Issues**

**Slow response times**
- Check your internet connection
- Verify AI language model service status
- Consider switching to a lighter budget strategy

**High memory usage**
- Clear telemetry data if local storage is large
- Restart VS Code periodically
- Check for memory leaks in Output panel

## 📚 Documentation & Resources

- [Extension Architecture Guide](docs/architecture.md)
- [API Reference Documentation](docs/api.md)
- [Configuration Best Practices](docs/configuration.md)
- [Shell Integration Guide](docs/shell-integration.md)
- [Budget Management Strategies](docs/budget-strategies.md)

## 🤝 Contributing

We welcome contributions from the developer community!

### **Development Setup**
```bash
git clone https://github.com/your-username/brewhand.git
cd brewhand
npm install
npm run compile
```

### **Testing**
```bash
npm test                    # Run unit tests
npm run test:integration    # Run integration tests
npm run lint               # Run linting checks
```

### **Building**
```bash
npm run vscode:prepublish  # Prepare for publishing
npm run package           # Create VSIX package
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **AI Language Model Providers** for powering the intelligence behind BrewHand
- **VS Code Team** for the excellent extension API and development tools
- **Open Source Community** for inspiration, feedback, and contributions
- **Beta Testers** who helped refine and improve BrewHand's functionality

## 📞 Support & Community

- **Issues & Bugs**: [GitHub Issues](https://github.com/your-username/brewhand/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/your-username/brewhand/discussions)
- **Community Support**: [Discord Server](https://discord.gg/brewhand)
- **Email Support**: support@brewhand.dev

---

**🍺 BrewHand: Crafting Quality Code, One Request at a Time**

*Made with ❤️ for developers who believe in doing it right the first time*
