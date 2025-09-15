// Hono API entrypoint for Netlify Functions
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { 
  verifyUser, 
  sbForUser, 
  insertAudit, 
  hmacSign, 
  hmacVerify, 
  withEnv,
  checkRateLimit,
  recordRateLimitUsage
} from './lib/core';
import { 
  DemoExecutionRequestSchema,
  DemoRunResponseSchema,
  CallbackPayloadSchema,
  RateLimitConfig,
  ErrorResponseSchema
} from './lib/schemas';

const app = new Hono();

// CORS middleware
app.use('*', cors({ 
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true 
}));

// Error handler middleware
app.onError((err, c) => {
  console.error('API Error:', err);
  
  const errorResponse: z.infer<typeof ErrorResponseSchema> = {
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred',
    code: 'INTERNAL_ERROR'
  };
  
  return c.json(errorResponse, 500);
});

// POST /api/demos/:demoId/run - Execute a demo
app.post('/api/demos/:demoId/run', async (c) => {
  try {
    // Verify user authentication
    const user = await verifyUser(c.req);
    
    // Check rate limiting
    const canExecute = await checkRateLimit(
      user.id, 
      RateLimitConfig.DEMO_EXECUTION.action, 
      RateLimitConfig.DEMO_EXECUTION.limit, 
      RateLimitConfig.DEMO_EXECUTION.windowMs
    );
    
    if (!canExecute) {
      return c.json({
        error: 'Rate limit exceeded',
        message: 'Too many demo executions. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED'
      }, 429);
    }
    
    // Parse and validate request
    const demoId = c.req.param('demoId');
    const body = await c.req.json();
    
    const requestData = DemoExecutionRequestSchema.parse({
      demoId,
      ...body
    });
    
    // Get Supabase client
    const supabase = sbForUser(user.id);
    
    // Create demo run record
    const { data: demoRun, error: insertError } = await supabase
      .from('demo_runs')
      .insert({
        user_id: user.id,
        demo_id: demoId,
        status: 'queued',
        input_data: requestData.inputData || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (insertError) {
      throw new Error(`Failed to create demo run: ${insertError.message}`);
    }
    
    // Record rate limit usage
    await recordRateLimitUsage(user.id, RateLimitConfig.DEMO_EXECUTION.action);
    
    // Log audit event
    await insertAudit(user.id, 'demo_execution_started', {
      demoId,
      runId: demoRun.id,
      inputData: requestData.inputData
    });
    
    // Call n8n webhook (async)
    const n8nWebhookUrl = withEnv('N8N_WEBHOOK_URL');
    const webhookSecret = withEnv('N8N_WEBHOOK_SECRET');
    
    const webhookPayload = {
      runId: demoRun.id,
      userId: user.id,
      demoId,
      inputData: requestData.inputData,
      timestamp: new Date().toISOString()
    };
    
    const payloadString = JSON.stringify(webhookPayload);
    const signature = hmacSign(payloadString, webhookSecret);
    
    // Fire and forget - n8n will call back with results
    fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': new Date().toISOString()
      },
      body: payloadString
    }).catch(error => {
      console.error('Failed to call n8n webhook:', error);
      // Update demo run status to failed
      supabase
        .from('demo_runs')
        .update({ 
          status: 'failed', 
          error_message: 'Failed to initiate demo execution',
          completed_at: new Date().toISOString()
        })
        .eq('id', demoRun.id);
    });
    
    // Return response
    const response = DemoRunResponseSchema.parse({
      id: demoRun.id,
      status: 'queued',
      demoId,
      message: 'Demo execution started successfully',
      estimatedDuration: 120 // 2 minutes default
    });
    
    return c.json(response, 202);
    
  } catch (error) {
    console.error('Demo execution error:', error);
    
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation Error',
        message: 'Invalid request data',
        code: 'VALIDATION_ERROR',
        details: error.errors
      }, 400);
    }
    
    return c.json({
      error: 'Demo Execution Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'EXECUTION_ERROR'
    }, 500);
  }
});

// POST /api/demos/:runId/callback - Handle n8n webhook callbacks
app.post('/api/demos/:runId/callback', async (c) => {
  try {
    const runId = c.req.param('runId');
    
    // Verify HMAC signature
    const signature = c.req.header('X-Signature');
    const timestamp = c.req.header('X-Timestamp');
    const body = await c.req.text();
    
    if (!signature || !timestamp) {
      return c.json({
        error: 'Missing signature or timestamp',
        message: 'HMAC verification failed',
        code: 'MISSING_SIGNATURE'
      }, 401);
    }
    
    const webhookSecret = withEnv('N8N_WEBHOOK_SECRET');
    const expectedSignature = hmacSign(body, webhookSecret);
    
    if (!hmacVerify(body, signature, webhookSecret)) {
      return c.json({
        error: 'Invalid signature',
        message: 'HMAC verification failed',
        code: 'INVALID_SIGNATURE'
      }, 401);
    }
    
    // Check timestamp to prevent replay attacks (5 minute window)
    const requestTime = new Date(timestamp).getTime();
    const currentTime = Date.now();
    const timeDiff = Math.abs(currentTime - requestTime);
    
    if (timeDiff > 5 * 60 * 1000) { // 5 minutes
      return c.json({
        error: 'Request too old',
        message: 'Timestamp is outside acceptable window',
        code: 'TIMESTAMP_TOO_OLD'
      }, 401);
    }
    
    // Parse callback payload
    const callbackData = CallbackPayloadSchema.parse(JSON.parse(body));
    
    if (callbackData.runId !== runId) {
      return c.json({
        error: 'Run ID mismatch',
        message: 'Callback run ID does not match URL parameter',
        code: 'RUN_ID_MISMATCH'
      }, 400);
    }
    
    // Get Supabase client (service role for callbacks)
    const supabase = sbForUser('service');
    
    // Update demo run with results
    const { error: updateError } = await supabase
      .from('demo_runs')
      .update({
        status: callbackData.status,
        output_data: callbackData.outputData,
        error_message: callbackData.errorMessage,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', runId);
    
    if (updateError) {
      throw new Error(`Failed to update demo run: ${updateError.message}`);
    }
    
    // Log audit event
    await insertAudit('system', 'demo_callback_received', {
      runId,
      status: callbackData.status,
      executionTime: callbackData.executionTime
    });
    
    return c.json({ 
      success: true, 
      message: 'Callback processed successfully' 
    });
    
  } catch (error) {
    console.error('Callback processing error:', error);
    
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation Error',
        message: 'Invalid callback data',
        code: 'VALIDATION_ERROR',
        details: error.errors
      }, 400);
    }
    
    return c.json({
      error: 'Callback Processing Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'CALLBACK_ERROR'
    }, 500);
  }
});

// GET /api/demos/:runId/status - Get demo run status
app.get('/api/demos/:runId/status', async (c) => {
  try {
    const user = await verifyUser(c.req);
    const runId = c.req.param('runId');
    
    const supabase = sbForUser(user.id);
    
    const { data: demoRun, error } = await supabase
      .from('demo_runs')
      .select('*')
      .eq('id', runId)
      .eq('user_id', user.id)
      .single();
    
    if (error || !demoRun) {
      return c.json({
        error: 'Demo run not found',
        message: 'The specified demo run does not exist or you do not have access to it',
        code: 'NOT_FOUND'
      }, 404);
    }
    
    return c.json({
      id: demoRun.id,
      status: demoRun.status,
      demoId: demoRun.demo_id,
      inputData: demoRun.input_data,
      outputData: demoRun.output_data,
      errorMessage: demoRun.error_message,
      startedAt: demoRun.started_at,
      completedAt: demoRun.completed_at,
      createdAt: demoRun.created_at,
      updatedAt: demoRun.updated_at
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    
    return c.json({
      error: 'Status Check Failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'STATUS_ERROR'
    }, 500);
  }
});

export const handler = app.fetch;

