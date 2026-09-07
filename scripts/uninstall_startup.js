const fs = require('fs');
const path = require('path');

const startupFolder = path.join(
  process.env.APPDATA,
  'Microsoft',
  'Windows',
  'Start Menu',
  'Programs',
  'Startup'
);
const vbsFile = path.join(startupFolder, 'QuantSolver_Startup.vbs');

console.log('===================================================');
console.log('  QuantSolver: Uninstalling Windows Autostart');
console.log('===================================================');

try {
  if (fs.existsSync(vbsFile)) {
    fs.unlinkSync(vbsFile);
    console.log('[SUCCESS] QuantSolver_Startup.vbs removed from Windows Startup.');
    console.log('The server will no longer automatically start on Windows boot.');
  } else {
    console.log('[INFO] QuantSolver was not found in Windows Startup. Nothing to remove.');
  }
  console.log();
  console.log('Tip: To stop the currently running server, run stop_server.bat');
  console.log('===================================================');
} catch (err) {
  console.error('[ERROR] Failed to remove file from Startup folder:', err.message);
  process.exit(1);
}
