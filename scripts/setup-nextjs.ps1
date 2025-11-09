# PowerShell script for Windows
# setup-nextjs.ps1 - Setup script for Next.js deployment

Write-Host "🚀 Setting up Next.js project structure..." -ForegroundColor Cyan

# Create public directory structure
Write-Host "📁 Creating public directory structure..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "public/game/js" | Out-Null
New-Item -ItemType Directory -Force -Path "public/game/css" | Out-Null
New-Item -ItemType Directory -Force -Path "public/website/css" | Out-Null
New-Item -ItemType Directory -Force -Path "public/website/js" | Out-Null
New-Item -ItemType Directory -Force -Path "public/videogame/game_images" | Out-Null

# Copy game files to public/game
Write-Host "📦 Copying game files..." -ForegroundColor Yellow
if (Test-Path "js") {
    Copy-Item -Path "js\*" -Destination "public/game/js\" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "css") {
    Copy-Item -Path "css\*" -Destination "public/game/css\" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "index.html") {
    Copy-Item -Path "index.html" -Destination "public/game\" -Force -ErrorAction SilentlyContinue
}
if (Test-Path "loading.html") {
    Copy-Item -Path "loading.html" -Destination "public/game\" -Force -ErrorAction SilentlyContinue
}

# Copy website files
Write-Host "🌐 Copying website files..." -ForegroundColor Yellow
if (Test-Path "website") {
    Copy-Item -Path "website\*" -Destination "public/website\" -Recurse -Force -ErrorAction SilentlyContinue
}

# Copy game assets
Write-Host "🎨 Copying game assets..." -ForegroundColor Yellow
if (Test-Path "videogame") {
    Copy-Item -Path "videogame\*" -Destination "public/videogame\" -Recurse -Force -ErrorAction SilentlyContinue
}

# Copy other assets
if (Test-Path "gametitle") {
    Copy-Item -Path "gametitle\*" -Destination "public/gametitle\" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "threeJS_Development") {
    Copy-Item -Path "threeJS_Development\*" -Destination "public/threeJS_Development\" -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Update file paths in code to use /public/ paths" -ForegroundColor White
Write-Host "   2. Run: npm install" -ForegroundColor White
Write-Host "   3. Run: npm run dev" -ForegroundColor White
Write-Host "   4. Deploy to Vercel" -ForegroundColor White

