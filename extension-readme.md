# Quality-First Copilot

A VS Code extension that enhances GitHub Copilot with a "do it right the first time" philosophy, eliminating the "make it work then make it better" cycle.

## 🎯 Philosophy

Instead of generating quick-and-dirty code that requires refactoring, this extension focuses on:

- **Production-ready code from the start**
- **Comprehensive error handling and input validation**
- **Proper architectural patterns and design principles**
- **Self-documenting, maintainable code**
- **Performance, security, and scalability considerations upfront**
- **No TODO comments or placeholder implementations**

## ✨ Features

### 💎 **Enhanced Ruby Support**

Special focus on Ruby development with **Tier 2 - Good Support (80-85% quality)** using premium request models strategically:

**Smart Budget Management for Ruby:**
- **High-value tasks**: Uses Claude Opus 4 (~15 requests) for complex architecture
- **Standard tasks**: Uses Claude Sonnet 4 (~5 requests) for everyday Rails work  
- **Simple tasks**: Uses Claude 3.5 Sonnet (included) to preserve premium budget
- **Budget-aware fallback**: Automatically optimizes quality vs cost

**Latest Model Benefits for Ruby:**
- **Claude Sonnet 4**: Significant upgrade for Ruby idioms and Rails patterns
- **Hybrid reasoning**: Better architectural decisions for complex Rails applications  
- **Enhanced metaprogramming**: Improved understanding of Ruby's dynamic features
- **Performance insights**: Better optimization recommendations

**Rails Ecosystem Mastery:**
- Automatic detection of Gemfile, Rails config, and gems with latest context understanding
- MVC patterns and RESTful conventions with improved architectural reasoning
- Background job patterns (Sidekiq, Resque) with better concurrency handling
- Authentication patterns (Devise, custom) with enhanced security recommendations

**Example Ruby Enhancement with Smart Model Selection:**
```ruby
# High-value architecture task → Claude Opus 4 (15 premium requests)
@quality-first Create a comprehensive Rails service object architecture for payment processing

# Standard Rails task → Claude Sonnet 4 (5 premium requests)  
@quality-first Generate a Rails controller with proper error handling and validation

# Simple task → Claude 3.5 Sonnet (included, preserves premium budget)
@quality-first Add basic validation to this Rails model
```

**Quality vs Budget Optimization:**
- **Previous approach**: Always use highest-quality model regardless of cost
- **Smart approach**: Match model capability to task complexity and budget
- **Result**: More premium requests available for truly complex tasks
- **Outcome**: Better overall productivity within budget constraints

### 🤖 Quality-First Chat Participant

Use `@quality-first` in Copilot Chat for production-ready code generation:

```
@quality-first Create a rate-limited HTTP client with retry logic and comprehensive error handling
```

**What you get:**
- Complete implementations with proper error boundaries
- Input validation for all parameters
- Typescript interfaces and proper typing
- Performance optimizations
- Security considerations
- Architectural decision explanations

### 🔧 Code Enhancement Tools

**Enhance Selected Code** (`Ctrl+Shift+Q` / `Cmd+Shift+Q`)
- Select any code block and transform it to production quality
- Adds error handling, input validation, and optimizations
- Replaces TODO comments with actual implementations

**Generate Quality Code** (`Ctrl+Shift+G` / `Cmd+Shift+G`)
- Quick command to generate new code with quality-first prompts
- Automatically routes to the best LLM for your specific task

**Code Quality Review**
- Analyzes your current file for quality issues
- Identifies technical debt and improvement opportunities
- Provides specific suggestions for each issue

### 🧠 Intelligent Model Selection with Premium Request Management

The extension automatically selects the optimal LLM based on your task **and manages your premium request budget**. All users have access to the same models, but premium models consume premium requests from your monthly allowance:

**GitHub Copilot Plans:**
- **Copilot Free**: 50 premium requests/month
- **Copilot Pro**: $10/month, 300 premium requests/month + unlimited standard completions
- **Copilot Pro+**: $39/month, 1500 premium requests/month + unlimited standard completions  
- **Copilot Business**: $19/user/month, 300 premium requests/user/month
- **Copilot Enterprise**: $39/user/month, 1000 premium requests/user/month

**Premium Request Models (consume from monthly allowance):**
- **Claude Opus 4**: World's best coding model (~15-20 requests per query)
- **OpenAI o3**: Most capable reasoning (~20 requests per query)
- **GPT-4.5**: Improved reasoning (~12 requests per query)
- **Claude 3.7 Sonnet**: Hybrid reasoning (~8 requests per query)
- **Gemini 2.5 Pro**: Advanced reasoning (~8 requests per query)
- **Claude Sonnet 4**: Excellent coding (~5 requests per query)
- **GPT-4.1**: Balanced performance (~3 requests per query)
- **o3-mini/o1-mini**: Efficient reasoning (~2-3 requests per query)
- **o4-mini**: Most efficient (~1 request per query)

**Standard Models (included in all plans):**
- **Claude 3.5 Sonnet**: Fast and efficient for everyday tasks
- **GPT-4o**: Multimodal general purpose with good reasoning
- **Gemini 1.5 Pro**: Multimodal understanding and large context

**Smart Budget Management:**
1. **Prioritizes model quality** for your specific task and language
2. **Considers request multipliers** to maximize your monthly allowance
3. **Falls back to standard models** when premium budget is low
4. **Shows request cost** for transparency (`🚀 Using Claude Sonnet 4 (5 premium requests)`)
5. **Tracks usage** to help you manage your monthly allowance

**Example Budget-Aware Selection:**
```
Early in month + Complex Ruby task:
🚀 Using Claude Opus 4 (15 premium requests) - World-class quality

Mid-month + Standard task:
🚀 Using Claude Sonnet 4 (5 premium requests) - Excellent quality

Low budget + Simple task:
✨ Using Claude 3.5 Sonnet (included) - Good quality, no premium cost

Budget exhausted:
✨ Using Claude 3.5 Sonnet (included) - Standard model, saves premium requests
```

**Quality vs Cost Optimization:**
- **High-value tasks**: Uses premium models (architecture, complex debugging)
- **Standard tasks**: Balances quality and cost efficiently
- **Simple tasks**: Uses included models to preserve premium budget
- **Budget awareness**: Automatically adjusts strategy based on remaining allowance

### 🎛️ Agent Mode Integration

Contributes a `quality-enhancer` tool to Copilot's agent mode that:
- Automatically applies production-ready patterns
- Enhances generated code with quality considerations
- Provides confirmation dialogs for major changes

## 🚀 Getting Started

### Prerequisites

- VS Code 1.93.0 or higher
- GitHub Copilot subscription
- One of the supported language models enabled

### Installation

1. **From VS Code Marketplace** (when published):
   ```
   ext install your-publisher.quality-first-copilot
   ```

2. **From Source**:
   ```bash
   git clone https://github.com/your-username/quality-first-copilot
   cd quality-first-copilot
   npm install
   npm run compile
   # Then install the .vsix file in VS Code
   ```

### Configuration

Open VS Code settings and configure:

```json
{
  "quality-first.defaultModel": "claude-3-5-sonnet",
  "quality-first.strictMode": true,
  "quality-first.includeTests": false,
  "quality-first.architecturalFocus": "balanced"
}
```

## 📋 Usage Examples

### Basic Code Generation

**Input:**
```
@quality-first Create a function to validate email addresses
```

**Output:**
```typescript
interface EmailValidationResult {
  isValid: boolean;
  errors: string[];
  normalizedEmail?: string;
}

interface EmailValidationOptions {
  allowInternational?: boolean;
  requireTLD?: boolean;
  maxLength?: number;
}

/**
 * Validates an email address with comprehensive error reporting
 * @param email - The email address to validate
 * @param options - Validation options
 * @returns Validation result with detailed feedback
 */
export function validateEmail(
  email: string,
  options: EmailValidationOptions = {}
): EmailValidationResult {
  const errors: string[] = [];
  const {
    allowInternational = true,
    requireTLD = true,
    maxLength = 254
  } = options;

  // Input validation
  if (typeof email !== 'string') {
    return {
      isValid: false,
      errors: ['Email must be a string']
    };
  }

  if (!email.trim()) {
    return {
      isValid: false,
      errors: ['Email cannot be empty']
    };
  }

  // Length validation (RFC 5321)
  if (email.length > maxLength) {
    errors.push(`Email exceeds maximum length of ${maxLength} characters`);
  }

  // Normalize email
  const normalizedEmail = email.trim().toLowerCase();

  // Basic format validation
  const emailRegex = allowInternational 
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/u
    : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(normalizedEmail)) {
    errors.push('Invalid email format');
  }

  // Additional validations
  const [localPart, domain] = normalizedEmail.split('@');
  
  if (localPart && localPart.length > 64) {
    errors.push('Local part exceeds 64 characters');
  }

  if (domain && requireTLD && !domain.includes('.')) {
    errors.push('Email must include a top-level domain');
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedEmail: errors.length === 0 ? normalizedEmail : undefined
  };
}
```

### Code Enhancement

**Before:**
```javascript
function fetchUser(id) {
  return fetch(`/api/users/${id}`).then(r => r.json());
}
```

**After Enhancement:**
```typescript
interface User {
  id: string;
  name: string;
  email: string;
}

interface FetchUserOptions {
  timeout?: number;
  retries?: number;
  signal?: AbortSignal;
}

class UserFetchError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly userId?: string
  ) {
    super(message);
    this.name = 'UserFetchError';
  }
}

/**
 * Fetches user data with comprehensive error handling and retry logic
 * @param id - User ID to fetch
 * @param options - Fetch configuration options
 * @returns Promise resolving to user data
 * @throws UserFetchError for various failure scenarios
 */
export async function fetchUser(
  id: string,
  options: FetchUserOptions = {}
): Promise<User> {
  const { timeout = 5000, retries = 3, signal } = options;

  // Input validation
  if (!id || typeof id !== 'string') {
    throw new UserFetchError('User ID must be a non-empty string', undefined, id);
  }

  // Sanitize ID to prevent injection
  const sanitizedId = encodeURIComponent(id.trim());
  
  let lastError: Error;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Combine signals if provided
      const combinedSignal = signal 
        ? AbortSignal.any([signal, controller.signal])
        : controller.signal;

      const response = await fetch(`/api/users/${sanitizedId}`, {
        signal: combinedSignal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new UserFetchError(
          `Failed to fetch user: ${response.statusText}`,
          response.status,
          id
        );
      }

      const userData = await response.json();
      
      // Validate response structure
      if (!userData || typeof userData !== 'object') {
        throw new UserFetchError('Invalid user data received', response.status, id);
      }

      return userData as User;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on certain errors
      if (error instanceof UserFetchError && error.statusCode === 404) {
        throw error;
      }

      if (attempt === retries) {
        break;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }

  throw new UserFetchError(
    `Failed to fetch user after ${retries + 1} attempts: ${lastError.message}`,
    undefined,
    id
  );
}
```

## 🌍 Language Support & Limitations

### **Language Support Tiers**

The extension works with any programming language, but quality varies significantly based on LLM training data availability:

#### **Tier 1: Excellent Support (90-95%+ quality with latest models)**
- **Python** - World-class patterns with Claude Opus 4, comprehensive architectural support
- **JavaScript/TypeScript** - Exceptional web patterns, modern framework support  
- **Java** - Enterprise-grade patterns, comprehensive Spring/JakartaEE support
- **C#** - Microsoft ecosystem excellence, .NET patterns with GPT-4.5

#### **Tier 2: Good Support (80-90% quality with latest models)**  
- **Ruby** - Rails ecosystem mastery, comprehensive patterns with Claude Sonnet 4
- **Go** - Excellent concurrency patterns, cloud-native development
- **C/C++** - Advanced systems programming, memory management with o3
- **Rust** - Memory safety excellence, ownership patterns with Claude Opus 4
- **PHP** - Web development patterns, framework support

#### **Tier 3: Limited Support (70-85% quality with latest models)**
- **Swift** - iOS/macOS patterns significantly improved, SwiftUI well-supported
- **Kotlin** - Android excellence with Gemini 2.5 Pro, multiplatform growing  
- **Scala** - Functional programming patterns enhanced with reasoning models
- **F#** - .NET functional patterns improved

#### **Tier 4: Minimal Support (60-75% quality, manual review required)**
- **Domain-Specific Languages (DSLs)**
- **Legacy languages** (COBOL, FORTRAN, etc.) - improved with reasoning models
- **Esoteric languages**
- **Company-specific languages**

### **Key Limitations**

#### **1. Training Data Bias**
> Most LLM benchmarks focus heavily on Python due to its prevalence in ML research

**Impact**: 
- Python code generation achieves 90%+ accuracy on benchmarks
- Less common languages may have 40-60% accuracy
- Quality-first prompts work best with Tier 1 languages

**Mitigation**:
```typescript
// Extension automatically adjusts expectations and prompts by language
const languageSupport = getLanguageSupport('haskell');
// Returns: "Tier 4 - Minimal (40-60% quality) - manual review required"
```

#### **2. Architecture Pattern Availability**
**Tier 1 Languages**: Rich modern patterns, comprehensive error handling, enterprise practices
**Tier 4 Languages**: Limited patterns, outdated practices, manual review needed

#### **3. Model-Specific Language Strengths**
- **Claude 3.5 Sonnet**: Best reasoning across languages, architectural thinking
- **GPT-4o**: Strong in popular languages, good code structure  
- **Gemini Pro**: Better multilingual understanding

#### **4. Technical Limitations**

**VS Code Language Model API**: 
- Requires active Copilot subscription
- Rate limiting applies to all models
- Model availability varies by organization settings

**Context Windows**:
- Large codebases may exceed context limits
- Extension automatically prioritizes relevant context

**Real-time Updates**:
- Training data has cutoff dates
- Newest language features may not be well-supported

### **Language-Specific Recommendations**

#### **For Tier 1 Languages (Python, JS/TS, Java, C#)**
```
@quality-first Create a rate-limited HTTP client with retry logic
```
**Expected**: Production-ready code with comprehensive error handling, proper typing, architectural explanations

#### **For Tier 3-4 Languages (Swift, Haskell, COBOL)**
```
@quality-first Create a basic file parser with error handling

Note: This is a Tier 3 language. Please review the following areas:
- Framework-specific patterns may need verification
- Error handling may need language-specific adjustments  
- Performance optimizations should be manually reviewed
```

### **Quality Assurance by Language**

The extension automatically adjusts its approach:

| Language | Model Selection | Quality Checks | Manual Review |
|----------|----------------|---------------|---------------|
| Python | **Claude Opus 4** | World-class patterns | Optional |
| JavaScript | **Claude Sonnet 4** | Advanced web patterns | Optional |  
| TypeScript | **Claude Sonnet 4** | Excellent typing support | Optional |
| Java | **Claude Opus 4** | Enterprise architecture | Optional |
| C# | **GPT-4.5** | .NET ecosystem mastery | Optional |
| **Ruby** | **Claude Sonnet 4** | **Rails mastery** | **Optional** |
| Go | **Claude Sonnet 4** | Concurrency excellence | Optional for complex patterns |
| Rust | **Claude Opus 4** | Memory safety mastery | Optional for advanced patterns |
| C++ | **o3** | Systems programming | Recommended for complex systems |
| Swift | **Claude Sonnet 4** | iOS pattern analysis | Recommended |
| Kotlin | **Gemini 2.5 Pro** | Android excellence | Recommended |
| Haskell | **Claude Opus 4** | Functional reasoning | **Recommended** |

### **Best Practices by Language Tier**

#### **Tier 1 Languages: Full Quality-First Mode**
- Trust the generated architectures
- Focus on business logic review
- Use all extension features

#### **Tier 2 Languages: Standard Quality Mode**  
- Review architectural decisions
- Verify framework-specific patterns
- Test thoroughly

#### **Tier 3-4 Languages: Enhanced Review Mode**
- Manually verify all architectural patterns
- Cross-reference with language-specific resources
- Consider the extension output as a starting point
- Engage domain experts for review

### **Future Improvements**

We're working on:
- **Language-specific fine-tuning**: Custom prompts for each language
- **Community patterns**: Crowdsourced quality patterns for Tier 3-4 languages  
- **Integration testing**: Automated quality validation for generated code
- **Expert validation**: Partnership with language-specific communities

## ⚙️ Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `quality-first.defaultModel` | `auto` | Model preference (auto-selects best available) |
| `quality-first.strictMode` | `true` | Enforce strict quality requirements |
| `quality-first.includeTests` | `false` | Auto-generate test suggestions |
| `quality-first.architecturalFocus` | `balanced` | Primary architectural concern |
| `quality-first.languageOverrides` | `{}` | Custom model selection per language |
| `quality-first.showLanguageWarnings` | `true` | Display quality warnings for Tier 3-4 languages |
| `quality-first.requireManualReview` | `['cobol', 'fortran']` | Languages requiring manual review prompts |

**Model Selection Options:**
- `auto` - Automatically selects best available model considering quality and premium request cost (recommended)

**Premium Request Models (consume from monthly allowance):**
- `claude-opus-4` - World's best coding model (~15-20 requests/query)
- `o3` - Most capable reasoning (~20 requests/query)
- `gpt-4.5` - Improved reasoning (~12 requests/query) 
- `claude-3.7-sonnet` - Hybrid reasoning (~8 requests/query)
- `claude-3.7-sonnet-thinking` - Enhanced thinking mode (~10 requests/query)
- `gemini-2.5-pro` - Advanced reasoning (~8 requests/query)
- `claude-sonnet-4` - Excellent coding (~5 requests/query)
- `gpt-4.1` - Balanced cost/performance (~3 requests/query)
- `gemini-2.0-flash` - Multimodal speed (~2 requests/query)
- `o3-mini` - Fast reasoning (~2 requests/query)
- `o4-mini` - Most efficient (~1 request/query)
- `o1-preview` - Advanced reasoning (~15 requests/query)
- `o1-mini` - Efficient reasoning (~3 requests/query)
- `o1` - Older reasoning (~10 requests/query)

**Standard Models (included in all plans):**
- `claude-3.5-sonnet` - Fast and efficient everyday tasks
- `gpt-4o` - Multimodal general purpose
- `gemini-1.5-pro` - Multimodal understanding

**Note:** Premium request costs are approximate and may vary. The extension automatically manages your budget by selecting the best model within your allowance. When premium requests are low, it intelligently falls back to included standard models.

## 🔄 Integration with Existing Workflow

### With GitHub Copilot Chat
- Use `@quality-first` for production-ready code
- Use regular Copilot for quick prototyping
- Switch between approaches as needed

### With Agent Mode
- The quality enhancer tool automatically activates
- Provides quality improvements during multi-step tasks
- Maintains quality standards across complex workflows

### With BYOK (Bring Your Own Key)
- Automatically uses your custom API keys
- Applies quality-first prompts to any supported model
- Leverages model-specific strengths for optimal results

## 🐛 Troubleshooting

**Extension not working?**
1. Ensure GitHub Copilot is installed and active
2. Check that you have at least one language model enabled
3. Verify VS Code version compatibility (1.93.0+)

**"No suitable language model available" message?**
1. Verify your GitHub Copilot subscription is active
2. Check if your organization has restricted certain models
3. Try logging out and back into GitHub Copilot
4. Restart VS Code and try again

**Getting standard models instead of premium models?**
1. Check your premium request allowance (Free: 50/month, Pro: 300/month, Pro+: 1500/month)
2. Premium models consume 1-20 requests per query depending on complexity
3. Extension automatically falls back to standard models when budget is low
4. Consider upgrading to Pro+ ($39/month) for 1500 premium requests

**Want to check your premium request usage?**
1. The extension shows request cost with each model: "Using Claude Opus 4 (15 premium requests)"
2. Check your GitHub Copilot dashboard for remaining allowance
3. Standard models (Claude 3.5 Sonnet, GPT-4o) are unlimited and included in all plans

**Lower quality results than expected?**
1. Premium models provide significantly better results but consume premium requests
2. Standard models (included) still provide good quality (80-85%) for most tasks
3. Try enabling strict mode in settings for better prompts
4. Provide more detailed context in your prompts

**Model taking too long or rate limited?**
1. Check Copilot subscription status and usage limits
2. Premium models may have longer response times due to advanced reasoning
3. Try o4-mini or standard models for faster responses
4. Rate limits may apply during high usage periods

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/your-username/quality-first-copilot
cd quality-first-copilot
npm install
code .
```

Press `F5` to run the extension in a new Extension Development Host window.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on VS Code's Language Model API
- Inspired by the "measure twice, cut once" philosophy
- Thanks to the GitHub Copilot team for the extensibility APIs

---

**Made with ❤️ for developers who believe in doing it right the first time.**