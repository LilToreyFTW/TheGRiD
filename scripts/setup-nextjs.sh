#!/bin/bash
# setup-nextjs.sh - Setup script for Next.js deployment

echo "🚀 Setting up Next.js project structure..."

# Create public directory structure
echo "📁 Creating public directory structure..."
mkdir -p public/game/js
mkdir -p public/game/css
mkdir -p public/website/css
mkdir -p public/website/js
mkdir -p public/videogame/game_images

# Copy game files to public/game
echo "📦 Copying game files..."
if [ -d "js" ]; then
    cp -r js/* public/game/js/ 2>/dev/null || true
fi
if [ -d "css" ]; then
    cp -r css/* public/game/css/ 2>/dev/null || true
fi
if [ -f "index.html" ]; then
    cp index.html public/game/ 2>/dev/null || true
fi
if [ -f "loading.html" ]; then
    cp loading.html public/game/ 2>/dev/null || true
fi

# Copy website files
echo "🌐 Copying website files..."
if [ -d "website" ]; then
    cp -r website/* public/website/ 2>/dev/null || true
fi

# Copy game assets
echo "🎨 Copying game assets..."
if [ -d "videogame" ]; then
    cp -r videogame/* public/videogame/ 2>/dev/null || true
fi

# Copy other assets
if [ -d "gametitle" ]; then
    cp -r gametitle public/ 2>/dev/null || true
fi
if [ -d "threeJS_Development" ]; then
    cp -r threeJS_Development public/ 2>/dev/null || true
fi

echo "✅ Setup complete!"
echo "📝 Next steps:"
echo "   1. Update file paths in code to use /public/ paths"
echo "   2. Run: npm install"
echo "   3. Run: npm run dev"
echo "   4. Deploy to Vercel"

