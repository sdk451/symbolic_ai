#!/usr/bin/env node

// Script to start development servers and run comprehensive tests
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

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

async function startDevelopmentServers() {
  log('INFO', '🚀 Starting development servers...');
  
  return new Promise((resolve, reject) => {
    const devProcess = spawn('npm', ['run', 'dev:full'], {
      stdio: 'pipe',
      shell: true
    });
    
    let output = '';
    let serversReady = false;
    
    devProcess.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);
      
      // Check if both servers are ready
      if (text.includes('Server now ready on http://localhost:8888') && 
          text.includes('Local:   http://localhost:3000/')) {
        if (!serversReady) {
          serversReady = true;
          log('SUCCESS', '✅ Development servers are ready!');
          resolve(devProcess);
        }
      }
    });
    
    devProcess.stderr.on('data', (data) => {
      process.stderr.write(data);
    });
    
    devProcess.on('error', (error) => {
      log('ERROR', `Failed to start development servers: ${error.message}`);
      reject(error);
    });
    
    // Timeout after 60 seconds
    setTimeout(60000).then(() => {
      if (!serversReady) {
        log('ERROR', 'Timeout waiting for development servers to start');
        devProcess.kill();
        reject(new Error('Timeout'));
      }
    });
  });
}

async function runTests() {
  log('INFO', '🧪 Running comprehensive system tests...');
  
  return new Promise((resolve, reject) => {
    const testProcess = spawn('node', ['test-system.js'], {
      stdio: 'inherit',
      shell: true
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        log('SUCCESS', '✅ All tests passed!');
        resolve(true);
      } else {
        log('ERROR', `❌ Tests failed with exit code ${code}`);
        resolve(false);
      }
    });
    
    testProcess.on('error', (error) => {
      log('ERROR', `Failed to run tests: ${error.message}`);
      reject(error);
    });
  });
}

async function main() {
  try {
    log('INFO', '🔧 Starting Development Environment Test Suite');
    log('INFO', '===============================================');
    
    // Step 1: Start development servers
    const devProcess = await startDevelopmentServers();
    
    // Step 2: Wait a bit for servers to fully initialize
    log('INFO', '⏳ Waiting for servers to fully initialize...');
    await setTimeout(5000);
    
    // Step 3: Run comprehensive tests
    const testsPassed = await runTests();
    
    // Step 4: Clean up
    log('INFO', '🧹 Cleaning up...');
    devProcess.kill();
    
    if (testsPassed) {
      log('SUCCESS', '🎉 All systems are working correctly!');
      process.exit(0);
    } else {
      log('ERROR', '⚠️  Some tests failed. Check the output above.');
      process.exit(1);
    }
    
  } catch (error) {
    log('ERROR', `Test suite failed: ${error.message}`);
    process.exit(1);
  }
}

main();
