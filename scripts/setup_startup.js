const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const startupFolder = path.join(
  process.env.APPDATA,
  'Microsoft',
  'Windows',
  'Start Menu',
  'Programs',
  'Startup'
);
const vbsFile = path.join(startupFolder, 'QuantSolver_Startup.vbs');
const projectDir = path.resolve(__dirname, '..');
const runnerPath = path.join(projectDir, 'start_silent.vbs');

if (!fs.existsSync(runnerPath)) {
  console.error('[ERROR] Could not find start_silent.vbs at: ' + runnerPath);
  process.exit(1);
}

const content = `' =========================================================================
' QuantSolver Auto-Start Hook (Installed in Windows Startup)
' Runs start_silent.vbs with WindowStyle 0 (Completely Silent, No Window)
' =========================================================================
Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "wscript.exe """ & "${runnerPath}" & """", 0, False
Set WshShell = Nothing
`;

try {
  fs.writeFileSync(vbsFile, content, 'utf8');
  console.log('===================================================');
  console.log('  QuantSolver: Windows Autostart Installed');
  console.log('===================================================');
  console.log('[SUCCESS] Startup hook installed at:');
  console.log('  ' + vbsFile);
  console.log();
  console.log('The server will automatically start silently on PC boot.');
  console.log('Checking and launching background server now if not active...');

  // Also trigger start_silent.vbs now
  exec(`wscript.exe "${runnerPath}"`);
  console.log('[DONE] Server launcher invoked.');
  console.log('===================================================');
} catch (err) {
  console.error('[ERROR] Failed to write to Startup folder:', err.message);
  process.exit(1);
}
