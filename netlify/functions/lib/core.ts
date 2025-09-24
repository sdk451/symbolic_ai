import { createClient } from '@supabase/supabase-js';
import { HonoRequest } from 'hono';
import crypto from 'crypto-js';

// Environment variables
export const withEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
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

// HMAC signing for webhook security
export const hmacSign = (payload: string, secret: string): string => {
  return crypto.HmacSHA256(payload, secret).toString();
};

// HMAC verification for webhook security
export const hmacVerify = (payload: string, signature: string, secret: string): boolean => {
  const expectedSignature = hmacSign(payload, secret);
  // Use constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < signature.length; i++) {
    result |= signature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }
  
  return result === 0;
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
