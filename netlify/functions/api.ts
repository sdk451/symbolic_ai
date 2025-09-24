// Hono API entrypoint for Netlify Functions
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { 
  verifyUser, 
  sbForUser, 
  insertAudit, 
  withEnv,
  checkRateLimit,
  recordRateLimitUsage,
  getWebhookConfig
} from './lib/core';
import { 
  DemoExecutionRequestSchema,
  DemoRunResponseSchema,
  CallbackPayloadSchema,
  RateLimitConfig,
  ErrorResponseSchema,
  validateDemoInput,
  validateDemoOutput,
  DEMO_CONFIGS
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
    
    // Validate demo ID exists in configuration
    const demoConfig = DEMO_CONFIGS[demoId as keyof typeof DEMO_CONFIGS];
    if (!demoConfig) {
      return c.json({
        error: 'Invalid Demo ID',
        message: `Demo type '${demoId}' is not supported`,
        code: 'INVALID_DEMO_ID'
      }, 400);
    }
    
    // Validate demo-specific input data
    let validatedInputData: Record<string, unknown> = {};
    if (requestData.inputData) {
      try {
        validatedInputData = validateDemoInput(demoId, requestData.inputData);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return c.json({
            error: 'Validation Error',
            message: 'Invalid input data for this demo type',
            code: 'VALIDATION_ERROR',
            details: validationError.errors
          }, 400);
        }
        throw validationError;
      }
    }
    
    // Get Supabase client
    const supabase = sbForUser();
    
    // Create demo run record
    const { data: demoRun, error: insertError } = await supabase
      .from('demo_runs')
      .insert({
        user_id: user.id,
        demo_id: demoId,
        status: 'queued',
        input_data: validatedInputData,
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
      inputData: validatedInputData
    });
    
    // Get webhook configuration for this demo type
    const webhookConfig = getWebhookConfig(demoId);
    
    const webhookPayload = {
      runId: demoRun.id,
      userId: user.id,
      demoId,
      demoConfig: {
        name: demoConfig.name,
        description: demoConfig.description,
        timeout: demoConfig.timeout,
        maxRetries: demoConfig.maxRetries
      },
      inputData: validatedInputData,
      timestamp: new Date().toISOString()
    };
    
    const payloadString = JSON.stringify(webhookPayload);
    
    // Prepare headers with basic auth
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add basic auth if username and password are provided
    if (webhookConfig.username && webhookConfig.password) {
      const auth = Buffer.from(`${webhookConfig.username}:${webhookConfig.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    // Fire and forget - n8n will call back with results
    fetch(webhookConfig.url, {
      method: 'POST',
      headers,
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
      estimatedDuration: demoConfig.timeout
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
    
    // Parse request body
    const body = await c.req.text();
    
    // Get the demo run to validate it exists
    const supabase = sbForUser();
    const { data: demoRun, error: fetchError } = await supabase
      .from('demo_runs')
      .select('demo_id')
      .eq('id', runId)
      .single();
    
    if (fetchError || !demoRun) {
      return c.json({
        error: 'Demo run not found',
        message: 'The specified demo run does not exist',
        code: 'DEMO_RUN_NOT_FOUND'
      }, 404);
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
    
    // We already have the demo run from the validation above
    
    // Validate demo-specific output data if provided
    let validatedOutputData: Record<string, unknown> = {};
    if (callbackData.outputData) {
      try {
        validatedOutputData = validateDemoOutput(demoRun.demo_id, callbackData.outputData);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          return c.json({
            error: 'Validation Error',
            message: 'Invalid output data for this demo type',
            code: 'VALIDATION_ERROR',
            details: validationError.errors
          }, 400);
        }
        throw validationError;
      }
    }
    
    // Update demo run with results
    const { error: updateError } = await supabase
      .from('demo_runs')
      .update({
        status: callbackData.status,
        output_data: validatedOutputData,
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
    
    const supabase = sbForUser();
    
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

