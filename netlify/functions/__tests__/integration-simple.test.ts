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
    // @ts-expect-error - Test mock, type mismatch is acceptable
    vi.mocked(core.verifyUser).mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'test@example.com'
    });
    
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
                  demo_id: 'speed-to-lead-qualification',
                  status: 'succeeded',
                  input_data: { 
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+1234567890',
                    request: 'I need help with lead qualification'
                  },
                  output_data: { 
                    callId: 'call-123',
                    duration: 120,
                    qualificationScore: 85,
                    summary: 'Lead qualified successfully',
                    nextSteps: ['Schedule follow-up call', 'Send proposal']
                  },
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
    
    // @ts-expect-error - Test mock, type mismatch is acceptable
    vi.mocked(core.sbForUser).mockReturnValue(mockSupabase);
  });

  describe('API Endpoint Integration', () => {
    it('should handle demo execution request with proper validation', async () => {
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
      expect(result.id).toBe('550e8400-e29b-41d4-a716-446655440001');
      expect(result.status).toBe('queued');
      expect(result.message).toBe('Demo execution started successfully');
    });

    it('should handle callback request with HMAC verification', async () => {
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
      
      // @ts-expect-error - Test mock, type mismatch is acceptable
      vi.mocked(core.sbForUser).mockReturnValue({
        from: vi.fn().mockReturnValue({
          select: mockSelect,
          update: mockUpdate
        })
      });

      const callbackPayload = {
        runId: '550e8400-e29b-41d4-a716-446655440001',
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
      expect(result.outputData).toEqual({ 
        callId: 'call-123',
        duration: 120,
        qualificationScore: 85,
        summary: 'Lead qualified successfully',
        nextSteps: ['Schedule follow-up call', 'Send proposal']
      });
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
