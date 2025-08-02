# BrewHand

> Production-Ready AI Development Assistant for VS Code

[![Version](https://img.shields.io/badge/Version-1.0.3-blue.svg)](https://marketplace.visualstudio.com/items?itemName=BrewCode.brewhand)
[![Ko-fi](https://img.shields.io/badge/Support%20me%20on-Ko--fi-FF5E5B.svg)](https://ko-fi.com/joshmc)

> 💡 *Tips are appreciated to support ongoing development and new features!*

**BrewHand** is a comprehensive VS Code extension that enhances AI-powered development with production-ready code generation, intelligent shell command validation, and quality-first development principles.

## 🆕 What's New in v1.0.3

### **🔧 Simplified Settings** 
- **Unified Iterative Mode** - Consolidated continuous and iterative modes into a single, intuitive setting
- **Streamlined Interface** - Removed complex budget and model selection UI for better user experience  
- **Beer Menu** - Clean, friendly interface accessible from the status bar

### **🍺 Enhanced User Experience**
- **Beer Menu Status Bar** - Click the 🍺 Beer Menu in the status bar for quick access to features
- **Simplified Configuration** - Focus on core functionality with fewer confusing options
- **Better Tooltips** - Clear guidance on what each feature does

[View Full Changelog](CHANGELOG.md)

## ✨ Key Features

### 🎯 **Custom Instructions for Copilot Agent Mode** ⭐ **NEW**
- **Automatic custom instructions generation** that enhances GitHub Copilot's agent mode (inline suggestions)
- **Shell-aware code generation** with platform-specific command syntax
- **Production-ready standards** built into every Copilot suggestion
- **Quality-first development** with comprehensive error handling and best practices

### 🐚 **Intelligent Shell Command System**
- **Automatic shell detection** (PowerShell, CMD, Bash, Zsh) with platform-specific formatting
- **Command syntax validation** and correction before execution
- **Cross-platform compatibility** ensuring commands work on your specific environment
- **Error prevention** with proactive syntax checking and educational tips

### 💬 **Simplified AI Chat Integration**
- **@brewhand chat participant** for quick shell command validation
- **Shell-aware responses** with command syntax checking
- **Educational tips** and best practices for your specific shell environment

### 🔍 **Code Quality & Analysis Tools**  
- **Import path resolution** with automatic error detection and intelligent suggestions
- **Error parsing system** for compilation and runtime errors with actionable fixes
- **Code complexity scoring** with recommendations for simplification and optimization
- **Architectural pattern suggestions** based on comprehensive project analysis

### 🔒 **Privacy-First Design**
- **Local-first data storage** with no external data transmission by default
- **Anonymized information handling** for file paths and sensitive project details
- **Complete user control** over data collection and sharing preferences
- **Transparent telemetry** with clear explanations of benefits and opt-in choices

## 🚀 Installation

### From VS Code Marketplace (Recommended)
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "BrewHand"
4. Click **Install**

### From VSIX File
1. Download the latest `brewhand-1.0.3.vsix` file
2. Open VS Code
3. Press `Ctrl+Shift+P` → "Extensions: Install from VSIX..."
4. Select the downloaded `.vsix` file

## 🔍 Verifying Installation

### Quick Check
```powershell
code --list-extensions | findstr brewcode
```
Should return: `brewcode.brewhand`

### Test Core Functionality
1. **Open VS Code Chat** (`Ctrl+Shift+I`) and try `@brewhand help`
2. **Check Beer Menu** - Look for the 🍺 icon in your status bar
3. **Command Palette** - Press `Ctrl+Shift+P` and search "BrewHand" to see available commands

## 🚀 Getting Started

### 🎯 **Enable Custom Instructions (Recommended)**
1. **Open Beer Menu** - Click the 🍺 icon in your status bar
2. **Enable Custom Instructions** - Toggle the "Custom Instructions" feature
3. **Enjoy Enhanced Copilot** - All Copilot suggestions now use BrewHand quality standards!

### Using @brewhand in Chat
1. Open VS Code Chat panel (`Ctrl+Shift+I`)
2. Type `@brewhand` followed by your shell command question
3. Get validated, platform-specific command syntax
4. Learn best practices for your shell environment

### Key Features to Try
- **Custom Instructions**: Enable for enhanced Copilot agent mode suggestions
- **Shell Commands**: Ask @brewhand for platform-specific terminal commands
- **Command Validation**: Use `Ctrl+Shift+Q` to validate selected commands
- **Shell Reference**: Get syntax help for your current shell environment

## 🎛️ Available Commands

BrewHand provides 8 focused commands accessible via Command Palette (`Ctrl+Shift+P`):

### Core Shell Commands
- **BrewHand: Detect Current Shell** - Identify your shell environment
- **BrewHand: Validate Command Syntax** - Check shell command syntax (`Ctrl+Shift+Q`)
- **BrewHand: Show Shell Reference** - Display shell syntax reference guide

### Custom Instructions Management
- **BrewHand: Create Custom Instructions** - Generate custom instructions for Copilot agent mode
- **BrewHand: Update Custom Instructions** - Refresh instructions with current settings  
- **BrewHand: View Custom Instructions** - Open and edit the generated instructions file
- **BrewHand: Remove Custom Instructions** - Remove custom instructions from workspace

### Interface & Settings
- **BrewHand: Open Features Panel** - Access the Beer Menu features panel
- **BrewHand: Open Settings** - Configure BrewHand behavior and preferences

## ⚙️ Configuration

BrewHand works great with default settings, but you can customize behavior through:

### Key Settings
- **Custom Instructions** - Enable enhanced Copilot agent mode (recommended)
- **Strict Mode** - Enforce production-ready code standards (default: enabled)
- **Architectural Focus** - Prioritize performance, maintainability, security, or balanced approach
- **Shell Detection** - Automatic or manual shell type selection
- **Auto-Update Instructions** - Automatically refresh custom instructions when settings change

### Access Settings
1. Click **🍺 Beer Menu** in status bar
2. Open **Features** panel to toggle key features
3. Open **Quick Settings** panel to modify configuration values
4. Use Command Palette for additional BrewHand commands

## 🎯 Best Practices

### For New Users
- Start with `@brewhand help` to learn available features
- Enable **Iterative Support** for multi-step development workflows
- Use the Beer Menu to familiarize yourself with available features

### For Development Workflows
- Use `@brewhand` for shell commands to ensure platform compatibility
- Ask for architectural advice before starting complex features
- Request code reviews and suggestions for optimization

### For Team Adoption
- Share BrewHand commands and workflows with your team
- Use consistent architectural focus settings across projects
- Leverage educational tips to improve team coding practices

## 🤝 Support & Feedback

- **Issues & Feature Requests**: [GitHub Repository](https://github.com/BrewCode/brewhand)
- **Support the Project**: [Ko-fi](https://ko-fi.com/joshmc)
- **Documentation**: Check the Beer Menu for built-in help and references

---

**Made with ❤️ for developers who value quality and reliability**
