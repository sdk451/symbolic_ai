import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handler } from '../api';
import * as core from '../lib/core';

// Mock the core module
vi.mock('../lib/core', () => ({
  verifyUser: vi.fn(),
  sbForUser: vi.fn(),
  insertAudit: vi.fn(),
  hmacSign: vi.fn(),
  hmacVerify: vi.fn(),
  withEnv: vi.fn(),
  checkRateLimit: vi.fn(),
  recordRateLimitUsage: vi.fn()
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
        single: vi.fn()
      }))
    }))
  }))
};

describe('Demo Execution API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(core.verifyUser).mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com'
    } as any);
    
    vi.mocked(core.sbForUser).mockReturnValue(mockSupabase as any);
    vi.mocked(core.checkRateLimit).mockResolvedValue(true);
    vi.mocked(core.recordRateLimitUsage).mockResolvedValue();
    vi.mocked(core.insertAudit).mockResolvedValue();
    vi.mocked(core.withEnv).mockImplementation((key) => {
      const envVars: Record<string, string> = {
        'N8N_WEBHOOK_URL': 'https://n8n.example.com/webhook',
        'N8N_WEBHOOK_SECRET': 'test-secret'
      };
      return envVars[key] || 'test-value';
    });
    vi.mocked(core.hmacSign).mockReturnValue('test-signature');
    vi.mocked(core.hmacVerify).mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('POST /api/demos/:demoId/run', () => {
    it('should successfully start a demo execution', async () => {
      // Mock successful database insert
      const mockDemoRun = {
        id: 'test-run-id',
        user_id: 'test-user-id',
        demo_id: 'test-demo',
        status: 'queued',
        created_at: new Date().toISOString()
      };
      
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockDemoRun,
        error: null
      });

      // Mock fetch for n8n webhook call
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true })
      });

      const request = new Request('http://localhost/api/demos/test-demo/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          inputData: { test: 'data' }
        })
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(202);
      expect(result.id).toBe('test-run-id');
      expect(result.status).toBe('queued');
      expect(result.message).toBe('Demo execution started successfully');
      
      // Verify database insert was called
      expect(mockSupabase.from).toHaveBeenCalledWith('demo_runs');
      
      // Verify n8n webhook was called
      expect(global.fetch).toHaveBeenCalledWith(
        'https://n8n.example.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'X-Signature': 'test-signature'
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
      // Mock successful database update
      mockSupabase.from().update().eq.mockResolvedValue({
        error: null
      });

      const callbackPayload = {
        runId: 'test-run-id',
        status: 'succeeded',
        outputData: { result: 'success' },
        executionTime: 1500
      };

      const request = new Request('http://localhost/api/demos/test-run-id/callback', {
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

    it('should return 401 for invalid HMAC signature', async () => {
      vi.mocked(core.hmacVerify).mockReturnValue(false);

      const request = new Request('http://localhost/api/demos/test-run-id/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'invalid-signature',
          'X-Timestamp': new Date().toISOString()
        },
        body: JSON.stringify({
          runId: 'test-run-id',
          status: 'succeeded'
        })
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Invalid signature');
      expect(result.code).toBe('INVALID_SIGNATURE');
    });

    it('should return 401 for missing signature', async () => {
      const request = new Request('http://localhost/api/demos/test-run-id/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          runId: 'test-run-id',
          status: 'succeeded'
        })
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('Missing signature or timestamp');
      expect(result.code).toBe('MISSING_SIGNATURE');
    });

    it('should return 400 for run ID mismatch', async () => {
      const request = new Request('http://localhost/api/demos/test-run-id/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': 'test-signature',
          'X-Timestamp': new Date().toISOString()
        },
        body: JSON.stringify({
          runId: 'different-run-id', // Mismatch
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
        id: 'test-run-id',
        user_id: 'test-user-id',
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

      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockDemoRun,
        error: null
      });

      const request = new Request('http://localhost/api/demos/test-run-id/status', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.id).toBe('test-run-id');
      expect(result.status).toBe('running');
      expect(result.demoId).toBe('test-demo');
    });

    it('should return 404 for non-existent demo run', async () => {
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Not found' }
      });

      const request = new Request('http://localhost/api/demos/non-existent/status', {
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
