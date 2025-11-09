@echo off
REM Quick Push Script for GitHub - Windows Batch

echo ========================================
echo GRiD Game - GitHub Push Script
echo ========================================
echo.

REM Check if remote already exists
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo Remote 'origin' already exists.
    echo Current remote URL:
    git remote get-url origin
    echo.
    echo Pushing to GitHub...
    git push -u origin main
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
    ) else (
        echo.
        echo ❌ Push failed. Please check:
        echo    1. GitHub repository exists
        echo    2. Remote URL is correct
        echo    3. You have push permissions
    )
) else (
    echo No remote configured.
    echo.
    echo Please create a GitHub repository first:
    echo    1. Go to https://github.com/new
    echo    2. Repository name: CoresNewGame
    echo    3. DO NOT initialize with README
    echo    4. Click "Create repository"
    echo.
    set /p username="Enter your GitHub username: "
    echo.
    echo Adding remote...
    git remote add origin https://github.com/%username%/CoresNewGame.git
    echo.
    echo Pushing to GitHub...
    git push -u origin main
    if %errorlevel% equ 0 (
        echo.
        echo ✅ Successfully pushed to GitHub!
        echo.
        echo Your repository: https://github.com/%username%/CoresNewGame
    ) else (
        echo.
        echo ❌ Push failed. Please check:
        echo    1. GitHub repository exists
        echo    2. Username is correct
        echo    3. You have push permissions
    )
)

echo.
pause

