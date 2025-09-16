/**
 * Browser Console Script to Clear Auth Cookie
 * 
 * Copy and paste this entire script into your browser's console
 * when you're on the Symbolic AI website to clear the auth cookie.
 */

(function() {
  const AUTH_COOKIE_NAME = 'symbolic_ai_auth_state';
  
  console.log('🍪 Clearing Symbolic AI Auth Cookie...');
  
  try {
    // Clear the cookie by setting it to expire in the past
    // Use the same path and SameSite settings as the original cookie
    document.cookie = `${AUTH_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
    
    // Also try clearing with different domain variations
    document.cookie = `${AUTH_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=localhost;SameSite=Lax`;
    document.cookie = `${AUTH_COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=.localhost;SameSite=Lax`;
    
    // Wait a moment for the cookie to be cleared
    setTimeout(() => {
      // Verify the cookie is cleared
      const cookieValue = document.cookie
        .split(';')
        .find(row => row.trim().startsWith(`${AUTH_COOKIE_NAME}=`));
      
      if (!cookieValue) {
        console.log('✅ Auth cookie cleared successfully!');
        console.log('🔄 You can now test the "Get Started" flow again');
        console.log('📝 The button should now show "Get Started" instead of "Log In"');
      } else {
        console.log('⚠️ Cookie still exists:', cookieValue);
        console.log('💡 Try refreshing the page or clearing browser cache');
      }
      
      // Show current cookies for debugging
      console.log('🍪 Current cookies:', document.cookie);
    }, 100);
    
  } catch (error) {
    console.error('❌ Error clearing auth cookie:', error);
  }
})();
