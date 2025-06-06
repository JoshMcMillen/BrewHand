# Ruby Development Workflow with Quality-First Copilot

## 🚀 **Quick Start for Ruby Developers**

### **Installation & Setup**
1. Install the Quality-First Copilot extension
2. Open your Ruby/Rails project
3. Extension automatically detects Ruby context from:
   - `Gemfile` presence
   - `.ruby-version` file
   - Rails directory structure (`app/`, `config/`, etc.)
   - RSpec/Minitest configuration

### **Immediate Ruby Commands to Try**

#### **1. Model Generation**
```
@quality-first Create a Product model with validations, associations, and search functionality
```

#### **2. Controller with Authentication**
```
@quality-first Generate a ProductsController with CRUD operations and authentication
```

#### **3. Service Object Pattern**
```
@quality-first Create a service object for payment processing with error handling
```

#### **4. Background Job**
```
@quality-first Build a Sidekiq job for sending notification emails
```

#### **5. API Endpoint**
```
@quality-first Create a JSON API endpoint for products with pagination and filtering
```

## 💎 **Ruby-Specific Quality Enhancements**

### **Code Enhancement Workflow**

1. **Select existing Ruby code**
2. **Press `Ctrl+Shift+Q` (or `Cmd+Shift+Q` on Mac)**
3. **Watch the transformation:**

#### **Before:**
```ruby
def create_user(params)
  user = User.new(params)
  user.save
  user
end
```

#### **After Quality Enhancement:**
```ruby
# frozen_string_literal: true

def create_user(params)
  raise ArgumentError, "Parameters cannot be nil" if params.nil?
  
  # Sanitize and validate parameters
  sanitized_params = sanitize_user_params(params)
  
  User.transaction do
    user = User.new(sanitized_params)
    
    if user.save
      Rails.logger.info "User created successfully: #{user.id}"
      UserMailer.welcome(user).deliver_later
      user
    else
      Rails.logger.error "Failed to create user: #{user.errors.full_messages}"
      raise ActiveRecord::RecordInvalid, user
    end
  end
rescue ActiveRecord::RecordInvalid => e
  Rails.logger.error "User creation failed: #{e.message}"
  raise
rescue => e
  Rails.logger.error "Unexpected error creating user: #{e.message}"
  raise UserCreationError, "Unable to create user account"
end

private

def sanitize_user_params(params)
  params.permit(:name, :email, :password, :password_confirmation)
        .transform_values(&:strip)
        .reject { |_, v| v.blank? }
end
```

### **Rails-Specific Context Detection**

The extension automatically adapts based on your project:

| **Detected File/Gem** | **Applied Patterns** |
|----------------------|-------------------|
| `Gemfile` with `rails` | MVC conventions, ActiveRecord patterns |
| `Gemfile` with `rspec` | RSpec testing patterns, `let` statements |
| `Gemfile` with `sidekiq` | Background job patterns, `perform_async` |
| `Gemfile` with `devise` | Authentication patterns, `before_action` |
| `config/routes.rb` | RESTful routing conventions |
| `spec/` directory | RSpec-style testing |
| `test/` directory | Minitest-style testing |

## 🔧 **Advanced Ruby Features**

### **1. Metaprogramming with Safety**
```
@quality-first Create a dynamic attribute accessor with validation
```

**Generates:**
```ruby
def self.define_validated_accessor(attribute, validator)
  raise ArgumentError, "Attribute name required" if attribute.blank?
  raise ArgumentError, "Validator must respond to call" unless validator.respond_to?(:call)
  
  define_method(attribute) do
    instance_variable_get("@#{attribute}")
  end
  
  define_method("#{attribute}=") do |value|
    unless validator.call(value)
      raise ArgumentError, "Invalid value for #{attribute}: #{value}"
    end
    instance_variable_set("@#{attribute}", value)
  end
end
```

### **2. Concurrent Programming**
```
@quality-first Create a thread-safe cache with TTL support
```

### **3. Performance Optimization**
```
@quality-first Optimize this ActiveRecord query for N+1 problems
```

## 🧪 **Testing Integration**

### **RSpec Pattern Generation**
```
@quality-first Generate RSpec tests for the User model with validations and callbacks
```

**Generates comprehensive specs:**
```ruby
# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    subject { build(:user) }
    
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email).case_insensitive }
    it { is_expected.to validate_length_of(:password).is_at_least(8) }
    
    describe 'email format validation' do
      it 'accepts valid email formats' do
        valid_emails = %w[user@example.com test.user@domain.co.uk]
        valid_emails.each do |email|
          user = build(:user, email: email)
          expect(user).to be_valid
        end
      end
      
      it 'rejects invalid email formats' do
        invalid_emails = %w[invalid.email @domain.com user@]
        invalid_emails.each do |email|
          user = build(:user, email: email)
          expect(user).not_to be_valid
        end
      end
    end
  end
  
  describe 'callbacks' do
    describe 'before_save :normalize_email' do
      it 'converts email to lowercase' do
        user = create(:user, email: 'User@EXAMPLE.COM')
        expect(user.email).to eq('user@example.com')
      end
      
      it 'strips whitespace from email' do
        user = create(:user, email: '  user@example.com  ')
        expect(user.email).to eq('user@example.com')
      end
    end
  end
  
  describe 'associations' do
    it { is_expected.to have_many(:posts).dependent(:destroy) }
    it { is_expected.to have_many(:sessions).dependent(:destroy) }
  end
  
  describe '.authenticate' do
    let(:user) { create(:user, password: 'SecurePass123!') }
    
    it 'returns user for valid credentials' do
      result = described_class.authenticate(user.email, 'SecurePass123!')
      expect(result).to eq(user)
    end
    
    it 'returns nil for invalid password' do
      result = described_class.authenticate(user.email, 'wrong_password')
      expect(result).to be_nil
    end
    
    it 'returns nil for non-existent email' do
      result = described_class.authenticate('nonexistent@example.com', 'password')
      expect(result).to be_nil
    end
  end
end
```

## 📊 **Ruby Code Quality Dashboard**

### **Built-in Quality Checks**
The extension automatically reviews your Ruby code for:

✅ **Security Issues**
- SQL injection vulnerabilities
- Mass assignment issues
- Insecure random generation

✅ **Performance Problems**
- N+1 query patterns
- Inefficient loops
- Memory leaks

✅ **Ruby Best Practices**
- Missing `frozen_string_literal`
- Bare rescue clauses
- Class variable usage
- Long parameter lists

✅ **Rails Conventions**
- Proper use of strong parameters
- Callback ordering
- Association configurations

### **Quality Report Example**
```
=== Ruby Code Quality Review ===

✅ No SQL injection vulnerabilities found
✅ Proper exception handling implemented
✅ Rails conventions followed
⚠️  Line 45: Consider using class instance variables instead of class variables
⚠️  Line 72: Long parameter list detected - consider parameter object pattern
ℹ️  Line 1: Add frozen_string_literal comment for better performance
```

## 🎯 **Practical Ruby Workflows**

### **Daily Development Routine**

1. **Start new feature:**
   ```
   @quality-first Create a feature service object for user subscription management
   ```

2. **Enhance existing code:**
   - Select problematic method
   - `Ctrl+Shift+Q` to enhance
   - Review security and performance improvements

3. **Generate tests:**
   ```
   @quality-first Generate comprehensive RSpec tests for the SubscriptionService
   ```

4. **Code review preparation:**
   - Run `Quality Review` command
   - Address flagged issues
   - Ensure all patterns follow Ruby/Rails conventions

### **Refactoring Legacy Code**

1. **Select large method or class**
2. **Use enhancement tool** to break down into smaller methods
3. **Apply Ruby idioms** and performance optimizations
4. **Generate corresponding tests** for refactored code

This enhanced Ruby support transforms your development workflow by ensuring every piece of generated code follows Ruby best practices, Rails conventions, and security standards from the very beginning—eliminating the traditional "make it work, then make it better" cycle that wastes time and introduces technical debt.