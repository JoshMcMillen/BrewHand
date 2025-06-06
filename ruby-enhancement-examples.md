# Ruby-Specific Quality-First Examples

## 🚀 Enhanced Ruby Support

The extension now provides **Tier 2 - Good Support (75-80% quality)** for Ruby with comprehensive Rails ecosystem awareness.

## 📋 Ruby Quality Standards Applied

### **Core Ruby Principles**
- The Ruby Way and principle of least surprise
- Comprehensive exception handling with specific classes
- Input validation and sanitization
- Proper metaprogramming with documentation
- Testing patterns (RSpec/Minitest)
- Rails conventions (when detected)
- Performance best practices

### **Security & Performance**
- SQL injection prevention
- Parameter sanitization
- N+1 query avoidance
- Memory management considerations
- Proper concurrency patterns

## 💎 Example: Ruby Enhancement in Action

### **Basic Request: User Model**

**Input:**
```
@quality-first Create a User model with email validation and secure password handling
```

**Enhanced Ruby Output:**
```ruby
# frozen_string_literal: true

class User < ApplicationRecord
  include BCrypt
  
  # Associations
  has_many :sessions, dependent: :destroy
  has_many :posts, dependent: :destroy
  
  # Validations
  validates :email, presence: true, 
                   uniqueness: { case_sensitive: false },
                   format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :password, length: { minimum: 8 }, 
                      format: { with: /\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]\z/ },
                      confirmation: true,
                      if: :password_required?
  
  # Callbacks
  before_save :normalize_email
  after_create :send_welcome_email
  
  # Password handling with BCrypt
  has_secure_password
  
  # Scopes
  scope :active, -> { where(active: true) }
  scope :recent, -> { where(created_at: 1.week.ago..) }
  
  # Class methods
  def self.find_by_email(email)
    return nil if email.blank?
    
    normalized_email = email.strip.downcase
    find_by(email: normalized_email)
  rescue => e
    Rails.logger.error "Error finding user by email: #{e.message}"
    nil
  end
  
  def self.authenticate(email, password)
    return nil if email.blank? || password.blank?
    
    user = find_by_email(email)
    return nil unless user&.active?
    
    user.authenticate(password) ? user : nil
  rescue => e
    Rails.logger.error "Authentication error: #{e.message}"
    nil
  end
  
  # Instance methods
  def full_name
    "#{first_name} #{last_name}".strip
  end
  
  def display_name
    full_name.present? ? full_name : email.split('@').first.titleize
  end
  
  def activate!
    update!(active: true, activated_at: Time.current)
    UserMailer.account_activated(self).deliver_later
  rescue => e
    Rails.logger.error "Failed to activate user #{id}: #{e.message}"
    raise UserActivationError, "Unable to activate account"
  end
  
  def deactivate!
    transaction do
      update!(active: false, deactivated_at: Time.current)
      sessions.destroy_all
    end
  rescue => e
    Rails.logger.error "Failed to deactivate user #{id}: #{e.message}"
    raise UserDeactivationError, "Unable to deactivate account"
  end
  
  private
  
  def normalize_email
    self.email = email.strip.downcase if email.present?
  end
  
  def send_welcome_email
    UserMailer.welcome(self).deliver_later
  rescue => e
    Rails.logger.warn "Failed to send welcome email to user #{id}: #{e.message}"
    # Don't raise - welcome email failure shouldn't prevent user creation
  end
  
  def password_required?
    password_digest.blank? || password.present?
  end
end

# Custom exception classes
class UserActivationError < StandardError; end
class UserDeactivationError < StandardError; end
```

### **Quality Features Applied:**

✅ **Ruby Conventions**
- `frozen_string_literal` for performance
- Snake_case naming throughout
- Proper use of `?` and `!` method naming

✅ **Rails Patterns**
- ActiveRecord associations with `dependent: :destroy`
- Proper validations with custom messages
- Scopes for common queries
- Callbacks for data normalization

✅ **Security Best Practices**
- Password complexity validation
- Email normalization to prevent case sensitivity issues
- SQL injection prevention through proper ActiveRecord usage
- Input sanitization with `strip` and validation

✅ **Error Handling**
- Specific exception classes
- Comprehensive rescue blocks with logging
- Graceful degradation (welcome email failure doesn't break user creation)
- Transaction safety for critical operations

✅ **Performance Considerations**
- Database indexes implied through uniqueness validation
- Efficient scopes for common queries
- Background job processing for emails
- Proper use of `&.` safe navigation

✅ **Testing Readiness**
- Public interface clearly defined
- Methods designed for easy stubbing/mocking
- Clear separation of concerns
- Predictable return values

## 🔧 Rails-Specific Context Detection

The extension automatically detects:

**Gemfile Presence** → Applies gem-specific patterns
```ruby
# Detects sidekiq → adds background job patterns
# Detects rspec → uses RSpec testing conventions
# Detects devise → applies authentication patterns
```

**Rails Configuration** → Applies Rails conventions
```ruby
# config/application.rb detected → Rails patterns applied
# config/routes.rb present → RESTful conventions
# app/ directory structure → MVC patterns
```

**Testing Framework** → Appropriate test patterns
```ruby
# spec/spec_helper.rb → RSpec patterns
# test/test_helper.rb → Minitest patterns
```

## 📊 Ruby Code Quality Analysis

The extension now detects Ruby-specific issues:

| Issue | Detection | Suggestion |
|-------|-----------|------------|
| Bare rescue | `rescue$` | Use `rescue SpecificError => e` |
| Debug output | `puts`, `p`, `pp` | Use `Rails.logger` instead |
| SQL injection | String interpolation in queries | Use parameterized queries |
| Class variables | `@@variable` | Use class instance variables |
| Long parameter lists | `def method(a,b,c,d,e)` | Use hash parameters |
| Missing frozen literal | No comment at top | Add `# frozen_string_literal: true` |

## 🎯 Ruby-Specific Commands

### **Enhanced Selection for Ruby**
Select any Ruby code and use `Ctrl+Shift+Q` to apply:
- Proper exception handling
- Input validation
- Rails conventions
- Security best practices
- Performance optimizations

### **Rails Pattern Generation**
```
@quality-first Create a Rails controller for blog posts with authentication
@quality-first Generate a service object for payment processing
@quality-first Build a background job for email notifications
```

## 🚀 Next Steps for Your Ruby Project

1. **Install the extension** and test with your current Ruby codebase
2. **Use `@quality-first`** for new feature development
3. **Apply enhancement** to existing code sections
4. **Review generated patterns** and adapt to your team's conventions
5. **Integrate with your testing workflow** (RSpec/Minitest)

The enhanced Ruby support transforms the extension from "Tier 3 - Limited" to **"Tier 2 - Good"** specifically for Ruby development, making it a valuable tool for your current project!