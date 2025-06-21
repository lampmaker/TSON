# 🚀 GitHub Pages Deployment Guide

## Quick Deployment Steps

### 1. Enable GitHub Pages
1. Go to your repository: `https://github.com/lampmaker/TSON`
2. Click the **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

### 2. Access Your Live Demo
Your TSON demo will be available at:
**https://lampmaker.github.io/TSON/**

### 3. Automatic Deployment (Optional)
I've created a GitHub Actions workflow (`.github/workflows/pages.yml`) that will:
- Automatically deploy changes when you push to main branch
- Use the latest GitHub Pages deployment method
- Handle all the deployment details for you

## What Gets Deployed

- ✅ **index.html** - Your interactive TSON demo
- ✅ **src/** - Parser and creator JavaScript modules
- ✅ **docs/** - Documentation files
- ✅ **README.md** - Project documentation

## Testing Locally

Before deploying, you can test locally by:
1. Opening `index.html` in your browser
2. Or using a simple HTTP server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js (if you have http-server installed)
   npx http-server
   ```

## Custom Domain (Optional)

If you want to use a custom domain:
1. Add a `CNAME` file to your repository root
2. Put your domain name in the file (e.g., `tson.yourdomain.com`)
3. Configure your DNS to point to `lampmaker.github.io`

## Troubleshooting

- **Changes not showing?** GitHub Pages can take a few minutes to update
- **404 errors?** Make sure your main branch has the files and Pages is enabled
- **JavaScript not working?** Check browser console for CORS issues (shouldn't happen with GitHub Pages)

---

🌐 **Live Demo:** https://lampmaker.github.io/TSON/
📁 **Repository:** https://github.com/lampmaker/TSON
