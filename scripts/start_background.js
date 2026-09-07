const net = require('net');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const port = 3000;
const server = net.createServer();

server.once('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    // Port 3000 is already in use -> exit cleanly (Port Resilience)
    console.log(`[INFO] Port ${port} is already in use. Skipping server launch.`);
    process.exit(0);
  } else {
    console.error(`[ERROR] Server socket error:`, err);
    process.exit(1);
  }
});

server.once('listening', () => {
  server.close(() => {
    // Port 3000 is free -> Launch Next.js binary directly in background
    const projectDir = path.resolve(__dirname, '..');
    const logFile = path.join(projectDir, 'background_server.log');
    const nextBin = path.join(projectDir, 'node_modules', 'next', 'dist', 'bin', 'next');

    const out = fs.openSync(logFile, 'a');
    const err = fs.openSync(logFile, 'a');

    const subprocess = spawn(process.execPath, [nextBin, 'dev'], {
      cwd: projectDir,
      detached: true,
      stdio: ['ignore', out, err],
      windowsHide: true,
      env: {
        ...process.env,
        PORT: '3000',
      },
    });

    subprocess.unref();
    console.log(`[SUCCESS] QuantSolver server launched in background on port ${port}.`);
    process.exit(0);
  });
});

server.listen(port);
