export const handler = async (event: any, context: any) => {
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
    
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    console.log('Request body:', body);
    
    // Create a mock demo run ID
    const demoRunId = `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Return success response
    return {
      statusCode: 202,
      headers,
      body: JSON.stringify({
        id: demoRunId,
        status: 'queued',
        demoId: 'ai-appointment-scheduler',
        message: 'Demo execution started successfully',
        estimatedDuration: 300
      })
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
