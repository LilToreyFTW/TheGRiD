#!/bin/bash
# Complete GitHub & Vercel Deployment Script - Linux/Mac

echo "========================================"
echo "GRiD Game - Complete Deployment"
echo "========================================"
echo ""

# Step 1: GitHub Setup
echo "[1/4] GitHub Repository Setup"
echo ""
echo "Please create a GitHub repository first:"
echo "   1. Go to https://github.com/new"
echo "   2. Repository name: CoresNewGame"
echo "   3. DO NOT initialize with README"
echo "   4. Click 'Create repository'"
echo ""
read -p "Enter your GitHub username: " username
echo ""

# Check if remote exists
if git remote get-url origin >/dev/null 2>&1; then
    echo "Remote already exists. Updating..."
    git remote set-url origin "https://github.com/$username/CoresNewGame.git"
else
    echo "Adding GitHub remote..."
    git remote add origin "https://github.com/$username/CoresNewGame.git"
fi

echo ""
echo "[2/4] Pushing to GitHub..."
git push -u origin main
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "   Repository: https://github.com/$username/CoresNewGame"
else
    echo ""
    echo "❌ GitHub push failed!"
    echo "   Please check:"
    echo "   1. Repository exists on GitHub"
    echo "   2. Username is correct"
    echo "   3. You have push permissions"
    exit 1
fi

echo ""
echo "[3/4] Vercel Deployment Setup"
echo ""
echo "To deploy to Vercel, you have two options:"
echo ""
echo "Option A: Via Dashboard (Recommended)"
echo "   1. Go to https://vercel.com"
echo "   2. Sign in with GitHub"
echo "   3. Click 'Add New Project'"
echo "   4. Import repository: CoresNewGame"
echo "   5. Add environment variables (see DEPLOY.md)"
echo "   6. Click 'Deploy'"
echo ""
echo "Option B: Via CLI"
echo "   Run: npm i -g vercel"
echo "   Then: vercel login"
echo "   Then: vercel --prod"
echo ""

# Check if Vercel CLI is installed
if command -v vercel &> /dev/null; then
    echo "Vercel CLI is installed!"
    read -p "Deploy to Vercel now? (y/n): " deploy_now
    if [[ "$deploy_now" == "y" || "$deploy_now" == "Y" ]]; then
        echo ""
        echo "[4/4] Deploying to Vercel..."
        vercel --prod
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Successfully deployed to Vercel!"
        else
            echo ""
            echo "⚠️  Vercel deployment had issues. Check the output above."
        fi
    fi
else
    echo "Vercel CLI not installed."
    echo "Install it with: npm i -g vercel"
    echo "Then run: vercel login"
    echo "Then run: vercel --prod"
fi

echo ""
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "   1. Add environment variables in Vercel dashboard"
echo "   2. Test your deployment URL"
echo "   3. Share your game!"
echo ""

