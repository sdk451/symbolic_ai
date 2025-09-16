# 🍪 Auth Cookie Clearing Scripts

This directory contains scripts to help you clear the authentication cookie during testing.

## 🚀 Quick Methods

### Method 1: Browser Console (Fastest)
1. Open your Symbolic AI app in the browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Run: `forceClearAuthStateCookie()` (recommended)
   - Or: `clearAuthStateCookie()` (basic)

### Method 2: HTML Tool (Easiest)
1. Open `scripts/clear-auth-cookie.html` in your browser
2. Click "Force Clear Auth Cookie" button (recommended)
   - Or: "Clear Auth Cookie" button (basic)
3. Go back to your app

### Method 3: Manual Browser Method
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Find Cookies → localhost:3003
4. Delete the `symbolic_ai_auth_state` cookie

## 📁 Files Created

- **`clear-auth-cookie.js`** - Node.js script (shows instructions)
- **`clear-auth-cookie-browser.js`** - Browser console script
- **`clear-auth-cookie.html`** - Interactive HTML tool
- **`README-cookie-clearing.md`** - This documentation

## 🎯 What This Does

The auth cookie (`symbolic_ai_auth_state`) remembers whether a user has an account to show the correct button text:
- **With cookie**: Shows "Log In" button
- **Without cookie**: Shows "Get Started" button

## 🔄 Testing Workflow

1. **Clear the cookie** using any method above
2. **Refresh your app** (localhost:3003)
3. **Verify** the button shows "Get Started"
4. **Test signup flow** from scratch
5. **Repeat** as needed for testing

## 🛠️ NPM Script

```bash
npm run clear-auth-cookie
```

This runs the Node.js script which provides instructions for browser-based clearing.

## 🔍 Cookie Details

- **Name**: `symbolic_ai_auth_state`
- **Expiry**: 30 days
- **Purpose**: UX enhancement to remember account status
- **Security**: No sensitive data, just account existence flag
