# Implementation Guide

## Overview

This guide provides step-by-step instructions for implementing the brownfield enhancement architecture. It includes common pitfalls, best practices, and specific implementation patterns for AI agents.

## Implementation Phases

### Phase 1: Database Schema and API Foundation

#### 1.1 Database Schema Implementation

**Priority:** High  
**Estimated Time:** 2-3 days  
**Risk Level:** Low (additive changes only)

**Steps:**
1. Create new migration file: `supabase/migrations/20250115000000_demo_system.sql`
2. Implement new tables with proper RLS policies
3. Add indexes for performance optimization
4. Test migrations in development environment

**Common Pitfalls:**
- ❌ **Breaking existing schema**: Always use additive migrations
- ❌ **Missing RLS policies**: Every new table must have proper RLS
- ❌ **Incorrect foreign key relationships**: Verify all relationships before deployment

**Implementation Pattern:**
```sql
-- Example: demo_types table
CREATE TABLE demo_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  audience_tags text[] DEFAULT '{}',
  requires_params boolean DEFAULT false,
  enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE demo_types ENABLE ROW LEVEL SECURITY;

-- Create policies (if needed for user access)
CREATE POLICY "Demo types are viewable by authenticated users"
  ON demo_types FOR SELECT
  TO authenticated
  USING (enabled = true);
```

#### 1.2 API Foundation Setup

**Priority:** High  
**Estimated Time:** 3-4 days  
**Risk Level:** Medium (new API endpoints)

**Steps:**
1. Extend existing `netlify/functions/api.ts` with new endpoints
2. Implement HMAC webhook security
3. Add proper error handling and validation
4. Create comprehensive API tests

**Common Pitfalls:**
- ❌ **Insecure webhook implementation**: Always use HMAC signatures
- ❌ **Missing input validation**: Use Zod schemas for all inputs
- ❌ **Poor error handling**: Implement consistent error responses

**Implementation Pattern:**
```typescript
// Example: Demo run endpoint
app.post('/api/demos/:demoId/run', async (c) => {
  try {
    // 1. Authenticate user
    const user = await verifyJwt(c)
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    // 2. Validate input
    const demoId = c.req.param('demoId')
    const params = await c.req.json().catch(() => ({}))
    
    const validatedParams = demoRunSchema.parse(params)

    // 3. Check user permissions and quotas
    const canRun = await checkUserQuota(user.id, demoId)
    if (!canRun) {
      return c.json({ error: 'Quota exceeded' }, 429)
    }

    // 4. Create demo run record
    const run = await createDemoRun({
      userId: user.id,
      demoId,
      params: validatedParams
    })

    // 5. Call n8n webhook with HMAC
    const payload = { runId: run.id, demoId, userId: user.id, params: validatedParams }
    const hmac = signHmac(payload, process.env.N8N_HMAC_SECRET!)
    
    await fetch(`${process.env.N8N_BASE_URL}/webhook/${demoId}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-hmac': hmac },
      body: JSON.stringify(payload)
    })

    return c.json({ runId: run.id, status: 'queued' })
  } catch (error) {
    console.error('Demo run error:', error)
    return c.json({ error: 'Internal server error' }, 500)
  }
})
```

### Phase 2: Core Demo Components

#### 2.1 DemoRunner Component

**Priority:** High  
**Estimated Time:** 4-5 days  
**Risk Level:** Medium (complex user interactions)

**Steps:**
1. Create `src/components/demos/DemoRunner.tsx`
2. Implement demo selection and configuration
3. Add real-time status updates
4. Create comprehensive component tests

**Common Pitfalls:**
- ❌ **Poor user experience**: Provide clear feedback for all states
- ❌ **Missing accessibility**: Ensure keyboard navigation and screen reader support
- ❌ **Inconsistent styling**: Follow existing Tailwind CSS patterns

**Implementation Pattern:**
```typescript
// Example: DemoRunner component structure
interface DemoRunnerProps {
  demoType: DemoType
  onDemoComplete?: (result: DemoResult) => void
}

export function DemoRunner({ demoType, onDemoComplete }: DemoRunnerProps) {
  const [config, setConfig] = useState<Record<string, any>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  
  const { user } = useAuth()
  const { runDemo, getRunStatus } = useDemos()

  const handleRunDemo = async () => {
    if (!user) return
    
    setIsRunning(true)
    try {
      const result = await runDemo(demoType.id, config)
      setRunId(result.runId)
      
      // Poll for completion
      const interval = setInterval(async () => {
        const status = await getRunStatus(result.runId)
        if (status.status === 'succeeded' || status.status === 'failed') {
          clearInterval(interval)
          setIsRunning(false)
          onDemoComplete?.(status)
        }
      }, 2000)
    } catch (error) {
      setIsRunning(false)
      // Handle error
    }
  }

  return (
    <div className="demo-runner">
      {/* Component implementation */}
    </div>
  )
}
```

#### 2.2 DemoResults Component

**Priority:** Medium  
**Estimated Time:** 2-3 days  
**Risk Level:** Low (display component)

**Steps:**
1. Create `src/components/demos/DemoResults.tsx`
2. Implement result display with proper formatting
3. Add retry functionality
4. Create component tests

**Common Pitfalls:**
- ❌ **Poor result formatting**: Make results easy to read and understand
- ❌ **Missing error states**: Handle all possible result states
- ❌ **No retry mechanism**: Allow users to retry failed demos

### Phase 3: Advanced Features

#### 3.1 Persona-Aware Content

**Priority:** Medium  
**Estimated Time:** 3-4 days  
**Risk Level:** Low (content filtering)

**Steps:**
1. Implement persona detection in user profiles
2. Create content filtering logic
3. Add persona-based demo recommendations
4. Test with different persona types

**Common Pitfalls:**
- ❌ **Over-segmentation**: Don't create too many persona categories
- ❌ **Poor fallbacks**: Always have default content for unknown personas
- ❌ **Performance issues**: Cache filtered content appropriately

#### 3.2 Real-time Updates

**Priority:** Medium  
**Estimated Time:** 2-3 days  
**Risk Level:** Medium (real-time complexity)

**Steps:**
1. Implement Supabase real-time subscriptions
2. Add WebSocket fallback for demo status updates
3. Handle connection issues gracefully
4. Test real-time functionality thoroughly

**Common Pitfalls:**
- ❌ **Memory leaks**: Properly clean up subscriptions
- ❌ **Connection issues**: Handle network failures gracefully
- ❌ **Performance impact**: Limit real-time updates to necessary data

### Phase 4: Integration Testing and Optimization

#### 4.1 End-to-End Testing

**Priority:** High  
**Estimated Time:** 3-4 days  
**Risk Level:** Low (testing phase)

**Steps:**
1. Create comprehensive test suite
2. Test all user workflows
3. Verify existing functionality remains intact
4. Performance testing and optimization

**Common Pitfalls:**
- ❌ **Incomplete test coverage**: Test all critical user paths
- ❌ **Flaky tests**: Ensure tests are reliable and deterministic
- ❌ **Slow tests**: Optimize test performance

## Common Implementation Pitfalls

### 1. Database Integration Issues

**Problem:** Breaking existing data or relationships  
**Solution:** Always use additive migrations, test thoroughly in development

**Example:**
```sql
-- ❌ BAD: Modifying existing table structure
ALTER TABLE profiles DROP COLUMN email;

-- ✅ GOOD: Adding new columns
ALTER TABLE profiles ADD COLUMN persona_segment text;
```

### 2. API Security Issues

**Problem:** Insecure webhook implementation  
**Solution:** Always use HMAC signatures and validate all inputs

**Example:**
```typescript
// ❌ BAD: No security validation
app.post('/api/demos/:runId/callback', async (c) => {
  const body = await c.req.json()
  // Process without validation
})

// ✅ GOOD: Proper security validation
app.post('/api/demos/:runId/callback', async (c) => {
  const body = await c.req.json()
  const hmac = c.req.header('x-hmac')
  
  if (!verifyHmac(body, hmac, process.env.N8N_HMAC_SECRET!)) {
    return c.json({ error: 'Invalid signature' }, 401)
  }
  
  // Process validated request
})
```

### 3. Component State Management

**Problem:** Complex state management leading to bugs  
**Solution:** Use custom hooks and keep state local when possible

**Example:**
```typescript
// ❌ BAD: Complex state in component
function DemoRunner() {
  const [config, setConfig] = useState({})
  const [isRunning, setIsRunning] = useState(false)
  const [runId, setRunId] = useState(null)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState(null)
  // ... many more state variables
}

// ✅ GOOD: Custom hook for state management
function DemoRunner() {
  const { config, isRunning, runId, status, error, runDemo, updateConfig } = useDemoRunner()
  
  return (
    // Component implementation
  )
}
```

### 4. Performance Issues

**Problem:** Slow page loads or poor user experience  
**Solution:** Optimize API calls, implement proper caching, use React.memo

**Example:**
```typescript
// ❌ BAD: Unnecessary re-renders
function DemoList({ demos }) {
  return (
    <div>
      {demos.map(demo => (
        <DemoCard key={demo.id} demo={demo} />
      ))}
    </div>
  )
}

// ✅ GOOD: Optimized with React.memo
const DemoCard = React.memo(({ demo }) => {
  return (
    // Card implementation
  )
})

function DemoList({ demos }) {
  return (
    <div>
      {demos.map(demo => (
        <DemoCard key={demo.id} demo={demo} />
      ))}
    </div>
  )
}
```

## AI Agent Implementation Guidelines

### 1. File Organization

**Pattern:** Follow existing project structure exactly  
**Rationale:** Consistency is crucial for AI agents to understand the codebase

```
src/
├── components/
│   ├── demos/           # New demo components
│   │   ├── DemoRunner.tsx
│   │   ├── DemoResults.tsx
│   │   └── index.ts     # Export all components
│   └── [existing]/      # Don't modify existing structure
├── hooks/
│   ├── useDemos.ts      # New demo-related hooks
│   └── [existing]/      # Don't modify existing hooks
└── services/
    ├── demos.ts         # New demo services
    └── [existing]/      # Don't modify existing services
```

### 2. Naming Conventions

**Pattern:** Follow existing naming patterns exactly  
**Rationale:** AI agents rely on consistent naming to understand relationships

```typescript
// ✅ GOOD: Follow existing patterns
export function DemoRunner() { }
export function useDemos() { }
export const demoService = { }

// ❌ BAD: Inconsistent naming
export function demoRunner() { }  // Should be PascalCase
export function use_demos() { }   // Should be camelCase
```

### 3. TypeScript Interfaces

**Pattern:** Define clear interfaces for all data structures  
**Rationale:** Type safety helps AI agents understand data flow

```typescript
// ✅ GOOD: Clear interface definitions
interface DemoType {
  id: string
  slug: string
  name: string
  description: string
  audienceTags: string[]
  requiresParams: boolean
  enabled: boolean
}

interface DemoRun {
  id: string
  userId: string
  demoTypeId: string
  params: Record<string, any>
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  startedAt: Date
  finishedAt?: Date
  result?: Record<string, any>
  error?: string
}
```

### 4. Error Handling

**Pattern:** Consistent error handling across all components  
**Rationale:** Predictable error handling helps AI agents debug issues

```typescript
// ✅ GOOD: Consistent error handling
export async function runDemo(demoId: string, params: Record<string, any>) {
  try {
    const response = await fetch(`/api/demos/${demoId}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Demo run failed:', error)
    throw new Error('Failed to run demo. Please try again.')
  }
}
```

### 5. Testing Patterns

**Pattern:** Comprehensive testing for all new functionality  
**Rationale:** Tests serve as documentation and validation for AI agents

```typescript
// ✅ GOOD: Comprehensive test coverage
describe('DemoRunner', () => {
  it('renders demo configuration form', () => {
    render(<DemoRunner demoType={mockDemoType} />)
    expect(screen.getByLabelText('Demo Configuration')).toBeInTheDocument()
  })

  it('handles demo execution', async () => {
    const user = userEvent.setup()
    render(<DemoRunner demoType={mockDemoType} />)
    
    await user.click(screen.getByRole('button', { name: 'Run Demo' }))
    
    expect(screen.getByText('Demo is running...')).toBeInTheDocument()
  })

  it('displays error on failure', async () => {
    vi.mocked(runDemo).mockRejectedValue(new Error('Demo failed'))
    
    render(<DemoRunner demoType={mockDemoType} />)
    
    await userEvent.click(screen.getByRole('button', { name: 'Run Demo' }))
    
    await waitFor(() => {
      expect(screen.getByText('Demo failed')).toBeInTheDocument()
    })
  })
})
```

## Validation Checklist

Before considering any component complete, verify:

- [ ] **TypeScript**: All code passes strict type checking
- [ ] **ESLint**: All code passes existing linting rules
- [ ] **Tests**: Component has comprehensive test coverage (80%+)
- [ ] **Accessibility**: Component is keyboard navigable and screen reader compatible
- [ ] **Performance**: Component doesn't cause unnecessary re-renders
- [ ] **Integration**: Component works with existing authentication and data flow
- [ ] **Error Handling**: All error states are handled gracefully
- [ ] **Documentation**: Component is properly documented with JSDoc comments

## Deployment Checklist

Before deploying any changes:

- [ ] **Database**: All migrations tested in development
- [ ] **API**: All endpoints tested with proper authentication
- [ ] **Frontend**: All components tested in isolation and integration
- [ ] **Security**: All security measures implemented and tested
- [ ] **Performance**: Performance impact assessed and optimized
- [ ] **Rollback**: Rollback plan tested and documented
- [ ] **Monitoring**: Monitoring and alerting configured for new features
