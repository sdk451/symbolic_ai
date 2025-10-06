interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }>;
}
import { 
  verifyUser, 
  sbForUser, 
  insertAudit, 
  checkRateLimit,
  recordRateLimitUsage,
  getWebhookConfig
} from './lib/core';
import { 
  DemoExecutionRequestSchema,
  DemoRunResponseSchema,
  RateLimitConfig,
  validateDemoInput,
  DEMO_CONFIGS
} from './lib/schemas';

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    console.log('AI Appointment Scheduler demo execution request received');
    console.log('Event:', JSON.stringify(event, null, 2));
    
    // For demo purposes, skip authentication if Supabase is not configured
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let userId = 'demo-user';
    
    // Only verify authentication if Supabase is properly configured
    if (supabaseUrl && supabaseServiceKey) {
      const authHeader = event.headers.authorization || event.headers.Authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: 'Unauthorized',
            message: 'Missing or invalid authorization header',
            code: 'UNAUTHORIZED'
          })
        };
      }

      const token = authHeader.substring(7);
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error || !user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
            code: 'UNAUTHORIZED'
          })
        };
      }
      
      userId = user.id;
      console.log('User verified:', user?.id);
    } else {
      console.log('Running in demo mode without authentication');
    }
    
    // Check rate limiting (skip in demo mode)
    if (supabaseUrl && supabaseServiceKey) {
      const canExecute = await checkRateLimit(
        userId, 
        RateLimitConfig.DEMO_EXECUTION.action, 
        RateLimitConfig.DEMO_EXECUTION.limit, 
        RateLimitConfig.DEMO_EXECUTION.windowMs
      );
      
      if (!canExecute) {
        return {
          statusCode: 429,
          headers,
          body: JSON.stringify({
            error: 'Rate limit exceeded',
            message: 'Too many demo executions. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
          })
        };
      }
    }
    
    // Parse and validate request
    const body = JSON.parse(event.body || '{}');
    const demoId = 'ai-appointment-scheduler';
    
    const requestData = DemoExecutionRequestSchema.parse({
      demoId,
      ...body
    });
    
    // Validate demo ID exists in configuration
    const demoConfig = DEMO_CONFIGS[demoId as keyof typeof DEMO_CONFIGS];
    if (!demoConfig) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Invalid Demo ID',
          message: `Demo type '${demoId}' is not supported`,
          code: 'INVALID_DEMO_ID'
        })
      };
    }
    
    // Validate demo-specific input data
    let validatedInputData: Record<string, unknown> = {};
    if (requestData.inputData) {
      try {
        validatedInputData = validateDemoInput(demoId, requestData.inputData);
      } catch (validationError) {
        if (validationError instanceof Error && validationError.name === 'ZodError') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              error: 'Validation Error',
              message: 'Invalid input data for this demo type',
              code: 'VALIDATION_ERROR'
            })
          };
        }
        throw validationError;
      }
    }
    
    // For demo mode, create a mock demo run record
    let demoRun;
    if (supabaseUrl && supabaseServiceKey) {
      // Get Supabase client
      const supabase = sbForUser();
      
      // Create demo run record
      const { data, error: insertError } = await supabase
        .from('demo_runs')
        .insert({
          user_id: userId,
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
      
      demoRun = data;
    } else {
      // Demo mode - create mock demo run
      demoRun = {
        id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        demo_id: demoId,
        status: 'queued',
        input_data: validatedInputData,
        created_at: new Date().toISOString()
      };
    }
    
    // Record rate limit usage (skip in demo mode)
    if (supabaseUrl && supabaseServiceKey) {
      await recordRateLimitUsage(userId, RateLimitConfig.DEMO_EXECUTION.action);
      
      // Log audit event
      await insertAudit(userId, 'demo_execution_started', {
        demoId,
        runId: demoRun.id,
        inputData: validatedInputData
      });
    }
    
    // Get webhook configuration for this demo type
    const webhookConfig = getWebhookConfig(demoId);
    
    const webhookPayload = {
      runId: demoRun.id,
      userId: userId,
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
    const webhookHeaders: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    // Add basic auth if username and password are provided
    if (webhookConfig.username && webhookConfig.password) {
      const auth = Buffer.from(`${webhookConfig.username}:${webhookConfig.password}`).toString('base64');
      webhookHeaders['Authorization'] = `Basic ${auth}`;
    }
    
    // Fire and forget - n8n will call back with results
    fetch(webhookConfig.url, {
      method: 'POST',
      headers: webhookHeaders,
      body: payloadString
    }).catch(error => {
      console.error('Failed to call n8n webhook:', error);
      // In demo mode, we don't update database
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = sbForUser();
        supabase
          .from('demo_runs')
          .update({ 
            status: 'failed', 
            error_message: 'Failed to initiate demo execution',
            completed_at: new Date().toISOString()
          })
          .eq('id', demoRun.id);
      }
    });
    
    // Return response
    const response = DemoRunResponseSchema.parse({
      id: demoRun.id,
      status: 'queued',
      demoId,
      message: 'Demo execution started successfully',
      estimatedDuration: demoConfig.timeout
    });
    
    return {
      statusCode: 202,
      headers,
      body: JSON.stringify(response)
    };
    
  } catch (error) {
    console.error('Demo execution error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Demo Execution Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'EXECUTION_ERROR'
      })
    };
  }
};
