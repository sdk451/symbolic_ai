// Netlify Functions handler type
interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }>;
}

import { getCachedStatus } from './lib/statusCache';

// Store active SSE connections
const activeConnections = new Map<string, any>();

export const handler: Handler = async (event) => {
  // Set SSE headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Cache-Control',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: 'Method not allowed'
    };
  }

  try {
    // Get runId from query parameters
    const runId = event.queryStringParameters?.runId;
    
    if (!runId) {
      return {
        statusCode: 400,
        headers,
        body: 'Missing required parameter: runId'
      };
    }

    console.log('SSE connection established for runId:', runId);

    // For Netlify Functions, we'll use a simpler approach with polling
    // Store the connection info and return a simple response
    activeConnections.set(runId, { connected: true, timestamp: Date.now() });
    
    // Send initial connection message and current status
    const currentStatus = getCachedStatus(runId);
    let responseData = `data: ${JSON.stringify({ 
      type: 'connected', 
      runId,
      message: 'Connected to status updates'
    })}\n\n`;
    
    if (currentStatus) {
      responseData += `data: ${JSON.stringify({ 
        type: 'status_update', 
        ...currentStatus
      })}\n\n`;
    }

    return {
      statusCode: 200,
      headers,
      body: responseData
    };

  } catch (error) {
    console.error('Error in SSE handler:', error);
    
    return {
      statusCode: 500,
      headers,
      body: 'Internal server error'
    };
  }
};

// Function to broadcast status updates to connected clients
export const broadcastStatusUpdate = (statusUpdate: any) => {
  const controller = activeConnections.get(statusUpdate.runId);
  if (controller) {
    const data = JSON.stringify({ 
      type: 'status_update', 
      ...statusUpdate
    });
    controller.enqueue(`data: ${data}\n\n`);
    console.log('Broadcasted status update to SSE client:', statusUpdate.runId);
  }
};
