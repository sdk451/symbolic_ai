// Netlify Functions handler type
interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }>;
}
import { 
  getWebhookConfig
} from './lib/core';

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
    console.log('🔐 Chatbot endpoint called');
    
    // Verify user authentication from Netlify event
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
    
    // Create Supabase client with environment variables
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Server Configuration Error',
          message: 'Missing Supabase configuration',
          code: 'CONFIG_ERROR'
        })
      };
    }
    
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
    
    console.log('🔐 User verified:', user?.id);
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    console.log('🔐 Request body:', body);
    const { sessionId, message, action = 'message' } = body;
    
    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing session ID',
          message: 'Session ID is required for chatbot interactions',
          code: 'MISSING_SESSION_ID'
        })
      };
    }
    
    // Get webhook configuration for chatbot
    const webhookConfig = getWebhookConfig('customer-service-chatbot');
    
    // Prepare the payload for n8n
    const webhookPayload = {
      sessionId,
      message: message || '',
      action,
      timestamp: new Date().toISOString(),
      userId: user.id
    };
    
    // Call n8n webhook directly (no auth header needed)
    const response = await fetch(webhookConfig.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhookPayload)
    });
    
    if (!response.ok) {
      throw new Error(`n8n webhook failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Return the response from n8n
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: data.response || data.message || "Thank you for your message. I'm processing your request.",
        sessionId,
        timestamp: new Date().toISOString()
      })
    };
    
  } catch (error) {
    console.error('Chatbot message error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Chatbot Error',
        message: error instanceof Error ? error.message : 'Failed to process chatbot message',
        code: 'CHATBOT_ERROR'
      })
    };
  }
};
