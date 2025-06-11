# BrewHand Developer Documentation

> Internal documentation for BrewHand extension development and architecture

## 🏗️ Project Structure

```
BrewHand/
├── src/                          # Source code directory
│   ├── brewhand-extension.ts     # Main extension entry point
│   ├── aiResponseEnhancer.ts     # Enhanced AI response prevention system
│   ├── budget-manager.ts         # Budget tracking and model selection
│   ├── code-enhancer.ts         # Code quality enhancement engine
│   ├── complexity-analyzer.ts    # Task complexity evaluation
│   ├── shell-detector.ts        # Cross-platform shell detection
│   ├── shell-validator.ts       # Shell command validation and correction
│   ├── telemetry.ts             # Privacy-first telemetry system
│   └── types.ts                 # TypeScript type definitions
├── package.json                 # Extension manifest and dependencies
├── tsconfig.json               # TypeScript configuration
├── webpack.config.js           # Build configuration
├── README.md                   # Marketplace documentation
├── CHANGELOG.md               # Version history and release notes
├── LICENSE                    # MIT License
└── .vscodeignore             # Files excluded from packaging
```

## 🔧 Development Setup

### Prerequisites
- Node.js 16.x or higher
- VS Code 1.93.0 or higher
- TypeScript 4.9 or higher

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/JoshMcMillen/BrewHand.git
cd BrewHand

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch
```

### Building and Testing
```bash
# Compile the extension
npm run compile

# Package the extension
npm run package

# Run tests
npm test
```

## 🏛️ Architecture Overview

### Core Components

#### 1. **Main Extension (`brewhand-extension.ts`)**
- Extension activation and lifecycle management
- VS Code API integration
- Command registration and handling
- Status bar management
- Chat participant registration

#### 2. **AI Response Enhancer (`aiResponseEnhancer.ts`)**
- System prompt injection for shell-aware AI responses
- Proactive command syntax prevention
- Post-generation validation and correction
- Educational tip generation
- Shell-specific context management

#### 3. **Budget Manager (`budget-manager.ts`)**
- Usage tracking and analytics
- Model selection based on complexity and budget
- Cost optimization algorithms
- Status bar indicators

#### 4. **Code Enhancer (`code-enhancer.ts`)**
- Production-ready code generation
- Architectural pattern application
- Error handling injection
- Documentation generation

#### 5. **Shell Detection & Validation**
- Cross-platform shell detection (`shell-detector.ts`)
- Command syntax validation (`shell-validator.ts`)
- Platform-specific formatting
- Real-time terminal monitoring

### Data Flow

```
User Input → Shell Detection → AI Enhancement → Response Generation → Validation → Output
     ↓              ↓              ↓                ↓               ↓         ↓
  Analysis →  Context →  Prompt →  Model →  Validation →  Correction
```

## 🛠️ Key Development Patterns

### 1. **Shell-Aware AI Enhancement**
```typescript
// System prompt injection pattern
createShellAwareSystemPrompt(originalPrompt: string): string {
    const shellContext = this.getShellContext();
    return `${shellContext}\n\nUser Request: ${originalPrompt}`;
}

// Proactive validation pattern
async enhanceAIResponse(prompt: string, stream: any): Promise<any> {
    const enhancedPrompt = this.createShellAwareSystemPrompt(prompt);
    const response = await this.generateResponse(enhancedPrompt, stream);
    return this.validateAndCorrectCommands(response);
}
```

### 2. **Quality-First Code Generation**
```typescript
// Complexity-based model selection
selectModel(complexity: ComplexityLevel, budget: BudgetInfo): ModelConfig {
    if (complexity === 'high' && budget.remaining > budget.threshold) {
        return { model: 'gpt-4', maxTokens: 4000 };
    }
    return { model: 'gpt-3.5-turbo', maxTokens: 2000 };
}

// Production-ready enhancement
enhanceCode(code: string): EnhancedCode {
    return {
        code: this.addErrorHandling(code),
        documentation: this.generateDocumentation(code),
        tests: this.generateTests(code),
        patterns: this.suggestPatterns(code)
    };
}
```

### 3. **Cross-Platform Shell Handling**
```typescript
// Shell detection pattern
detectShell(): ShellInfo {
    const platform = process.platform;
    const shell = process.env.SHELL || process.env.ComSpec;
    
    return {
        type: this.parseShellType(shell),
        platform,
        separator: this.getCommandSeparator(platform)
    };
}

// Command validation pattern
validateCommand(command: string, shell: ShellInfo): ValidationResult {
    const rules = this.getShellRules(shell.type);
    return this.applyValidationRules(command, rules);
}
```

## 📊 Configuration Management

### Extension Settings Schema
```typescript
interface BrewHandConfig {
    // AI Enhancement
    enhancedAIMode: boolean;
    preventIncorrectSyntax: boolean;
    autoCorrectCommands: boolean;
    includeEducationalTips: boolean;
    
    // Quality Settings
    defaultModel: 'auto' | 'gpt-4' | 'gpt-3.5-turbo';
    strictMode: boolean;
    includeTests: boolean;
    architecturalFocus: 'performance' | 'maintainability' | 'balanced';
    
    // Shell Settings
    shellDetection: 'auto' | 'powershell' | 'bash' | 'cmd';
    autoFixShellSyntax: boolean;
    blockOnCompileErrors: boolean;
    
    // Budget Management
    budgetLimit: number;
    budgetStrategy: 'conservative' | 'balanced' | 'aggressive';
    showUsageInStatusBar: boolean;
}
```

### Default Configuration
```json
{
    "brewhand.enhancedAIMode": true,
    "brewhand.preventIncorrectSyntax": true,
    "brewhand.autoCorrectCommands": true,
    "brewhand.includeEducationalTips": true,
    "brewhand.defaultModel": "auto",
    "brewhand.strictMode": true,
    "brewhand.includeTests": false,
    "brewhand.architecturalFocus": "balanced",
    "brewhand.shellDetection": "auto",
    "brewhand.autoFixShellSyntax": true,
    "brewhand.blockOnCompileErrors": true,
    "brewhand.budgetLimit": 300,
    "brewhand.budgetStrategy": "balanced",
    "brewhand.showUsageInStatusBar": true
}
```

## 🧪 Testing Strategy

### Test Categories

#### 1. **Unit Tests**
- Individual component functionality
- Shell detection accuracy
- Command validation logic
- Budget calculation algorithms

#### 2. **Integration Tests**
- AI response enhancement flow
- VS Code API integration
- Cross-platform compatibility
- Error handling scenarios

#### 3. **End-to-End Tests**
- Complete user workflows
- Chat participant interactions
- Command execution validation
- Budget tracking accuracy

### Test Files Structure
```
tests/
├── unit/
│   ├── shell-detector.test.ts
│   ├── shell-validator.test.ts
│   ├── budget-manager.test.ts
│   └── code-enhancer.test.ts
├── integration/
│   ├── ai-enhancement.test.ts
│   ├── vscode-integration.test.ts
│   └── cross-platform.test.ts
└── e2e/
    ├── user-workflows.test.ts
    └── chat-participant.test.ts
```

## 🚀 Release Process

### Version Numbering
- **Major (X.0.0)**: Breaking changes, major feature additions
- **Minor (0.X.0)**: New features, backward compatible
- **Patch (0.0.X)**: Bug fixes, minor improvements

### Release Checklist
1. **Pre-Release**
   - [ ] Update version in `package.json`
   - [ ] Update `CHANGELOG.md`
   - [ ] Run full test suite
   - [ ] Build and test VSIX package
   - [ ] Update documentation

2. **Release**
   - [ ] Create Git tag
   - [ ] Build production VSIX
   - [ ] Publish to VS Code Marketplace
   - [ ] Create GitHub release
   - [ ] Update documentation links

3. **Post-Release**
   - [ ] Monitor for issues
   - [ ] Update community announcements
   - [ ] Plan next release features

### Build Commands
```bash
# Development build
npm run compile

# Production build
npm run build

# Package for distribution
npm run package

# Publish to marketplace
npm run publish
```

## 🔒 Security Considerations

### Data Privacy
- Local-first storage by default
- Anonymized telemetry collection
- No sensitive data in logs
- User control over data sharing

### Code Security
- Input validation for all user inputs
- Safe shell command execution
- Dependency vulnerability scanning
- Regular security audits

### AI Safety
- Content filtering for AI responses
- Rate limiting for API calls
- Budget controls for cost management
- Safe prompt injection prevention

## 🤝 Contributing Guidelines

### Code Style
- TypeScript with strict mode
- ESLint configuration enforcement
- Prettier formatting
- Comprehensive JSDoc comments

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pull Request Process
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Update documentation
5. Submit pull request
6. Address code review feedback

## 📚 References

### VS Code Extension APIs
- [Extension API](https://code.visualstudio.com/api/references/vscode-api)
- [Language Model API](https://code.visualstudio.com/api/extension-guides/language-model)
- [Chat Extensions](https://code.visualstudio.com/api/extension-guides/chat)

### Development Resources
- [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Testing Extensions](https://code.visualstudio.com/api/working-with-extensions/testing-extension)

---

**For questions about development, please open an issue on GitHub or reach out to the maintainers.**
