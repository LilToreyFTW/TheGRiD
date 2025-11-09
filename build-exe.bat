@echo off
REM Build GRiD EXE and Copy to Website Downloads

echo ========================================
echo Building GRiD Windows EXE
echo ========================================
echo.

echo [1/3] Building Windows EXE Installer...
call npm run build:exe
if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Check errors above.
    pause
    exit /b 1
)

echo.
echo [2/3] Copying EXE to website downloads...
if exist "dist\GRiD-Setup-1.0.0-x64.exe" (
    if not exist "website\downloads" mkdir "website\downloads"
    copy "dist\GRiD-Setup-1.0.0-x64.exe" "website\downloads\GRiD-Setup.exe"
    echo ✅ EXE copied to website/downloads/GRiD-Setup.exe
) else (
    echo ⚠️  EXE file not found in dist folder
    echo    Checking for portable version...
    if exist "dist\win-unpacked\GRiD.exe" (
        echo ✅ Portable version found in dist/win-unpacked/
        echo    You can zip this folder for portable distribution
    )
)

echo.
echo [3/3] Building Portable Version...
call npm run build:exe:dir
if %errorlevel% equ 0 (
    echo ✅ Portable version built successfully
)

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo EXE Files:
if exist "dist\GRiD-Setup-1.0.0-x64.exe" (
    echo   ✅ Installer: dist\GRiD-Setup-1.0.0-x64.exe
    echo   ✅ Website: website\downloads\GRiD-Setup.exe
)
if exist "dist\win-unpacked\GRiD.exe" (
    echo   ✅ Portable: dist\win-unpacked\GRiD.exe
)
echo.
pause

