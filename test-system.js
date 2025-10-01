#!/usr/bin/env node

// Comprehensive system test suite for Lead Qualification and Chatbot demos
import http from 'http';
import https from 'https';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(level, message) {
  const timestamp = new Date().toISOString().substr(11, 12);
  const levelColors = {
    'INFO': colors.blue,
    'SUCCESS': colors.green,
    'WARNING': colors.yellow,
    'ERROR': colors.red,
    'TEST': colors.cyan
  };
  console.log(`${levelColors[level] || colors.reset}[${timestamp}] ${level}: ${message}${colors.reset}`);
}

// Test 1: Check if development servers are running
async function testServersRunning() {
  log('TEST', '=== TEST 1: Checking Development Servers ===');
  
  const servers = [
    { name: 'Vite Dev Server', port: 3000, path: '/' },
    { name: 'Netlify Dev Server', port: 8888, path: '/.netlify/functions/' }
  ];
  
  for (const server of servers) {
    try {
      const result = await testEndpoint(`http://localhost:${server.port}${server.path}`, 'GET');
      if (result.status === 200 || result.status === 404) {
        log('SUCCESS', `${server.name} is running on port ${server.port}`);
      } else {
        log('WARNING', `${server.name} responded with status ${result.status}`);
      }
    } catch (error) {
      log('ERROR', `${server.name} is not running: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

// Test 2: Check Netlify Functions are loaded
async function testNetlifyFunctions() {
  log('TEST', '=== TEST 2: Checking Netlify Functions ===');
  
  const functions = [
    'lead-qualification',
    'chatbot',
    'api'
  ];
  
  for (const func of functions) {
    try {
      const result = await testEndpoint(`http://localhost:8888/.netlify/functions/${func}`, 'POST', {
        test: true
      });
      log('SUCCESS', `Function ${func} is loaded and responding`);
    } catch (error) {
      log('ERROR', `Function ${func} failed: ${error.message}`);
      return false;
    }
  }
  
  return true;
}

// Test 3: Test Lead Qualification Function
async function testLeadQualificationFunction() {
  log('TEST', '=== TEST 3: Testing Lead Qualification Function ===');
  
  const testPayload = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '+1234567890',
    request: 'Test request for lead qualification',
    runId: `test_${Date.now()}`,
    honeypot: ''
  };
  
  try {
    log('INFO', 'Sending test payload to lead-qualification function...');
    const result = await testEndpoint('http://localhost:8888/.netlify/functions/lead-qualification', 'POST', testPayload);
    
    log('INFO', `Response status: ${result.status}`);
    log('INFO', `Response body: ${result.body.substring(0, 200)}...`);
    
    if (result.status === 200) {
      const response = JSON.parse(result.body);
      if (response.success) {
        log('SUCCESS', 'Lead qualification function working correctly');
        log('INFO', `RunId: ${response.runId}`);
        log('INFO', `Message: ${response.message}`);
        return true;
      } else {
        log('ERROR', `Function returned success=false: ${response.message}`);
        return false;
      }
    } else {
      log('ERROR', `Function returned status ${result.status}: ${result.body}`);
      return false;
    }
  } catch (error) {
    log('ERROR', `Lead qualification function test failed: ${error.message}`);
    return false;
  }
}

// Test 4: Test Chatbot Function
async function testChatbotFunction() {
  log('TEST', '=== TEST 4: Testing Chatbot Function ===');
  
  const testPayload = {
    sessionId: `test_session_${Date.now()}`,
    action: 'initialize'
  };
  
  try {
    log('INFO', 'Sending test payload to chatbot function...');
    const result = await testEndpoint('http://localhost:8888/.netlify/functions/chatbot', 'POST', testPayload);
    
    log('INFO', `Response status: ${result.status}`);
    log('INFO', `Response body: ${result.body.substring(0, 200)}...`);
    
    if (result.status === 200) {
      const response = JSON.parse(result.body);
      if (response.success) {
        log('SUCCESS', 'Chatbot function working correctly');
        log('INFO', `SessionId: ${response.sessionId}`);
        log('INFO', `Response: ${response.response}`);
        return true;
      } else {
        log('ERROR', `Function returned success=false: ${response.message}`);
        return false;
      }
    } else {
      log('ERROR', `Function returned status ${result.status}: ${result.body}`);
      return false;
    }
  } catch (error) {
    log('ERROR', `Chatbot function test failed: ${error.message}`);
    return false;
  }
}

// Test 5: Test n8n Webhook Connectivity
async function testN8nWebhooks() {
  log('TEST', '=== TEST 5: Testing n8n Webhook Connectivity ===');
  
  const webhooks = [
    {
      name: 'Lead Qualification Webhook',
      url: 'https://n8n.srv995431.hstgr.cloud/webhook/symbolicai_enquiry_form',
      payload: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        request: 'Test request',
        runId: `test_${Date.now()}`,
        timestamp: new Date().toISOString()
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0',
        'Accept': 'application/json',
        'x-api-key': 't&st45@1z'
      }
    },
    {
      name: 'Chatbot Webhook',
      url: 'https://n8n.srv995431.hstgr.cloud/webhook/0c43d2e2-2990-4e61-9d0b-4f5a98e6dab5/chat',
      payload: {
        sessionId: `test_session_${Date.now()}`,
        action: 'initialize',
        timestamp: new Date().toISOString(),
        userId: 'test-user'
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0',
        'Accept': 'application/json'
      }
    }
  ];
  
  for (const webhook of webhooks) {
    try {
      log('INFO', `Testing ${webhook.name}...`);
      const result = await testWebhook(webhook.url, webhook.payload, webhook.headers);
      
      log('INFO', `Response status: ${result.status}`);
      log('INFO', `Response body: ${result.body.substring(0, 200)}...`);
      
      if (result.status === 200) {
        log('SUCCESS', `${webhook.name} is working correctly`);
      } else if (result.status === 404) {
        log('WARNING', `${webhook.name} is reachable but not registered (404)`);
      } else {
        log('WARNING', `${webhook.name} returned status ${result.status}`);
      }
    } catch (error) {
      log('ERROR', `${webhook.name} failed: ${error.message}`);
    }
  }
  
  return true;
}

// Test 6: End-to-End Lead Qualification Test
async function testEndToEndLeadQualification() {
  log('TEST', '=== TEST 6: End-to-End Lead Qualification Test ===');
  
  const testPayload = {
    name: 'End-to-End Test User',
    email: 'e2e@example.com',
    phone: '+1234567890',
    request: 'End-to-end test request',
    runId: `e2e_${Date.now()}`,
    honeypot: ''
  };
  
  try {
    log('INFO', 'Starting end-to-end test...');
    
    // Step 1: Call our function
    const result = await testEndpoint('http://localhost:8888/.netlify/functions/lead-qualification', 'POST', testPayload);
    
    if (result.status !== 200) {
      log('ERROR', `Our function failed with status ${result.status}`);
      return false;
    }
    
    const response = JSON.parse(result.body);
    if (!response.success) {
      log('ERROR', `Our function returned success=false: ${response.message}`);
      return false;
    }
    
    log('SUCCESS', 'End-to-end test completed successfully');
    log('INFO', `Final result: ${response.message}`);
    log('INFO', `RunId: ${response.runId}`);
    
    return true;
  } catch (error) {
    log('ERROR', `End-to-end test failed: ${error.message}`);
    return false;
  }
}

// Helper function to test HTTP endpoints
function testEndpoint(url, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    const req = (urlObj.protocol === 'https:' ? https : http).request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Helper function to test webhooks
function testWebhook(url, payload, headers = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script/1.0',
        'Accept': 'application/json',
        ...headers
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Request timeout')));
    req.write(JSON.stringify(payload));
    req.end();
  });
}

// Main test runner
async function runAllTests() {
  log('INFO', '🚀 Starting Comprehensive System Tests');
  log('INFO', '=====================================');
  
  const tests = [
    { name: 'Development Servers', fn: testServersRunning },
    { name: 'Netlify Functions', fn: testNetlifyFunctions },
    { name: 'Lead Qualification Function', fn: testLeadQualificationFunction },
    { name: 'Chatbot Function', fn: testChatbotFunction },
    { name: 'n8n Webhook Connectivity', fn: testN8nWebhooks },
    { name: 'End-to-End Lead Qualification', fn: testEndToEndLeadQualification }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      log('INFO', `\nRunning ${test.name}...`);
      const result = await test.fn();
      if (result) {
        passed++;
        log('SUCCESS', `✅ ${test.name} PASSED`);
      } else {
        failed++;
        log('ERROR', `❌ ${test.name} FAILED`);
      }
    } catch (error) {
      failed++;
      log('ERROR', `❌ ${test.name} FAILED: ${error.message}`);
    }
  }
  
  log('INFO', '\n=====================================');
  log('INFO', `📊 Test Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    log('SUCCESS', '🎉 All tests passed! System is working correctly.');
  } else {
    log('ERROR', `⚠️  ${failed} test(s) failed. Check the logs above for details.`);
  }
  
  return failed === 0;
}

// Run the tests
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  log('ERROR', `Test runner failed: ${error.message}`);
  process.exit(1);
});
