# Deployment Guide - Portfolio 2026

## GitHub Pages Deployment Steps

### 1. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit - Portfolio 2026"
```

### 2. Create GitHub Repository
1. Go to https://github.com/veerajmorajkar
2. Click "New repository"
3. Name it: `portfolio_2026`
4. Keep it public
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 3. Connect Local Repository to GitHub
```bash
git remote add origin https://github.com/veerajmorajkar/portfolio_2026.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages
1. Go to your repository: https://github.com/veerajmorajkar/portfolio_2026
2. Click "Settings" tab
3. Click "Pages" in the left sidebar
4. Under "Build and deployment":
   - Source: Select "GitHub Actions"
5. Save the settings

### 5. Deploy
The site will automatically deploy when you push to the main branch!

Your site will be live at:
**https://veerajmorajkar.github.io/portfolio_2026/**

### Manual Deployment (Alternative)
If you prefer manual deployment using gh-pages:
```bash
npm install
npm run deploy
```

## Updating Your Site
Simply push changes to the main branch:
```bash
git add .
git commit -m "Update portfolio"
git push
```

The GitHub Action will automatically rebuild and deploy your site.

## Local Development
```bash
npm install
npm run dev
```

Visit http://localhost:5173 to see your site locally.

## Build Locally
```bash
npm run build
npm run preview
```
