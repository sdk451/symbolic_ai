import { z } from 'zod';

// Demo run status enum
export const DemoRunStatus = z.enum(['queued', 'running', 'succeeded', 'failed', 'cancelled']);

// Demo execution request schema
export const DemoExecutionRequestSchema = z.object({
  demoId: z.string().min(1, 'Demo ID is required'),
  inputData: z.record(z.any()).optional(),
  options: z.object({
    timeout: z.number().min(30).max(300).optional(), // 30 seconds to 5 minutes
    priority: z.enum(['low', 'normal', 'high']).optional()
  }).optional()
});

// Demo run response schema
export const DemoRunResponseSchema = z.object({
  id: z.string().uuid(),
  status: DemoRunStatus,
  demoId: z.string(),
  message: z.string(),
  estimatedDuration: z.number().optional()
});

// Callback payload schema (from n8n)
export const CallbackPayloadSchema = z.object({
  runId: z.string().uuid(),
  status: DemoRunStatus,
  outputData: z.record(z.any()).optional(),
  errorMessage: z.string().optional(),
  executionTime: z.number().optional(), // in milliseconds
  metadata: z.record(z.any()).optional()
});

// HMAC signature validation schema
export const HmacSignatureSchema = z.object({
  signature: z.string().min(1, 'Signature is required'),
  timestamp: z.string().min(1, 'Timestamp is required'),
  payload: z.string().min(1, 'Payload is required')
});

// Rate limit configuration
export const RateLimitConfig = {
  DEMO_EXECUTION: {
    limit: 10, // 10 demos per hour
    windowMs: 60 * 60 * 1000, // 1 hour
    action: 'demo_execution'
  },
  CALLBACK: {
    limit: 100, // 100 callbacks per hour
    windowMs: 60 * 60 * 1000, // 1 hour
    action: 'callback'
  }
} as const;

// Demo configuration schema
export const DemoConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  n8nWebhookUrl: z.string().url(),
  timeout: z.number().default(120), // 2 minutes default
  maxRetries: z.number().default(3),
  requiresAuth: z.boolean().default(true),
  allowedPersonas: z.array(z.string()).optional()
});

// Error response schema
export const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.record(z.any()).optional()
});

// Types derived from schemas
export type DemoExecutionRequest = z.infer<typeof DemoExecutionRequestSchema>;
export type DemoRunResponse = z.infer<typeof DemoRunResponseSchema>;
export type CallbackPayload = z.infer<typeof CallbackPayloadSchema>;
export type HmacSignature = z.infer<typeof HmacSignatureSchema>;
export type DemoConfig = z.infer<typeof DemoConfigSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type DemoRunStatusType = z.infer<typeof DemoRunStatus>;
