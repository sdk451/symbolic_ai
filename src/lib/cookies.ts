/**
 * Cookie utility functions for managing authentication state
 */

export interface AuthCookieData {
  hasAccount: boolean;
  email?: string;
  timestamp: number;
}

const AUTH_COOKIE_NAME = 'symbolic_ai_auth_state';
const COOKIE_EXPIRY_DAYS = 30; // Cookie expires in 30 days

/**
 * Set a cookie with the given name, value, and expiration
 */
function setCookie(name: string, value: string, days: number = COOKIE_EXPIRY_DAYS): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

/**
 * Get a cookie value by name
 */
function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  
  return null;
}

/**
 * Delete a cookie by name
 */
function deleteCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

/**
 * Set authentication state cookie
 */
export function setAuthStateCookie(hasAccount: boolean, email?: string): void {
  const authData: AuthCookieData = {
    hasAccount,
    email: email?.toLowerCase(),
    timestamp: Date.now()
  };
  
  try {
    const cookieValue = JSON.stringify(authData);
    setCookie(AUTH_COOKIE_NAME, cookieValue);
    console.log('🍪 Auth cookie set:', { hasAccount, email: email?.toLowerCase() });
  } catch (error) {
    console.error('Error setting auth cookie:', error);
  }
}

/**
 * Get authentication state from cookie
 */
export function getAuthStateCookie(): AuthCookieData | null {
  try {
    const cookieValue = getCookie(AUTH_COOKIE_NAME);
    if (!cookieValue) return null;
    
    const authData: AuthCookieData = JSON.parse(cookieValue);
    
    // Check if cookie is expired (older than 30 days)
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (authData.timestamp < thirtyDaysAgo) {
      clearAuthStateCookie();
      return null;
    }
    
    return authData;
  } catch (error) {
    console.error('Error reading auth cookie:', error);
    clearAuthStateCookie(); // Clear invalid cookie
    return null;
  }
}

/**
 * Clear authentication state cookie
 */
export function clearAuthStateCookie(): void {
  deleteCookie(AUTH_COOKIE_NAME);
  console.log('🍪 Auth cookie cleared');
}

/**
 * Force clear authentication state cookie with multiple attempts
 * This function tries different domain and path combinations to ensure the cookie is cleared
 */
export function forceClearAuthStateCookie(): void {
  const cookieName = AUTH_COOKIE_NAME;
  const expireDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
  
  console.log('🍪 Force clearing auth cookie...');
  
  // Try multiple combinations to ensure cookie is cleared
  const clearAttempts = [
    `${cookieName}=;expires=${expireDate};path=/;SameSite=Lax`,
    `${cookieName}=;expires=${expireDate};path=/;domain=localhost;SameSite=Lax`,
    `${cookieName}=;expires=${expireDate};path=/;domain=.localhost;SameSite=Lax`,
    `${cookieName}=;expires=${expireDate};path=/;domain=127.0.0.1;SameSite=Lax`,
    `${cookieName}=;expires=${expireDate};path=/;domain=.127.0.0.1;SameSite=Lax`,
    `${cookieName}=;expires=${expireDate};path=/`,
    `${cookieName}=;expires=${expireDate};path=/;domain=localhost`,
    `${cookieName}=;expires=${expireDate};path=/;domain=.localhost`
  ];
  
  clearAttempts.forEach((attempt, index) => {
    document.cookie = attempt;
    console.log(`🍪 Clear attempt ${index + 1}: ${attempt}`);
  });
  
  // Check if cookie still exists
  setTimeout(() => {
    const cookieValue = document.cookie
      .split(';')
      .find(row => row.trim().startsWith(`${cookieName}=`));
    
    if (!cookieValue) {
      console.log('✅ Auth cookie successfully cleared!');
      console.log('🔄 You can now test the "Get Started" flow again');
    } else {
      console.log('⚠️ Cookie might still exist:', cookieValue);
      console.log('💡 Try refreshing the page or clearing browser cache');
    }
    
    console.log('🍪 Current cookies:', document.cookie);
  }, 100);
}

/**
 * Check if user has an account based on cookie
 */
export function hasAccountFromCookie(): boolean {
  const authData = getAuthStateCookie();
  const hasAccount = authData?.hasAccount ?? false;
  console.log('🍪 Checking account status from cookie:', { hasAccount, email: authData?.email });
  return hasAccount;
}

/**
 * Get user email from cookie
 */
export function getEmailFromCookie(): string | null {
  const authData = getAuthStateCookie();
  return authData?.email ?? null;
}

/**
 * Check if email matches the one in cookie
 */
export function isEmailInCookie(email: string): boolean {
  const cookieEmail = getEmailFromCookie();
  return cookieEmail === email.toLowerCase();
}
