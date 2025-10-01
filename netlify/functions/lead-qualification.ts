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

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: 'Method not allowed',
        message: 'Only POST requests are allowed',
        code: 'METHOD_NOT_ALLOWED'
      })
    };
  }

  try {
    // For now, we'll skip authentication and just send the form data to n8n
    // This is a simple webhook submission that doesn't require user verification

    // Parse and validate request body
    const body = JSON.parse(event.body || '{}');
    
    // Validate required fields
    const { firstname, lastname, email, phone, companywebsite, request, runId, website } = body;
    
    if (!firstname || !lastname || !email || !phone || !companywebsite || !request) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing required fields',
          message: 'First name, last name, email, phone, company website, and request are required',
          code: 'MISSING_FIELDS'
        })
      };
    }
    
    // Honeypot spam detection
    if (website && website.trim() !== '') {
      console.log('Spam detected: honeypot field was filled');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Spam submission detected',
          message: 'Invalid submission',
          code: 'SPAM_DETECTED'
        })
      };
    }
    
    // Get webhook configuration
    const webhookConfig = getWebhookConfig('speed-to-lead-qualification');
    
    // Prepare form data for n8n (nested data structure as expected by n8n)
    const formData = {
      data: {
        category: 'lead_qualification',
        firstname,
        lastname,
        email,
        phone,
        companywebsite,
        request,
        runId: runId || `lq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      }
    };
    
    // Call n8n webhook with timeout and error handling
    try {
      console.log('Calling webhook:', webhookConfig.url);
      console.log('Payload:', JSON.stringify(formData));
      console.log('Headers:', {
        'Content-Type': 'application/json',
        'x-api-key': 'symbo0l!cai^123@z'
      });
      
      // Add timeout using Promise.race with x-api-key authentication
      const fetchPromise = fetch(webhookConfig.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'symbo0l!cai^123@z'
        },
        body: JSON.stringify(formData)
      });
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
      );
      
      console.log('Starting fetch request...');
      const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
      console.log('Fetch request completed');
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Webhook error:', errorText);
        
        // Handle 404 as webhook not registered (expected in development)
        if (response.status === 404) {
          console.log('Webhook not registered, returning default response');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              success: true,
              message: 'Form submitted successfully (webhook not active)',
              runId: formData.runId,
              n8nResponse: {
                qualified: true,
                message: 'Form submitted... lead qualified (webhook not active)'
              }
            })
          };
        }
        
        throw new Error(`Webhook failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Parse response
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      let n8nResponse;
      if (responseText) {
        try {
          n8nResponse = JSON.parse(responseText);
        } catch (parseError) {
          console.warn('Response is not JSON, using default response:', parseError);
          n8nResponse = {
            qualified: true,
            message: 'Form submitted successfully'
          };
        }
      } else {
        n8nResponse = {
          qualified: true,
          message: 'Form submitted successfully'
        };
      }
      
      // Return the n8n response to the frontend
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Form submitted successfully',
          runId: formData.runId,
          n8nResponse
        })
      };
      
    } catch (webhookError) {
      console.error('Webhook call failed:', webhookError);
      console.error('Error details:', {
        message: webhookError.message,
        name: webhookError.name,
        stack: webhookError.stack,
        cause: webhookError.cause
      });
      throw webhookError;
    }
    
  } catch (error) {
    console.error('Lead qualification submission error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Submission Failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        code: 'SUBMISSION_ERROR'
      })
    };
  }
};

