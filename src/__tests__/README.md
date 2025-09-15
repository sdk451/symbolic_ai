# Testing Framework Documentation

## Overview

This project uses **Vitest** as the primary testing framework with **React Testing Library** for component testing. The testing setup is optimized for the existing Vite + React + TypeScript stack.

## Testing Stack

- **Vitest**: Fast, Vite-native testing framework
- **React Testing Library**: Simple and complete testing utilities for React components
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **@testing-library/user-event**: Utilities for simulating user interactions
- **jsdom**: DOM environment for testing
- **@vitest/coverage-v8**: Code coverage reporting

## Test Structure

```
src/__tests__/
├── components/          # Component tests
├── hooks/              # Custom hook tests
├── services/           # Service/API tests
├── utils/              # Utility function tests
├── setup.ts            # Test setup and configuration
└── README.md           # This documentation
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Component Tests

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const user = userEvent.setup()
    render(<MyComponent />)
    
    await user.click(screen.getByRole('button'))
    expect(screen.getByText('Clicked!')).toBeInTheDocument()
  })
})
```

### Hook Tests

```typescript
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe('initial')
  })

  it('updates state correctly', () => {
    const { result } = renderHook(() => useMyHook())
    
    act(() => {
      result.current.setValue('new value')
    })
    
    expect(result.current.value).toBe('new value')
  })
})
```

### Service Tests

```typescript
import { describe, it, expect, vi } from 'vitest'
import { myService } from '../myService'

// Mock external dependencies
vi.mock('../api', () => ({
  apiCall: vi.fn()
}))

describe('myService', () => {
  it('calls API correctly', async () => {
    const mockApiCall = vi.mocked(apiCall)
    mockApiCall.mockResolvedValue({ data: 'test' })
    
    const result = await myService.getData()
    
    expect(mockApiCall).toHaveBeenCalledWith('/endpoint')
    expect(result).toEqual({ data: 'test' })
  })
})
```

## Testing Best Practices

### 1. Test Structure
- Use `describe` blocks to group related tests
- Use descriptive test names that explain the expected behavior
- Follow the AAA pattern: Arrange, Act, Assert

### 2. Component Testing
- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText) over test IDs
- Mock external dependencies and API calls
- Test error states and loading states

### 3. Accessibility Testing
- Test keyboard navigation
- Verify ARIA attributes
- Check color contrast (manual testing)
- Test with screen readers (manual testing)

### 4. Mocking
- Mock external dependencies at the module level
- Use `vi.mock()` for module mocking
- Use `vi.fn()` for function mocking
- Mock Supabase client for database operations

### 5. Coverage
- Aim for 80%+ code coverage
- Focus on critical business logic
- Don't test third-party library internals
- Test error handling and edge cases

## Common Patterns

### Mocking Supabase

```typescript
import { vi } from 'vitest'

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    }))
  }
}))
```

### Testing Async Operations

```typescript
it('handles async operations', async () => {
  render(<AsyncComponent />)
  
  // Wait for async operation to complete
  await waitFor(() => {
    expect(screen.getByText('Loaded!')).toBeInTheDocument()
  })
})
```

### Testing Error States

```typescript
it('displays error message on failure', async () => {
  const mockError = new Error('API Error')
  vi.mocked(apiCall).mockRejectedValue(mockError)
  
  render(<ComponentWithError />)
  
  await waitFor(() => {
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })
})
```

## Configuration

The testing configuration is defined in `vitest.config.ts`:

- **Environment**: jsdom for DOM simulation
- **Setup**: `src/__tests__/setup.ts` for global test configuration
- **Coverage**: 80% threshold for branches, functions, lines, and statements
- **Reporters**: text, json, and html coverage reports

## Troubleshooting

### Common Issues

1. **Module not found errors**: Ensure all dependencies are properly mocked
2. **Async test failures**: Use `waitFor` or `findBy` queries for async operations
3. **Coverage issues**: Check that all code paths are being tested
4. **Mock not working**: Verify mock is defined before the import

### Debug Tips

- Use `screen.debug()` to see the current DOM state
- Use `--reporter=verbose` for detailed test output
- Use `--ui` flag for interactive test debugging
- Check the coverage report for untested code paths
