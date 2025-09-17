import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('Demo Execution Integration Tests (Simplified)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    vi.mocked(core.verifyUser).mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com'
    } as any);
    
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
    
    // Mock Supabase client for sbForUser
    const mockSupabase = {
      from: vi.fn(() => ({
        insert: vi.fn(() => ({
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
        })),
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            error: null
          })
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
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
              })
            }))
          }))
        }))
      }))
    };
    
    vi.mocked(core.sbForUser).mockReturnValue(mockSupabase as any);
  });

  describe('API Endpoint Integration', () => {
    it('should handle demo execution request with proper validation', async () => {
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
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result.status).toBe('queued');
      expect(result.message).toBe('Demo execution started successfully');
    });

    it('should handle callback request with HMAC verification', async () => {
      const callbackPayload = {
        runId: '550e8400-e29b-41d4-a716-446655440001',
        status: 'succeeded',
        outputData: { result: 'success' },
        executionTime: 1500
      };

      const request = new Request('http://localhost/api/demos/550e8400-e29b-41d4-a716-446655440001/callback', {
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
    });

    it('should handle status check request', async () => {
      const request = new Request('http://localhost/api/demos/550e8400-e29b-41d4-a716-446655440001/status', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result.status).toBe('succeeded');
      expect(result.outputData).toEqual({ result: 'success' });
    });
  });

  describe('Rate Limiting Integration', () => {
    it('should enforce rate limiting', async () => {
      // Mock rate limit exceeded
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
  });

  describe('Error Handling Integration', () => {
    it('should handle authentication failures', async () => {
      // Mock authentication failure
      vi.mocked(core.verifyUser).mockRejectedValue(new Error('Invalid token'));

      const request = new Request('http://localhost/api/demos/test-demo/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid-token'
        },
        body: JSON.stringify({})
      });

      const response = await handler(request);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Demo Execution Failed');
    });

    it('should handle invalid HMAC signatures', async () => {
      // Mock HMAC verification failure
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
  });
});
