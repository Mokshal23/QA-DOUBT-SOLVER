const { execSync } = require('child_process');

console.log('===================================================');
console.log('  QuantSolver: Stopping Background Server...');
console.log('===================================================');

try {
  const output = execSync(
    'powershell -NoProfile -Command "(Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue).OwningProcess"',
    { encoding: 'utf8' }
  ).trim();

  if (output) {
    const pids = output.split(/\r?\n/).map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n > 0);
    for (const pid of pids) {
      try {
        execSync(`taskkill /F /PID ${pid} /T`, { stdio: 'ignore' });
        console.log(`[SUCCESS] Terminated background process (PID: ${pid}) on port 3000.`);
      } catch (e) {
        try {
          process.kill(pid, 'SIGKILL');
          console.log(`[SUCCESS] Killed process PID: ${pid}`);
        } catch (err) {
          console.warn(`[WARN] Could not terminate PID ${pid}: ${err.message}`);
        }
      }
    }
  } else {
    console.log('[INFO] No server process was found listening on port 3000.');
  }
} catch (err) {
  console.log('[INFO] Port 3000 is free.');
}

console.log('Port 3000 is now free.');
console.log('===================================================');
