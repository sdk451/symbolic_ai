// Netlify Functions handler type
interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }>;
}

// import { createSupabaseClient } from './lib/core';
import { getCachedStatus } from './lib/statusCache';

export const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Get runId from query parameters
    const runId = event.queryStringParameters?.runId;
    
    if (!runId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required parameter: runId' 
        })
      };
    }

    console.log('Getting status for runId:', runId);

    // Get the cached status update
    const cachedStatus = getCachedStatus(runId);
    
    if (cachedStatus) {
      console.log('Returning cached status:', cachedStatus);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          ...cachedStatus
        })
      };
    } else {
      // No status found yet, return initial status
      const initialStatus = {
        runId: runId,
        status: 'Form submission received',
        statusMessage: 'Commencing company research...',
        qualified: false,
        output: null,
        callSummary: null,
        callNotes: null,
        updatedAt: new Date().toISOString()
      };
      
      console.log('No cached status found, returning initial status:', initialStatus);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true,
          ...initialStatus
        })
      };
    }

  } catch (error) {
    console.error('Error retrieving status:', error);
    
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
