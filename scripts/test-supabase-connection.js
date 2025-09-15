// Test script to check Supabase connection and database structure
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseAnonKey ? supabaseAnonKey.length : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n🔍 Testing basic connection...');
    
    // Test basic connection
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection error:', error);
      
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('\n💡 The "profiles" table does not exist in your database.');
        console.log('You need to run the migration to create it.');
        console.log('\nTo fix this:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Open the SQL Editor');
        console.log('3. Run the SQL from supabase/migrations/20250915000438_bold_queen.sql');
      }
      
      return;
    }
    
    console.log('✅ Database connection successful');
    console.log('✅ Profiles table exists');
    
    // Test auth signup
    console.log('\n🔍 Testing auth signup...');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'testpassword123',
      options: {
        data: {
          full_name: 'Test User',
          phone: '1234567890'
        }
      }
    });
    
    if (authError) {
      console.error('❌ Auth signup error:', authError);
    } else {
      console.log('✅ Auth signup successful');
      console.log('User ID:', authData.user?.id);
      
      // Check if profile was created
      if (authData.user?.id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (profileError) {
          console.error('❌ Profile creation error:', profileError);
        } else {
          console.log('✅ Profile created successfully:', profileData);
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
