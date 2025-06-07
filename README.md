# BrewHand

> Enhances GitHub Copilot with "do it right the first time" philosophy

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/visual-studio-marketplace/v/your-publisher-name.brewhand)](https://marketplace.visualstudio.com/items?itemName=your-publisher-name.brewhand)

**BrewHand** is a VS Code extension that enhances GitHub Copilot with a focus on production-ready, high-quality code generation. It implements architectural best practices, comprehensive error handling, and quality-first development principles.

## ✨ Features

### 🎯 Quality-First Code Generation
- **Production-ready code**: No TODO comments, comprehensive error handling
- **Architectural focus**: Choose between performance, maintainability, security, or scalability
- **Multi-language support**: JavaScript, TypeScript, Python, Java, C#, Go, Rust

### 🤖 AI Chat Participant
- **@brewhand**: Dedicated chat participant for quality-focused development
- **Context-aware**: Understands your project structure and coding patterns
- **Best practices**: Suggests architectural improvements and optimizations

### 🔧 Powerful Commands
- **Enhance Selected Code** (`Ctrl+Shift+Q`): Improve code quality and architecture
- **Generate Quality Code** (`Ctrl+Shift+G`): Generate production-ready code from scratch
- **Review Code Quality**: Analyze and suggest improvements for existing code

### 📊 Usage Management
- **Budget tracking**: Monitor your GitHub Copilot usage with smart limits
- **Usage dashboard**: View detailed analytics and patterns
- **Flexible strategies**: Conservative, balanced, or aggressive budget management

### 🔒 Privacy & Telemetry
- **Local-first**: Optional telemetry stored locally by default
- **Anonymized data**: Sensitive information is automatically anonymized
- **Full control**: Complete control over data collection and sharing

## 🚀 Installation

### From VS Code Marketplace (Recommended)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "BrewHand"
4. Click **Install**

### From VSIX File
1. Download the latest `brewhand-1.0.0.vsix` file from [releases](https://github.com/your-username/brewhand/releases)
2. Open VS Code
3. Press `Ctrl+Shift+P` to open the command palette
4. Type "Extensions: Install from VSIX..."
5. Select the downloaded `.vsix` file

### Development Installation
```bash
# Clone the repository
git clone https://github.com/your-username/brewhand.git
cd brewhand

# Install dependencies
npm install

# Compile the extension
npm run compile

# Open in VS Code for development
code .

# Press F5 to launch Extension Development Host
```

## 🛠️ Quick Start

### 1. Enable BrewHand
After installation, BrewHand automatically activates when you open supported file types (JS, TS, Python, etc.).

### 2. Use the Chat Participant
```
@brewhand Create a user authentication system with JWT tokens
```

### 3. Enhance Existing Code
1. Select code in your editor
2. Right-click and choose "Enhance Selected Code"
3. Or use the keyboard shortcut `Ctrl+Shift+Q`

### 4. Generate New Code
1. Place cursor where you want new code
2. Press `Ctrl+Shift+G`
3. Describe what you want to generate

## 📋 Requirements

- **VS Code**: Version 1.93.0 or higher
- **GitHub Copilot**: Active subscription required
- **Node.js**: 16.x or higher (for development)

## ⚙️ Configuration

### Default Model Selection
```json
{
  "brewhand.defaultModel": "auto", // auto, claude-opus-4, gpt-4o, etc.
  "brewhand.strictMode": true,     // Enforce quality requirements
  "brewhand.includeTests": false   // Generate test suggestions
}
```

### Architectural Focus
```json
{
  "brewhand.architecturalFocus": "balanced" // performance, maintainability, security, scalability, balanced
}
```

### Budget Management
```json
{
  "brewhand.budgetLimit": 300,              // Monthly request limit
  "brewhand.budgetWarningThreshold": 0.8,   // Warning at 80%
  "brewhand.budgetStrategy": "balanced"     // conservative, balanced, aggressive
}
```

### Privacy Settings
```json
{
  "brewhand.telemetry.enabled": false,           // Enable telemetry
  "brewhand.telemetry.localStorageOnly": true,   // Keep data local
  "brewhand.telemetry.anonymizeData": true       // Anonymize sensitive data
}
```

## 🎮 Usage Examples

### Enhance JavaScript Code
```javascript
// Select this basic function
function calc(a, b) {
  return a + b;
}

// BrewHand transforms it to:
/**
 * Performs arithmetic addition with comprehensive error handling
 * @param {number} a - First operand
 * @param {number} b - Second operand
 * @returns {number} Sum of a and b
 * @throws {TypeError} When operands are not numbers
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

### Generate Python Class
**Prompt**: `@brewhand Create a user management class with validation`

**Result**: Production-ready class with proper error handling, logging, and documentation.

## 🔧 Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `BrewHand: Enhance Selected Code` | `Ctrl+Shift+Q` | Improve selected code quality |
| `BrewHand: Generate Quality Code` | `Ctrl+Shift+G` | Generate new production-ready code |
| `BrewHand: Review Code Quality` | - | Analyze and suggest improvements |
| `BrewHand: Show Usage Dashboard` | - | View usage analytics |
| `BrewHand: Export Usage Data` | - | Export usage data to JSON |

## 📊 Usage Dashboard

Access detailed analytics about your BrewHand usage:
- **Monthly usage**: Track requests and costs
- **Model distribution**: See which AI models you use most
- **Quality metrics**: Monitor code improvement statistics
- **Budget status**: Real-time budget tracking

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
git clone https://github.com/your-username/brewhand.git
cd brewhand
npm install
npm run compile
```

### Running Tests
```bash
npm test
```

## 📚 Documentation

- [Extension Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Configuration Guide](docs/configuration.md)
- [Troubleshooting](docs/troubleshooting.md)

## 🐛 Troubleshooting

### Common Issues

**BrewHand not activating**
- Ensure you have GitHub Copilot installed and active
- Check if you're working with supported file types

**Chat participant not appearing**
- Restart VS Code
- Check that the extension is enabled in Extensions view

**Budget tracking not working**
- Verify your GitHub Copilot subscription is active
- Check BrewHand settings for correct budget configuration

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- GitHub Copilot team for the amazing AI capabilities
- VS Code team for the excellent extension API
- Open source community for inspiration and feedback

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/brewhand/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/brewhand/discussions)
- **Email**: support@brewhand.dev

---

**Made with ❤️ for developers who care about code quality**
