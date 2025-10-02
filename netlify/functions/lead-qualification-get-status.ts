// Netlify Functions handler type
interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }>;
}

// import { createSupabaseClient } from './lib/core';

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

    // For now, return a mock response (database storage disabled for testing)
    // TODO: Re-enable database retrieval once environment variables are configured
    
    // Mock response for testing
    const mockStatus = {
      runId: runId,
      status: 'Form submission received',
      statusMessage: 'Commencing company research...',
      qualified: false,
      output: null,
      callSummary: null,
      callNotes: null,
      updatedAt: new Date().toISOString()
    };

    console.log('Returning mock status:', mockStatus);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        ...mockStatus
      })
    };

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
