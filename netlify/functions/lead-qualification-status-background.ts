// Netlify Functions handler type
interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }>;
}

// import { createSupabaseClient } from './lib/core';
import { cacheStatusUpdate } from './lib/statusCache';
import { broadcastStatusUpdate } from './lead-qualification-sse';

interface StatusUpdate {
  runId: string;
  status: string;
  statusMessage: string;
  qualified?: boolean;
  output?: string;
  callSummary?: string;
  callNotes?: string;
  timestamp?: string;
}

export const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
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

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check for API key authentication
  const apiKey = event.headers['x-api-key'] || event.headers['X-Api-Key'];
  const expectedApiKey = 'symbo0l!cai^123@z';
  
  if (!apiKey || apiKey !== expectedApiKey) {
    console.log('Unauthorized access attempt - missing or invalid API key');
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ 
        error: 'Unauthorized',
        message: 'Valid API key required'
      })
    };
  }

  try {
    // Parse the incoming status update
    const statusUpdate: StatusUpdate = JSON.parse(event.body || '{}');
    
    console.log('Received status update:', statusUpdate);

    // Validate required fields
    if (!statusUpdate.runId || !statusUpdate.status || !statusUpdate.statusMessage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields: runId, status, statusMessage' 
        })
      };
    }

    // Cache the status update for real-time display
    cacheStatusUpdate(statusUpdate);
    
    // Broadcast the update to connected SSE clients
    broadcastStatusUpdate(statusUpdate);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: 'Status update received and stored',
        runId: statusUpdate.runId
      })
    };

  } catch (error) {
    console.error('Error processing status update:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};