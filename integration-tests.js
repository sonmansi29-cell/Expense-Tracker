// Integration test runner script
const { spawn } = require('child_process');
const path = require('path');

console.log('🧪 Starting Integration Tests...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args, cwd, name) {
  return new Promise((resolve, reject) => {
    log(colors.blue, `📦 Running ${name}...`);
    
    const proc = spawn(command, args, { 
      cwd, 
      stdio: 'inherit',
      shell: true 
    });

    proc.on('close', (code) => {
      if (code === 0) {
        log(colors.green, `✅ ${name} passed`);
        resolve();
      } else {
        log(colors.red, `❌ ${name} failed with code ${code}`);
        reject(new Error(`${name} failed`));
      }
    });

    proc.on('error', (error) => {
      log(colors.red, `❌ ${name} error: ${error.message}`);
      reject(error);
    });
  });
}

async function runTests() {
  try {
    // Run client tests
    await runCommand('npm', ['test'], path.join(__dirname, '..', 'client'), 'Client Tests');
    
    // Run server tests
    await runCommand('npm', ['test'], path.join(__dirname, '..', 'server'), 'Server Tests');
    
    log(colors.green, '\n🎉 All tests passed successfully!');
    process.exit(0);
  } catch (error) {
    log(colors.red, '\n💥 Some tests failed!');
    process.exit(1);
  }
}

runTests();

