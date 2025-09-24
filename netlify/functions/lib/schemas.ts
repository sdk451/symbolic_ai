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

// Demo-specific input schemas
export const SpeedToLeadQualificationInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  request: z.string().min(1, 'Request description is required')
});

export const CustomerServiceChatbotInputSchema = z.object({
  sessionId: z.string().optional(),
  messageCount: z.number().default(0),
  startTime: z.string().optional()
});

export const AIAppointmentSchedulerInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Valid email is required'),
  requestedTime: z.string().optional()
});

// Demo-specific output schemas
export const SpeedToLeadQualificationOutputSchema = z.object({
  callId: z.string(),
  duration: z.number(),
  qualificationScore: z.number().min(0).max(100),
  summary: z.string(),
  nextSteps: z.array(z.string())
});

export const CustomerServiceChatbotOutputSchema = z.object({
  totalMessages: z.number(),
  avgResponseTime: z.number(),
  userSatisfaction: z.number().min(1).max(5),
  conversationSummary: z.string()
});

export const AIAppointmentSchedulerOutputSchema = z.object({
  appointmentId: z.string(),
  scheduledTime: z.string(),
  duration: z.number(),
  confirmationCode: z.string(),
  calendarLink: z.string().url()
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

// Demo type validation function
export const validateDemoInput = (demoId: string, inputData: Record<string, unknown>) => {
  switch (demoId) {
    case 'speed-to-lead-qualification':
      return SpeedToLeadQualificationInputSchema.parse(inputData);
    case 'customer-service-chatbot':
      return CustomerServiceChatbotInputSchema.parse(inputData);
    case 'ai-appointment-scheduler':
      return AIAppointmentSchedulerInputSchema.parse(inputData);
    default:
      // For other demo types, use generic validation
      return inputData;
  }
};

// Demo type output validation function
export const validateDemoOutput = (demoId: string, outputData: Record<string, unknown>) => {
  switch (demoId) {
    case 'speed-to-lead-qualification':
      return SpeedToLeadQualificationOutputSchema.parse(outputData);
    case 'customer-service-chatbot':
      return CustomerServiceChatbotOutputSchema.parse(outputData);
    case 'ai-appointment-scheduler':
      return AIAppointmentSchedulerOutputSchema.parse(outputData);
    default:
      // For other demo types, use generic validation
      return outputData;
  }
};

// Demo configuration registry
export const DEMO_CONFIGS = {
  'speed-to-lead-qualification': {
    id: 'speed-to-lead-qualification',
    name: 'AI Speed to Lead Qualification Agent',
    description: 'Experience how our AI agent qualifies leads and schedules appointments automatically',
    timeout: 300, // 5 minutes for VAPI calls
    maxRetries: 2,
    requiresAuth: true,
    allowedPersonas: ['SMB', 'EXEC', 'FREELANCER']
  },
  'customer-service-chatbot': {
    id: 'customer-service-chatbot',
    name: 'Customer Service Chatbot',
    description: 'Test our intelligent chatbot that handles customer inquiries with human-like responses',
    timeout: 180, // 3 minutes for chat sessions
    maxRetries: 3,
    requiresAuth: true,
    allowedPersonas: ['SMB', 'EXEC', 'FREELANCER', 'SOLO']
  },
  'ai-appointment-scheduler': {
    id: 'ai-appointment-scheduler',
    name: 'AI Appointment Scheduler',
    description: 'Try our AI-powered scheduling system that calls you and finds available appointment times',
    timeout: 300, // 5 minutes for VAPI calls
    maxRetries: 2,
    requiresAuth: true,
    allowedPersonas: ['SMB', 'EXEC', 'FREELANCER', 'SOLO']
  }
} as const;

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
