const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting WhatsApp Clone Development Environment...\n');

// Start JSON Server
console.log('📡 Starting Mock API Server...');
const jsonServer = spawn('json-server', [
  '--watch', 'mock/db.json',
  '--routes', 'mock/routes.json',
  '--port', '3001',
  '--host', 'localhost'
], { stdio: 'inherit' });

// Wait a moment for JSON server to start
setTimeout(() => {
  console.log('⚡ Starting Next.js Development Server...');
  const nextServer = spawn('npm', ['run', 'dev'], { stdio: 'inherit' });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    jsonServer.kill();
    nextServer.kill();
    process.exit();
  });
}, 2000);