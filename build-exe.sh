#!/bin/bash
# Build GRiD EXE and Copy to Website Downloads

echo "========================================"
echo "Building GRiD Windows EXE"
echo "========================================"
echo ""

echo "[1/3] Building Windows EXE Installer..."
npm run build:exe
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed! Check errors above."
    exit 1
fi

echo ""
echo "[2/3] Copying EXE to website downloads..."
if [ -f "dist/GRiD-Setup-1.0.0-x64.exe" ]; then
    mkdir -p website/downloads
    cp "dist/GRiD-Setup-1.0.0-x64.exe" "website/downloads/GRiD-Setup.exe"
    echo "✅ EXE copied to website/downloads/GRiD-Setup.exe"
else
    echo "⚠️  EXE file not found in dist folder"
    echo "   Checking for portable version..."
    if [ -f "dist/win-unpacked/GRiD.exe" ]; then
        echo "✅ Portable version found in dist/win-unpacked/"
        echo "   You can zip this folder for portable distribution"
    fi
fi

echo ""
echo "[3/3] Building Portable Version..."
npm run build:exe:dir
if [ $? -eq 0 ]; then
    echo "✅ Portable version built successfully"
fi

echo ""
echo "========================================"
echo "Build Complete!"
echo "========================================"
echo ""
echo "EXE Files:"
if [ -f "dist/GRiD-Setup-1.0.0-x64.exe" ]; then
    echo "  ✅ Installer: dist/GRiD-Setup-1.0.0-x64.exe"
    echo "  ✅ Website: website/downloads/GRiD-Setup.exe"
fi
if [ -f "dist/win-unpacked/GRiD.exe" ]; then
    echo "  ✅ Portable: dist/win-unpacked/GRiD.exe"
fi
echo ""

