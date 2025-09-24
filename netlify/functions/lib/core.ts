import { createClient } from '@supabase/supabase-js';
import { HonoRequest } from 'hono';

// Environment variables
export const withEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

// Get webhook configuration for specific demo types
export const getWebhookConfig = (demoId: string) => {
  // For customer-service-chatbot, use the specific webhook (no auth needed)
  if (demoId === 'customer-service-chatbot') {
    return {
      url: 'https://n8n.srv995431.hstgr.cloud/webhook/0c43d2e2-2990-4e61-9d0b-4f5a98e6dab5/chat'
    };
  }
  
  // For other demos, use default configuration
  return {
    url: withEnv('N8N_WEBHOOK_URL'),
    username: process.env.N8N_WEBHOOK_USERNAME || '',
    password: process.env.N8N_WEBHOOK_PASSWORD || ''
  };
};

// Supabase client for server-side operations
export const createSupabaseClient = () => {
  const supabaseUrl = withEnv('SUPABASE_URL');
  const supabaseServiceKey = withEnv('SUPABASE_SERVICE_ROLE_KEY');
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// User verification from JWT token
export const verifyUser = async (req: HonoRequest) => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7);
  const supabase = createSupabaseClient();
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    throw new Error('Invalid or expired token');
  }
  
  return user;
};

// Get Supabase client for authenticated user
export const sbForUser = () => {
  const supabase = createSupabaseClient();
  return supabase;
};


// Audit logging
export const insertAudit = async (userId: string, action: string, details: Record<string, unknown>) => {
  const supabase = createSupabaseClient();
  
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      user_id: userId,
      action,
      details,
      created_at: new Date().toISOString()
    });
    
  if (error) {
    console.error('Failed to insert audit log:', error);
  }
};

// Rate limiting helper
export const checkRateLimit = async (userId: string, action: string, limit: number, windowMs: number): Promise<boolean> => {
  const supabase = createSupabaseClient();
  const windowStart = new Date(Date.now() - windowMs).toISOString();
  
  const { data, error } = await supabase
    .from('rate_limits')
    .select('count')
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', windowStart);
    
  if (error) {
    console.error('Rate limit check failed:', error);
    return false; // Allow on error to avoid blocking users
  }
  
  const currentCount = data?.reduce((sum, record) => sum + record.count, 0) || 0;
  return currentCount < limit;
};

// Record rate limit usage
export const recordRateLimitUsage = async (userId: string, action: string) => {
  const supabase = createSupabaseClient();
  
  const { error } = await supabase
    .from('rate_limits')
    .insert({
      user_id: userId,
      action,
      count: 1,
      created_at: new Date().toISOString()
    });
    
  if (error) {
    console.error('Failed to record rate limit usage:', error);
  }
};
