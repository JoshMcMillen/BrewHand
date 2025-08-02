# BrewHand Custom Instructions

These instructions guide GitHub Copilot to generate production-ready, high-quality code that follows BrewHand's "do it right the first time" philosophy.

## Core Principles

- **Production-Ready**: Generate code with comprehensive error handling, input validation, and edge case coverage
- **Quality First**: Prioritize maintainable, readable, and well-structured solutions over quick fixes
- **Best Practices**: Follow language-specific conventions, security guidelines, and performance considerations

## Shell Command Guidelines

**Current Environment:** bash  
**Command Separator:** `&&`  
**Path Quoting:** Use `"` for paths with spaces

### Shell Command Rules
- Use "&&" for conditional execution: `cmd1 && cmd2 && cmd3`
- Use ";" for sequential execution: `cmd1; cmd2; cmd3`
- Quote paths with spaces: `cd "My Project"`
- Variables use $ prefix: `$PATH`

### Examples
```bash
cd "/projects" && npm install && npm start
```

**Important:** Always generate shell commands compatible with bash. Never mix separators from different shells.

## Code Quality Standards

- Write comprehensive unit tests alongside implementation
- Include proper documentation and type annotations
- Implement graceful error handling and recovery
- Use design patterns appropriately
- Optimize for readability and maintainability

### Strict Mode Requirements

- **No TODO/FIXME comments** - Complete all implementations
- **Comprehensive error handling** - Handle all possible failure scenarios  
- **Input validation** - Validate all inputs and parameters
- **Resource cleanup** - Properly dispose of resources and handle cleanup
- **Security considerations** - Follow security best practices for all code
- **Performance optimization** - Consider performance implications of all decisions

## Architectural Guidance

### Primary Focus: BALANCED

- Balance performance, maintainability, security, and scalability
- Make architectural decisions based on context and requirements
- Consider long-term maintenance implications
- Follow established patterns and conventions
- Optimize critical paths while maintaining code clarity
- Implement security measures appropriate to the use case

## General Guidelines

- Always include comprehensive error handling
- Add input validation for all functions and methods  
- Use descriptive variable and function names
- Include relevant comments for complex logic
- Consider performance implications of solutions
- Follow security best practices
- Write testable, modular code
- Handle edge cases appropriately

## Code Quality Standards

- No TODO comments in production code - complete implementations
- Prefer explicit error handling over silent failures
- Use appropriate data structures and algorithms for the context
- Follow the DRY (Don't Repeat Yourself) principle
- Implement proper logging where appropriate