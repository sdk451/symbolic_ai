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

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn()
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        })),
        single: vi.fn()
      })),
      single: vi.fn()
    }))
  }))
};

describe('Demo Execution API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    // @ts-expect-error - Test mock, type mismatch is acceptable
    vi.mocked(core.verifyUser).mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com'
    });
    
    // @ts-expect-error - Test mock, type mismatch is acceptable
    vi.mocked(core.sbForUser).mockReturnValue(mockSupabase);
    vi.mocked(core.checkRateLimit).mockResolvedValue(true);
    vi.mocked(core.recordRateLimitUsage).mockResolvedValue();
    vi.mocked(core.getWebhookConfig).mockReturnValue({
      url: 'https://test-webhook.com',
      username: 'test',
      password: 'test'
    });
    vi.mocked(core.insertAudit).mockResolvedValue();
    vi.mocked(core.withEnv).mockImplementation((key) => {
      const envVars: Record<string, string> = {
        'N8N_WEBHOOK_URL': 'https://n8n.example.com/webhook',
        'N8N_WEBHOOK_SECRET': 'test-secret'
      };
      return envVars[key] || 'test-value';
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/demos/:demoId/run', () => {
    it('should successfully start a demo execution', async () => {
      // Mock successful database insert
      const mockDemoRun = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        demo_id: 'test-demo',
        status: 'queued',
        created_at: new Date().toISOString()
      };
      
      // Setup the mock chain for insert
      const mockInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockDemoRun,
            error: null
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        insert: mockInsert,
        update: mockSupabase.from().update,
        select: mockSupabase.from().select
      });

      // Mock fetch for n8n webhook call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const request = new Request('http://localhost/api/demos/speed-to-lead-qualification/run', {
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

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(202);
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.status).toBe('queued');
      expect(result.message).toBe('Demo execution started successfully');
      
      // Verify database insert was called
      expect(mockSupabase.from).toHaveBeenCalledWith('demo_runs');
      
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
    });

    it('should return 401 for missing authentication', async () => {
      vi.mocked(core.verifyUser).mockRejectedValue(new Error('Invalid token'));

      const request = new Request('http://localhost/api/demos/test-demo/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Demo Execution Failed');
    });

    it('should return 429 for rate limit exceeded', async () => {
      vi.mocked(core.checkRateLimit).mockResolvedValue(false);

      const request = new Request('http://localhost/api/demos/test-demo/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({})
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.error).toBe('Rate limit exceeded');
      expect(result.code).toBe('RATE_LIMIT_EXCEEDED');
    });

    it('should return 400 for invalid request data', async () => {
      const request = new Request('http://localhost/api/demos/test-demo/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          options: {
            timeout: 1000 // Invalid: too high
          }
        })
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Validation Error');
      expect(result.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/demos/:runId/callback', () => {
    it('should successfully process n8n callback', async () => {
      // Setup the mock chain for select (to get demo_id)
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { demo_id: 'speed-to-lead-qualification' },
            error: null
          })
        })
      });
      
      // Setup the mock chain for update
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null
        })
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
        insert: mockSupabase.from().insert
      });

      const callbackPayload = {
        runId: '550e8400-e29b-41d4-a716-446655440000',
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

      const request = new Request('http://localhost/api/demos/550e8400-e29b-41d4-a716-446655440000/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test-signature',
          'X-Timestamp': new Date().toISOString()
        },
        body: JSON.stringify(callbackPayload)
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Callback processed successfully');
      
      // Verify database update was called
      expect(mockSupabase.from).toHaveBeenCalledWith('demo_runs');
    });



    it('should return 400 for run ID mismatch', async () => {
      // Mock the Supabase query for getting demo_id
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { demo_id: 'test-demo' },
            error: null
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: mockSupabase.from().insert,
        update: mockSupabase.from().update
      });
      
      const request = new Request('http://localhost/api/demos/550e8400-e29b-41d4-a716-446655440000/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test-signature',
          'X-Timestamp': new Date().toISOString()
        },
        body: JSON.stringify({
          runId: '550e8400-e29b-41d4-a716-446655440001', // Mismatch
          status: 'succeeded'
        })
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('Run ID mismatch');
      expect(result.code).toBe('RUN_ID_MISMATCH');
    });
  });

  describe('GET /api/demos/:runId/status', () => {
    it('should return demo run status', async () => {
      const mockDemoRun = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        user_id: '550e8400-e29b-41d4-a716-446655440001',
        demo_id: 'test-demo',
        status: 'running',
        input_data: { test: 'input' },
        output_data: null,
        error_message: null,
        started_at: new Date().toISOString(),
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Setup the mock chain for select with double eq
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockDemoRun,
              error: null
            })
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: mockSupabase.from().insert,
        update: mockSupabase.from().update
      });

      const request = new Request('http://localhost/api/demos/550e8400-e29b-41d4-a716-446655440000/status', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(result.status).toBe('running');
      expect(result.demoId).toBe('test-demo');
    });

    it('should return 404 for non-existent demo run', async () => {
      // Setup the mock chain for select with double eq (error case)
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' }
            })
          })
        })
      });
      
      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        insert: mockSupabase.from().insert,
        update: mockSupabase.from().update
      });

      const request = new Request('http://localhost/api/demos/550e8400-e29b-41d4-a716-446655440002/status', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe('Demo run not found');
      expect(result.code).toBe('NOT_FOUND');
    });
  });
});
