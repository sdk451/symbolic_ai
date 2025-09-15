// Simple test script to check Supabase connection
import { createClient } from '@supabase/supabase-js';

// Read environment variables from .env.local
const fs = await import('fs');
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

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
    
    // Test basic connection by trying to access profiles table
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Database connection error:', error);
      
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('\n💡 The "profiles" table does not exist in your database.');
        console.log('This is likely the cause of your signup error.');
        console.log('\nTo fix this:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
        console.log('2. Select your project: dslyxxexyiqurosomytw');
        console.log('3. Go to SQL Editor');
        console.log('4. Run the SQL from: supabase/migrations/20250915000438_bold_queen.sql');
        console.log('5. This will create the profiles table and triggers');
      } else if (error.message.includes('permission denied')) {
        console.log('\n💡 Permission denied error.');
        console.log('This might be a Row Level Security (RLS) issue.');
        console.log('Check your Supabase RLS policies for the profiles table.');
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
      console.log('\n💡 Common signup errors:');
      console.log('- Email already exists');
      console.log('- Password too weak');
      console.log('- Missing profiles table');
      console.log('- RLS policies blocking profile creation');
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
          console.log('\n💡 The user was created but the profile was not.');
          console.log('This suggests the handle_new_user trigger is not working.');
          console.log('Check if the trigger exists in your database.');
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
