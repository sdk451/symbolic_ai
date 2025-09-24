import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handler } from '../api';
import * as core from '../lib/core';

// Mock the core module
vi.mock('../lib/core', () => ({
  verifyUser: vi.fn(),
  sbForUser: vi.fn(),
  insertAudit: vi.fn(),
  withEnv: vi.fn(),
  checkRateLimit: vi.fn(),
  recordRateLimitUsage: vi.fn(),
  getWebhookConfig: vi.fn()
}));

// Mock Supabase with proper call tracking
const mockInsert = vi.fn(() => ({
  select: vi.fn(() => ({
    single: vi.fn().mockResolvedValue({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        demo_id: 'test-demo',
        status: 'queued',
        input_data: { test: 'data' },
        created_at: new Date().toISOString()
      },
      error: null
    })
  }))
}));

const mockUpdate = vi.fn(() => ({
  eq: vi.fn().mockResolvedValue({
    error: null
  })
}));

const mockSelect = vi.fn(() => ({
  eq: vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn()
    }))
  }))
}));

const mockSupabase = {
  from: vi.fn(() => ({
    insert: mockInsert,
    update: mockUpdate,
    select: mockSelect
  }))
};

// Mock the Supabase responses
// const mockInsertResponse = vi.fn();
// const mockUpdateResponse = vi.fn();
// const mockSelectResponse = vi.fn();

describe('Demo Execution Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    // @ts-expect-error - Test mock, type mismatch is acceptable
    vi.mocked(core.verifyUser).mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com'
    });
    
    // @ts-expect-error - Test mock, type mismatch is acceptable
    vi.mocked(core.sbForUser).mockReturnValue(mockSupabase);
    vi.mocked(core.checkRateLimit).mockResolvedValue(true);
    vi.mocked(core.recordRateLimitUsage).mockResolvedValue();
    vi.mocked(core.insertAudit).mockResolvedValue();
    vi.mocked(core.getWebhookConfig).mockReturnValue({
      url: 'https://test-webhook.com',
      username: 'test',
      password: 'test'
    });
    vi.mocked(core.withEnv).mockImplementation((key) => {
      const envVars: Record<string, string> = {
        'N8N_WEBHOOK_URL': 'https://n8n.example.com/webhook',
        'N8N_WEBHOOK_SECRET': 'test-secret'
      };
      return envVars[key] || 'test-value';
    });
    
    // Setup default mock responses
    mockInsert().select().single.mockResolvedValue({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        demo_id: 'test-demo',
        status: 'queued',
        input_data: { test: 'data' },
        created_at: new Date().toISOString()
      },
      error: null
    });
    
    mockUpdate().eq.mockResolvedValue({
      error: null
    });
    
    mockSelect().eq().eq().single.mockResolvedValue({
      data: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        demo_id: 'test-demo',
        status: 'succeeded',
        input_data: { test: 'data' },
        output_data: { result: 'success' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      error: null
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Complete Demo Execution Flow', () => {
    it('should execute complete demo flow: start → n8n webhook → callback → status update', async () => {
      const demoId = 'speed-to-lead-qualification';
      const runId = '550e8400-e29b-41d4-a716-446655440001';
      
      // Step 1: Start demo execution
      const mockDemoRun = {
        id: runId,
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        demo_id: demoId,
        status: 'queued',
        created_at: new Date().toISOString()
      };
      
      mockInsert().select().single.mockResolvedValue({
        data: mockDemoRun,
        error: null
      });

      // Mock fetch for n8n webhook call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const startRequest = new Request(`http://localhost/api/demos/${demoId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          inputData: { 
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            request: 'I need help with lead qualification'
          }
        })
      });

      const startResponse = await handler(startRequest);
      const startResult = await startResponse.json();

      expect(startResponse.status).toBe(202);
      expect(startResult.id).toBe(runId);
      expect(startResult.status).toBe('queued');
      
      // Verify n8n webhook was called
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-webhook.com',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Basic dGVzdDp0ZXN0'
          })
        })
      );

      // Step 2: Simulate n8n callback with success
      // Mock select for getting demo_id
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { demo_id: demoId },
            error: null
          })
        })
      });
      
      mockUpdate().eq.mockResolvedValue({
        error: null
      });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        update: mockUpdate
      });

      const callbackPayload = {
        runId,
        status: 'succeeded',
        outputData: { 
          callId: 'call-123',
          duration: 120,
          qualificationScore: 85,
          summary: 'Lead qualified successfully',
          nextSteps: ['Schedule follow-up call', 'Send proposal']
        },
        executionTime: 1500
      };

      const callbackRequest = new Request(`http://localhost/api/demos/${runId}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test-signature',
          'X-Timestamp': new Date().toISOString()
        },
        body: JSON.stringify(callbackPayload)
      });

      const callbackResponse = await handler(callbackRequest);
      const callbackResult = await callbackResponse.json();

      expect(callbackResponse.status).toBe(200);
      expect(callbackResult.success).toBe(true);
      
      // Verify database was updated
      expect(mockSupabase.from).toHaveBeenCalledWith('demo_runs');
      expect(mockUpdate).toHaveBeenCalled();

      // Step 3: Check final status
      const mockFinalStatus = {
        id: runId,
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        demo_id: demoId,
        status: 'succeeded',
        input_data: { test: 'data' },
        output_data: { result: 'Demo completed successfully' },
        error_message: null,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Reset and configure the mock for this specific test
      mockSelect.mockReturnValue({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockFinalStatus,
              error: null
            })
          }))
        }))
      });

      const statusRequest = new Request(`http://localhost/api/demos/${runId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      const statusResponse = await handler(statusRequest);
      const statusResult = await statusResponse.json();

      expect(statusResponse.status).toBe(200);
      expect(statusResult.id).toBe(runId);
      expect(statusResult.status).toBe('succeeded');
      expect(statusResult.outputData).toEqual({ result: 'Demo completed successfully' });
    });

    it('should handle demo execution failure flow', async () => {
      const demoId = 'speed-to-lead-qualification';
      const runId = '550e8400-e29b-41d4-a716-446655440001';
      
      // Step 1: Start demo execution
      const mockDemoRun = {
        id: runId,
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        demo_id: demoId,
        status: 'queued',
        created_at: new Date().toISOString()
      };
      
      mockInsert().select().single.mockResolvedValue({
        data: mockDemoRun,
        error: null
      });

      // Mock fetch for n8n webhook call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const startRequest = new Request(`http://localhost/api/demos/${demoId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          inputData: { 
            name: 'John Doe',
            email: 'john@example.com',
            phone: '+1234567890',
            request: 'I need help with lead qualification'
          }
        })
      });

      const startResponse = await handler(startRequest);
      expect(startResponse.status).toBe(202);

      // Step 2: Simulate n8n callback with failure
      // Mock select for getting demo_id
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { demo_id: demoId },
            error: null
          })
        })
      });
      
      mockUpdate().eq.mockResolvedValue({
        error: null
      });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        update: mockUpdate
      });

      const callbackPayload = {
        runId,
        status: 'failed',
        errorMessage: 'Demo execution failed due to timeout',
        executionTime: 30000
      };

      const callbackRequest = new Request(`http://localhost/api/demos/${runId}/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test-signature',
          'X-Timestamp': new Date().toISOString()
        },
        body: JSON.stringify(callbackPayload)
      });

      const callbackResponse = await handler(callbackRequest);
      const callbackResult = await callbackResponse.json();

      expect(callbackResponse.status).toBe(200);
      expect(callbackResult.success).toBe(true);
      
      // Verify database was updated with failure
      expect(mockUpdate).toHaveBeenCalled();

      // Step 3: Check final status shows failure
      const mockFinalStatus = {
        id: runId,
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        demo_id: demoId,
        status: 'failed',
        input_data: { test: 'data' },
        output_data: null,
        error_message: 'Demo execution failed due to timeout',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Reset and configure the mock for this specific test
      mockSelect.mockReturnValue({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: mockFinalStatus,
              error: null
            })
          }))
        }))
      });

      const statusRequest = new Request(`http://localhost/api/demos/${runId}/status`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      const statusResponse = await handler(statusRequest);
      const statusResult = await statusResponse.json();

      expect(statusResponse.status).toBe(200);
      expect(statusResult.status).toBe('failed');
      expect(statusResult.errorMessage).toBe('Demo execution failed due to timeout');
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should enforce rate limiting across multiple demo executions', async () => {
      const demoId = 'speed-to-lead-qualification';
      
      // First execution should succeed
      vi.mocked(core.checkRateLimit).mockResolvedValueOnce(true);
      
      const mockDemoRun1 = {
        id: 'run-1',
        user_id: 'test-user-id',
        demo_id: demoId,
        status: 'queued',
        created_at: new Date().toISOString()
      };
      
      mockInsert().select().single.mockResolvedValueOnce({
        data: mockDemoRun1,
        error: null
      });

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const request1 = new Request(`http://localhost/api/demos/${demoId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({})
      });

      const response1 = await handler(request1);
      expect(response1.status).toBe(202);

      // Second execution should be rate limited
      vi.mocked(core.checkRateLimit).mockResolvedValueOnce(false);

      const request2 = new Request(`http://localhost/api/demos/${demoId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({})
      });

      const response2 = await handler(request2);
      const result2 = await response2.json();

      expect(response2.status).toBe(429);
      expect(result2.error).toBe('Rate limit exceeded');
      expect(result2.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });
});
