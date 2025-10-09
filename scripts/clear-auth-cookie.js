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
 * Get the appropriate domain for cookie setting based on current environment
 */
function getCookieDomain() {
  if (typeof window === 'undefined') return undefined;
  
  const hostname = window.location.hostname;
  
  // For production domain, use the full domain
  if (hostname === 'www.symbolicenterprises.com' || hostname === 'symbolicenterprises.com') {
    return '.symbolicenterprises.com'; // Use dot prefix for subdomain support
  }
  
  // For localhost development, don't set domain (browser will use exact hostname)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return undefined;
  }
  
  // For other domains (like netlify previews), use the current hostname
  return hostname;
}

/**
 * Get current environment info for debugging
 */
function getEnvironmentInfo() {
  if (typeof window === 'undefined') {
    return { hostname: 'unknown', domain: undefined, environment: 'node' };
  }
  
  const hostname = window.location.hostname;
  const domain = getCookieDomain();
  
  let environment = 'unknown';
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    environment = 'development';
  } else if (hostname.includes('symbolicenterprises.com')) {
    environment = 'production';
  } else if (hostname.includes('netlify.app')) {
    environment = 'preview';
  }
  
  return { hostname, domain, environment };
}

/**
 * Clear the auth cookie by setting it to expire in the past
 */
function clearAuthCookie() {
  try {
    const envInfo = getEnvironmentInfo();
    const expireDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
    const currentDomain = getCookieDomain();
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'unknown';
    
    console.log(`🍪 Clearing auth cookie in ${envInfo.environment} environment (${envInfo.hostname})`);
    
    // Build clear attempts based on current environment (matching the new system)
    const clearAttempts = [
      // Current domain (most important)
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;SameSite=Lax${currentDomain ? `;domain=${currentDomain}` : ''}`,
      
      // Fallback attempts for different environments
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;SameSite=Lax`,
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/`,
      
      // Localhost variants (for dev)
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;domain=localhost;SameSite=Lax`,
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;domain=.localhost;SameSite=Lax`,
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;domain=127.0.0.1;SameSite=Lax`,
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;domain=.127.0.0.1;SameSite=Lax`,
      
      // Production domain variants
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;domain=symbolicenterprises.com;SameSite=Lax`,
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;domain=.symbolicenterprises.com;SameSite=Lax`,
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;domain=www.symbolicenterprises.com;SameSite=Lax`,
      
      // Current hostname variants
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;domain=${hostname};SameSite=Lax`,
      `${AUTH_COOKIE_NAME}=;expires=${expireDate};path=/;domain=.${hostname};SameSite=Lax`
    ];
    
    clearAttempts.forEach((attempt, index) => {
      document.cookie = attempt;
      if (index < 3) { // Only log first few attempts
        console.log(`🍪 Clear attempt ${index + 1}: ${attempt}`);
      }
    });
    
    console.log('✅ Auth cookie cleared with domain-aware attempts');
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
  console.log('3. Run one of these commands based on your environment:');
  console.log('');
  console.log('   // For localhost development:');
  console.log('   document.cookie = "symbolic_ai_auth_state=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax";');
  console.log('');
  console.log('   // For production (www.symbolicenterprises.com):');
  console.log('   document.cookie = "symbolic_ai_auth_state=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.symbolicenterprises.com;SameSite=Lax";');
  console.log('');
  console.log('   // Nuclear option (tries all combinations):');
  console.log('   nuclearClearAuthCookie()');
  console.log('');
  console.log('4. Or use the browser\'s Application/Storage tab to delete the cookie manually');
  console.log('');
  console.log('Alternative: Open the browser console on your app and run:');
  console.log('   clearAuthStateCookie()  // Smart domain-aware clearing');
  console.log('   debugCookieStatus()     // Check current cookie status');
  console.log('   getEnvironmentInfo()    // Show environment details');
  console.log('');
  console.log('Or use the HTML tool: scripts/clear-auth-cookie.html');
  console.log('');
}
