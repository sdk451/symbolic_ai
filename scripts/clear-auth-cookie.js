#!/usr/bin/env node

/**
 * Script to clear the authentication cookie for testing purposes
 * 
 * Usage:
 *   node scripts/clear-auth-cookie.js
 *   npm run clear-auth-cookie
 */

const AUTH_COOKIE_NAME = 'symbolic_ai_auth_state';

/**
 * Clear the auth cookie by setting it to expire in the past
 */
function clearAuthCookie() {
  try {
    // Set cookie to expire in the past (effectively deleting it)
    document.cookie = `${AUTH_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    console.log('✅ Auth cookie cleared successfully');
    console.log('🍪 Cookie name:', AUTH_COOKIE_NAME);
    console.log('🔄 You can now test the "Get Started" flow again');
  } catch (error) {
    console.error('❌ Error clearing auth cookie:', error);
  }
}

// Check if we're in a browser environment
if (typeof document !== 'undefined') {
  // Browser environment - clear the cookie directly
  clearAuthCookie();
} else {
  // Node.js environment - provide instructions
  console.log('🔧 Auth Cookie Clearer');
  console.log('====================');
  console.log('');
  console.log('This script needs to run in a browser environment to clear cookies.');
  console.log('');
  console.log('To clear the auth cookie:');
  console.log('1. Open your browser\'s Developer Tools (F12)');
  console.log('2. Go to the Console tab');
  console.log('3. Run this command:');
  console.log('');
  console.log('   document.cookie = "symbolic_ai_auth_state=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;"');
  console.log('');
  console.log('4. Or use the browser\'s Application/Storage tab to delete the cookie manually');
  console.log('');
  console.log('Alternative: Open the browser console on your app and run:');
  console.log('   clearAuthStateCookie()');
  console.log('');
}
