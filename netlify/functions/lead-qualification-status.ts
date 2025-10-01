// Netlify Functions handler type
interface Handler {
  (event: any, context: any): Promise<{
    statusCode: number;
    headers: Record<string, string>;
    body: string;
  }>;
}

export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        error: 'Method not allowed',
        message: 'Only GET requests are allowed',
        code: 'METHOD_NOT_ALLOWED'
      })
    };
  }

  try {
    // Get runId from query parameters
    const { runId } = event.queryStringParameters || {};
    
    if (!runId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: 'Missing runId',
          message: 'runId query parameter is required',
          code: 'MISSING_RUN_ID'
        })
      };
    }

    // For now, we'll simulate periodic updates
    // In a real implementation, this would check a database or cache for the latest status
    const statuses = [
      "Submitting form data to lead qualification agent...",
      "Analyzing company information...",
      "Researching company background...",
      "Evaluating lead qualification criteria...",
      "Generating personalized response...",
      "Finalizing lead qualification assessment..."
    ];

    // Simulate progress based on runId timestamp
    const runTimestamp = parseInt(runId.split('_')[1]);
    const elapsed = Date.now() - runTimestamp;
    const progressIndex = Math.min(Math.floor(elapsed / 3000), statuses.length - 1);
    
    const currentStatus = statuses[progressIndex];
    const isComplete = progressIndex >= statuses.length - 1;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        runId,
        status: currentStatus,
        isComplete,
        progress: Math.min((progressIndex + 1) / statuses.length * 100, 100)
      })
    };

  } catch (error) {
    console.error('Lead qualification status error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Status Error',
        message: error instanceof Error ? error.message : 'Failed to get lead qualification status',
        code: 'STATUS_ERROR'
      })
    };
  }
};
