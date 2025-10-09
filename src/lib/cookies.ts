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
 * Get the appropriate domain for cookie setting based on current environment
 */
function getCookieDomain(): string | undefined {
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
 * Set a cookie with the given name, value, and expiration
 */
function setCookie(name: string, value: string, days: number = COOKIE_EXPIRY_DAYS): void {
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  
  const domain = getCookieDomain();
  const domainPart = domain ? `;domain=${domain}` : '';
  
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax${domainPart}`;
  
  console.log(`🍪 Cookie set for domain: ${domain || 'current hostname'}`);
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
  const domain = getCookieDomain();
  const domainPart = domain ? `;domain=${domain}` : '';
  
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax${domainPart}`;
  
  console.log(`🍪 Cookie deleted for domain: ${domain || 'current hostname'}`);
}

/**
 * Get current environment info for debugging
 */
export function getEnvironmentInfo(): { hostname: string; domain: string | undefined; environment: string } {
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
 * Set authentication state cookie
 */
export function setAuthStateCookie(hasAccount: boolean, email?: string): void {
  const envInfo = getEnvironmentInfo();
  console.log(`🍪 Setting auth cookie in ${envInfo.environment} environment (${envInfo.hostname})`);
  
  const authData: AuthCookieData = {
    hasAccount,
    email: email?.toLowerCase(),
    timestamp: Date.now()
  };
  
  try {
    const cookieValue = JSON.stringify(authData);
    setCookie(AUTH_COOKIE_NAME, cookieValue);
    console.log('🍪 Auth cookie set:', { hasAccount, email: email?.toLowerCase(), environment: envInfo.environment });
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
  const expireDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
  const currentDomain = getCookieDomain();
  const hostname = window.location.hostname;
  
  // Build clear attempts based on current environment
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
  
  console.log(`🍪 Clearing auth cookie for domain: ${currentDomain || hostname}`);
  
  clearAttempts.forEach((attempt, index) => {
    document.cookie = attempt;
    if (index < 3) { // Only log first few attempts to avoid spam
      console.log(`🍪 Clear attempt ${index + 1}: ${attempt}`);
    }
  });
  
  console.log('🍪 Auth cookie cleared with domain-aware attempts');
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

/**
 * Debug function to check cookie status
 */
export function debugCookieStatus(): void {
  const envInfo = getEnvironmentInfo();
  
  console.log('🍪 === Cookie Debug Info ===');
  console.log('Environment:', envInfo.environment);
  console.log('Hostname:', envInfo.hostname);
  console.log('Cookie domain:', envInfo.domain || 'current hostname');
  console.log('All cookies:', document.cookie);
  
  const cookieValue = getCookie(AUTH_COOKIE_NAME);
  console.log('Auth cookie raw value:', cookieValue);
  
  if (cookieValue) {
    try {
      const authData = JSON.parse(cookieValue);
      console.log('Auth cookie parsed data:', authData);
      console.log('Cookie age:', Date.now() - authData.timestamp, 'ms');
      console.log('Cookie age (days):', Math.round((Date.now() - authData.timestamp) / (1000 * 60 * 60 * 24)));
    } catch (e) {
      console.log('Error parsing auth cookie:', e);
    }
  } else {
    console.log('No auth cookie found');
  }
  
  console.log('🍪 === End Cookie Debug ===');
}

/**
 * Nuclear option - clear ALL possible variations of the auth cookie
 * This function should be called from browser console if normal clearing doesn't work
 */
export function nuclearClearAuthCookie(): void {
  console.log('☢️ NUCLEAR CLEARING AUTH COOKIE...');
  
  const cookieName = AUTH_COOKIE_NAME;
  const expireDate = 'Thu, 01 Jan 1970 00:00:00 UTC';
  
  // Get current hostname and port for dynamic clearing
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // Try every possible combination
  const clearAttempts = [
    // Basic clears
    `${cookieName}=;expires=${expireDate};path=/`,
    `${cookieName}=;expires=${expireDate};path=/;SameSite=Lax`,
    `${cookieName}=;expires=${expireDate};path=/;SameSite=Strict`,
    `${cookieName}=;expires=${expireDate};path=/;SameSite=None`,
    
    // With localhost domain
    `${cookieName}=;expires=${expireDate};path=/;domain=localhost`,
    `${cookieName}=;expires=${expireDate};path=/;domain=localhost;SameSite=Lax`,
    `${cookieName}=;expires=${expireDate};path=/;domain=.localhost`,
    `${cookieName}=;expires=${expireDate};path=/;domain=.localhost;SameSite=Lax`,
    
    // With 127.0.0.1 domain
    `${cookieName}=;expires=${expireDate};path=/;domain=127.0.0.1`,
    `${cookieName}=;expires=${expireDate};path=/;domain=127.0.0.1;SameSite=Lax`,
    `${cookieName}=;expires=${expireDate};path=/;domain=.127.0.0.1`,
    `${cookieName}=;expires=${expireDate};path=/;domain=.127.0.0.1;SameSite=Lax`,
    
    // With current hostname
    `${cookieName}=;expires=${expireDate};path=/;domain=${hostname}`,
    `${cookieName}=;expires=${expireDate};path=/;domain=${hostname};SameSite=Lax`,
    `${cookieName}=;expires=${expireDate};path=/;domain=.${hostname}`,
    `${cookieName}=;expires=${expireDate};path=/;domain=.${hostname};SameSite=Lax`,
    
    // With port if present
    ...(port ? [
      `${cookieName}=;expires=${expireDate};path=/;domain=${hostname}:${port}`,
      `${cookieName}=;expires=${expireDate};path=/;domain=${hostname}:${port};SameSite=Lax`,
      `${cookieName}=;expires=${expireDate};path=/;domain=.${hostname}:${port}`,
      `${cookieName}=;expires=${expireDate};path=/;domain=.${hostname}:${port};SameSite=Lax`
    ] : [])
  ];
  
  console.log(`☢️ Attempting ${clearAttempts.length} different clear combinations...`);
  
  clearAttempts.forEach((attempt, index) => {
    document.cookie = attempt;
    console.log(`☢️ Clear attempt ${index + 1}: ${attempt}`);
  });
  
  // Also try to clear from localStorage and sessionStorage just in case
  try {
    localStorage.removeItem('symbolic_ai_auth_state');
    sessionStorage.removeItem('symbolic_ai_auth_state');
    console.log('☢️ Also cleared from localStorage and sessionStorage');
  } catch (e) {
    console.log('☢️ Could not clear from storage:', e);
  }
  
  // Check if cookie still exists after a delay
  setTimeout(() => {
    const cookieValue = document.cookie
      .split(';')
      .find(row => row.trim().startsWith(`${cookieName}=`));
    
    if (!cookieValue) {
      console.log('✅ NUCLEAR CLEAR SUCCESSFUL! Auth cookie is gone!');
      console.log('🔄 Refresh the page to see the changes');
    } else {
      console.log('⚠️ NUCLEAR CLEAR FAILED! Cookie still exists:', cookieValue);
      console.log('💡 Try manually clearing browser cache or using incognito mode');
    }
    
    console.log('🍪 Current cookies after nuclear clear:', document.cookie);
  }, 200);
}

// Make functions available globally for easy console access
if (typeof window !== 'undefined') {
  (window as any).nuclearClearAuthCookie = nuclearClearAuthCookie;
  (window as any).debugCookieStatus = debugCookieStatus;
  (window as any).getEnvironmentInfo = getEnvironmentInfo;
  (window as any).clearAuthStateCookie = clearAuthStateCookie;
}
