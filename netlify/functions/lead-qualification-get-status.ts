import { Handler } from '@netlify/functions';
import { createSupabaseClient } from './lib/core';

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

    // Create Supabase client
    const supabase = createSupabaseClient();

    // Get the latest status for this runId
    const { data, error } = await supabase
      .from('lead_qualification_status')
      .select('*')
      .eq('run_id', runId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            error: 'No status found for this runId',
            runId: runId
          })
        };
      }
      
      console.error('Database error:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Failed to retrieve status',
          details: error.message 
        })
      };
    }

    console.log('Retrieved status:', data);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true,
        runId: data.run_id,
        status: data.status,
        statusMessage: data.status_message,
        qualified: data.qualified,
        output: data.output,
        callSummary: data.call_summary,
        callNotes: data.call_notes,
        updatedAt: data.updated_at
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
