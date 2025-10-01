# Comprehensive System Test Suite

This test suite provides step-by-step verification of the entire Lead Qualification and Chatbot demo system.

## Test Components

### 1. Development Servers Test
- ✅ Vite Dev Server (port 3000)
- ✅ Netlify Dev Server (port 8888)

### 2. Netlify Functions Test
- ✅ lead-qualification function
- ✅ chatbot function  
- ✅ api function

### 3. Lead Qualification Function Test
- ✅ Function receives POST request
- ✅ Validates form data (name, email, phone, request)
- ✅ Honeypot spam detection
- ✅ Calls n8n webhook with x-api-key
- ✅ Handles webhook response
- ✅ Returns success response to frontend

### 4. Chatbot Function Test
- ✅ Function receives POST request
- ✅ Validates session ID
- ✅ Calls n8n webhook (no auth)
- ✅ Handles webhook response
- ✅ Returns success response to frontend

### 5. n8n Webhook Connectivity Test
- ✅ Lead Qualification webhook reachability
- ✅ Chatbot webhook reachability
- ✅ Proper headers and authentication
- ✅ Response handling (200, 404, errors)

### 6. End-to-End Lead Qualification Test
- ✅ Complete flow from frontend to n8n
- ✅ Proper error handling
- ✅ Success response validation

## Running the Tests

### Option 1: Automated Test Suite (Recommended)
```bash
# Start servers and run all tests automatically
node test-and-run.js
```

### Option 2: PowerShell (Windows)
```powershell
# Run the PowerShell test script
.\test-system.ps1
```

### Option 3: Manual Step-by-Step
```bash
# 1. Start development servers
npm run dev:full

# 2. Wait for servers to start (15-30 seconds)

# 3. Run comprehensive tests
node test-system.js
```

## Test Output

The test suite provides detailed logging with:
- 🚀 **INFO**: General information
- ✅ **SUCCESS**: Tests that passed
- ⚠️ **WARNING**: Non-critical issues
- ❌ **ERROR**: Critical failures
- 🧪 **TEST**: Test section headers

## Expected Results

### ✅ All Tests Pass
- Development servers running
- All Netlify functions loaded
- Functions respond correctly
- n8n webhooks reachable (may return 404 if not registered)
- End-to-end flow works

### ⚠️ Expected Warnings
- n8n webhooks returning 404 (webhook not registered)
- This is normal in development

### ❌ Critical Failures
- Development servers not starting
- Netlify functions not loading
- Functions returning 500 errors
- Network connectivity issues

## Troubleshooting

### Development Servers Not Starting
```bash
# Kill any existing Node processes
taskkill /f /im node.exe

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try again
npm run dev:full
```

### Functions Not Loading
- Check `netlify/functions/` directory
- Verify function files have proper exports
- Check for TypeScript compilation errors

### n8n Webhook Issues
- Verify webhook URLs are correct
- Check if n8n server is running
- Confirm webhook is registered in n8n
- Test webhook URLs directly in browser

## Test Files

- `test-system.js` - Main test suite
- `test-and-run.js` - Automated test runner
- `test-system.ps1` - PowerShell test script
- `TEST-README.md` - This documentation

## Next Steps

After running tests:
1. If all tests pass → System is working correctly
2. If tests fail → Check specific error messages
3. Fix issues and re-run tests
4. Once all tests pass → Ready for production
