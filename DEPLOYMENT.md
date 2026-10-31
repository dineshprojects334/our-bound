# Deployment Guide - Our Bound Birthday Website

This guide covers deploying the Our Bound birthday website using GitHub → Netlify for the frontend and Render/Railway for the backend.

---

## 📋 Prerequisites

Before deploying, ensure you have:

- GitHub account
- Netlify account
- MongoDB Atlas account (free tier is sufficient)
- Cloudinary account (free tier is sufficient)
- Render or Railway account (for backend hosting)

---

## 🗄️ MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (free M0 tier is sufficient)

### 2. Configure Database Access

1. Go to **Database Access** → **Add New Database User**
2. Create a username and strong password
3. Set **Database User Privileges** to **Read and write to any database**
4. Click **Add User**

### 3. Configure Network Access

1. Go to **Network Access** → **Add IP Address**
2. Select **Allow Access from Anywhere** (0.0.0.0/0)
3. This is required for Netlify Functions and Render/Railway to connect
4. Click **Confirm**

### 4. Get Connection String

1. Go to **Database** → **Connect** → **Connect your application**
2. Select your driver (Node.js)
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Save this as `MONGODB_URI`

---

## ☁️ Cloudinary Setup

### 1. Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for a free account

### 2. Get API Credentials

1. Go to **Dashboard** → **Account Details**
2. Copy the following:
   - **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - **API Key** → `CLOUDINARY_API_KEY`
   - **API Secret** → `CLOUDINARY_API_SECRET`

### 3. Configure Upload Presets (Optional)

1. Go to **Settings** → **Upload**
2. Create an unsigned upload preset for testing (not recommended for production)
3. For production, use signed uploads via backend functions

---

## 🚀 Backend Deployment (Render or Railway)

### Option A: Deploy on Render

#### 1. Prepare Backend Code

Your backend functions are already in `netlify/functions/`. For Render, you'll need to create a separate Express server.

Create a new file `server.js` in the project root:

```javascript
const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { v2: cloudinary } = require('cloudinary');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
let db;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db(process.env.MONGODB_DB_NAME || 'our-bound');
  }
  return db;
}

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Import and use your Netlify functions as Express routes
// You'll need to refactor your Netlify functions to work with Express
// This is a simplified example

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports.handler = serverless(app);
```

#### 2. Deploy to Render

1. Push your code to GitHub (see below)
2. Go to [Render](https://render.com)
3. Click **New** → **Web Service**
4. Connect your GitHub repository
5. Configure:
   - **Name**: `our-bound-backend`
   - **Branch**: `main`
   - **Root Directory**: `.` (or your backend folder)
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
6. Add Environment Variables:
   - `MONGODB_URI` (your MongoDB connection string)
   - `MONGODB_DB_NAME` = `our-bound`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `ADMIN_PASSCODE` (your secret admin passcode)
7. Click **Deploy Web Service**

#### 3. Get Backend URL

After deployment, Render will provide a URL like:
```
https://our-bound-backend.onrender.com
```
Save this as your `VITE_API_BASE_URL`.

---

### Option B: Deploy on Railway

1. Go to [Railway](https://railway.app)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your repository
4. Railway will auto-detect Node.js
5. Add environment variables in the Railway dashboard
6. Deploy and get the backend URL

---

## 🌐 Frontend Deployment (Netlify via GitHub)

### Step 1: Initialize Git Repository

```bash
cd "/Users/dineshumashankar/Library/Mobile Documents/com~apple~CloudDocs/yashi birthday"
git init
git add .
git commit -m "Initial commit: Our Bound birthday website"
```

### Step 2: Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **+** → **New repository**
3. Repository name: `our-bound-birthday`
4. Make it **Private** (recommended for personal projects)
5. Don't initialize with README, .gitignore, or license
6. Click **Create repository**

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/our-bound-birthday.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### Step 4: Connect GitHub to Netlify

1. Go to [Netlify](https://netlify.com)
2. Log in or sign up
3. Click **Add new site** → **Import an existing project**
4. Select **GitHub** and authorize Netlify
5. Select your `our-bound-birthday` repository
6. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
7. Click **Deploy site**

### Step 5: Configure Netlify Environment Variables

1. After deployment, go to **Site Configuration** → **Environment variables**
2. Add the following variables:

#### Frontend Variables
```
VITE_API_BASE_URL = /.netlify/functions
VITE_ADMIN_PASSCODE = your-secret-passcode
```

#### Backend Variables (for Netlify Functions)
```
MONGODB_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME = our-bound
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret
ADMIN_PASSCODE = your-secret-passcode
```

**IMPORTANT**: The MongoDB URI and Cloudinary secrets should match what you set up earlier.

### Step 6: Configure SPA Routing

Your `netlify.toml` already has the configuration, but verify it exists:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Also ensure `public/_redirects` contains:
```
/* /index.html 200
```

### Step 7: Redeploy

After adding environment variables:
1. Go to **Deploys** in Netlify
2. Click **Trigger deploy** → **Deploy site**
3. Wait for the build to complete

---

## 🔧 Environment Variables Summary

### Frontend (.env.local for local development)
```env
VITE_API_BASE_URL=/.netlify/functions
VITE_ADMIN_PASSCODE=admin2410
```

### Backend / Netlify Functions
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=our-bound
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ADMIN_PASSCODE=admin2410
GALLERY_USERNAME=your-gallery-username
GALLERY_PASSWORD=your-gallery-password
```

### Production (Netlify Dashboard)
Add all backend variables to Netlify's environment variables section.

---

## 🎯 Production API URL Configuration

### Using Netlify Functions (Recommended)

If you're using Netlify Functions (which this project already has), the frontend will automatically use:
```
/.netlify/functions
```

This works both locally (with `netlify dev`) and in production.

### Using Separate Backend (Render/Railway)

If you deploy the backend separately on Render/Railway:

1. Update `.env.local`:
```env
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

2. Update `src/lib/api.ts` to use the correct base URL in production.

3. Add `FRONTEND_URL` to backend environment variables for CORS:
```env
FRONTEND_URL=https://your-site.netlify.app
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` files**: Add `.env` to `.gitignore` (already done)
2. **Use strong passcodes**: Change `admin2410` to a secure passcode
3. **Rotate secrets**: Regularly update MongoDB and Cloudinary credentials
4. **Limit MongoDB access**: In production, consider whitelisting specific IP ranges
5. **Enable HTTPS**: Netlify automatically provides SSL certificates
6. **Use signed Cloudinary uploads**: Current implementation uses backend-signed uploads

---

## 📱 Testing Your Deployment

### 1. Test Frontend
- Open your Netlify URL
- Test login functionality
- Navigate through all stages
- Test the Jump Adventure game

### 2. Test Admin Panel
- Click "Customize / Jump" (should appear after login)
- Enter admin passcode
- Test photo upload
- Verify photos appear in gallery
- Test delete functionality

### 3. Test Shared Gallery
- Upload a photo as admin
- Open the site in an incognito window
- Login and check if the photo appears
- This confirms MongoDB + Cloudinary integration works

### 4. Test MongoDB Connection
- Check Netlify Function logs
- Look for database connection errors
- Verify data is being saved in MongoDB Atlas Dashboard

### 5. Test Cloudinary
- Check Cloudinary Media Library
- Verify uploaded images appear there
- Confirm URLs are accessible

---

## 🔄 Continuous Deployment

With GitHub connected to Netlify:

1. **Automatic Deployments**: Every push to `main` triggers a new deployment
2. **Preview Deployments**: Pull requests create preview URLs
3. **Rollback**: You can rollback to previous deployments in Netlify

---

## 🐛 Troubleshooting

### Build Fails
- Check build logs in Netlify
- Ensure `package.json` has correct scripts
- Verify all dependencies are in `package.json`

### Functions Not Working
- Check environment variables are set in Netlify
- Verify MongoDB connection string is correct
- Check Cloudinary credentials
- Review function logs in Netlify

### Photos Not Uploading
- Verify Cloudinary API secret is correct
- Check MongoDB connection
- Ensure file size is under 15MB
- Check browser console for errors

### CORS Errors
- If using separate backend, ensure `FRONTEND_URL` is set
- Check CORS configuration in backend
- Verify API base URL is correct

### Game Not Working
- Ensure JavaScript is enabled
- Check browser console for errors
- Verify canvas element is rendering
- Test on different browsers

---

## 📞 Support Resources

- [Netlify Documentation](https://docs.netlify.com)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)

---

## ✅ Deployment Checklist

Before going live:

- [ ] MongoDB Atlas configured with cluster, user, and network access
- [ ] Cloudinary account created and credentials saved
- [ ] Backend deployed (Render/Railway) OR using Netlify Functions
- [ ] GitHub repository created and code pushed
- [ ] Netlify connected to GitHub
- [ ] Netlify environment variables configured
- [ ] Frontend builds successfully
- [ ] Login functionality tested
- [ ] Photo upload tested
- [ ] Gallery displays uploaded photos
- [ ] Admin panel accessible with passcode
- [ ] Jump Adventure game works
- [ ] Custom navigation (Customize/Jump) hidden before login
- [ ] Custom navigation appears after login
- [ ] MongoDB data persists across deployments
- [ ] Cloudinary images accessible
- [ ] HTTPS enabled (automatic on Netlify)
- [ ] Mobile responsiveness tested

---

## 🎉 You're Live!

Once deployment is complete, share your Netlify URL with the birthday person! They'll be able to:

- Login with their passcode
- Experience the full birthday journey
- View shared photos from MongoDB
- Play the Jump Adventure game
- (If you give them admin access) Upload their own photos

Happy birthday to your best friend! 🎂❤️
