' =========================================================================
' QuantSolver - Silent Background Server Runner
' Starts the Next.js development server completely hidden (no console window)
' Checks if port 3000 is already listening before starting (Port Resilience)
' =========================================================================

Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Get project directory where this script resides
projectDir = FSO.GetParentFolderName(WScript.ScriptFullName)

' Check if port 3000 is already listening (0 = Occupied, 1 = Free)
checkCmd = "cmd.exe /c ""netstat -ano | findstr :3000 | findstr LISTENING >nul && exit /b 0 || exit /b 1"""
ret = WshShell.Run(checkCmd, 0, True)

If ret = 1 Then
    ' Port 3000 is free -> Launch run_dev.bat completely silently (WindowStyle 0)
    WshShell.CurrentDirectory = projectDir
    WshShell.Run """" & projectDir & "\run_dev.bat""", 0, False
End If

Set WshShell = Nothing
Set FSO = Nothing
