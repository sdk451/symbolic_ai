// Test script to verify the signup fix
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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  try {
    console.log('🔍 Testing signup with proper email format...');
    
    // Use a proper email format
    const testEmail = `testuser${Date.now()}@gmail.com`;
    const testPassword = 'TestPassword123!';
    
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          phone: '1234567890'
        }
      }
    });
    
    if (authError) {
      console.error('❌ Auth signup error:', authError);
      
      if (authError.message.includes('email_address_invalid')) {
        console.log('💡 Email validation issue. This might be a Supabase configuration.');
        console.log('Check your Supabase Auth settings for email validation rules.');
      } else if (authError.message.includes('password')) {
        console.log('💡 Password validation issue. Try a stronger password.');
      } else if (authError.message.includes('already registered')) {
        console.log('💡 Email already exists. Try a different email.');
      }
    } else {
      console.log('✅ Auth signup successful!');
      console.log('User ID:', authData.user?.id);
      console.log('Email confirmed:', authData.user?.email_confirmed_at ? 'Yes' : 'No');
      
      // Check if profile was created
      if (authData.user?.id) {
        console.log('\n🔍 Checking if profile was created...');
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
          
        if (profileError) {
          console.error('❌ Profile not found:', profileError);
        } else {
          console.log('✅ Profile created successfully!');
          console.log('Profile data:', profileData);
        }
      }
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testSignup();
