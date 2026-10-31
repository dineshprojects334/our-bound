# MongoDB Atlas + Cloudinary + Netlify Setup Guide

This beginner-friendly guide will walk you through setting up the complete cloud infrastructure for Our Bound.

---

## Part 1: MongoDB Atlas Setup (Database)

MongoDB Atlas is a cloud-hosted MongoDB database. It's where your memories data will be stored.

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **"Try Free"** or **"Start Free"**
3. Sign up with your email (or use Google/GitHub login)
4. You'll get 512MB free storage - perfect for this project!

### Step 2: Create a Free Cluster

1. After signing up, you'll see the **"Build a Database"** screen
2. Select **"M0 Sandbox"** (Free tier - 512MB storage)
3. Choose a cloud provider (AWS is recommended)
4. Choose a region closest to you (e.g., AWS → Singapore if you're in Asia)
5. **Cluster name**: Enter something like `our-bound-cluster`
6. Click **"Create"**
7. Wait for the cluster to be created (takes 2-5 minutes)

### Step 3: Create Database User

1. In the left sidebar, click **"Database Access"** under **Security**
2. Click **"Add New Database User"**
3. **Authentication Method**: Select **"Password"**
4. **Username**: Enter a username (e.g., `our-bound-admin`)
5. **Password**: Create a strong password (copy this - you'll need it!)
6. **Database User Privileges**: Select **"Read and write to any database"**
7. Click **"Create User"**

### Step 4: Configure Network Access

1. In the left sidebar, click **"Network Access"** under **Security**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (adds `0.0.0.0/0`)
4. Click **"Confirm"**
5. **Why?** Netlify Functions need to access your database from anywhere

### Step 5: Get Connection String

1. In the left sidebar, click **"Database"** → **"Clusters"**
2. Find your cluster and click **"Connect"**
3. Select **"Connect your application"**
4. **Driver**: Select **"Node.js"**
5. **Version**: Select the latest (e.g., `6.0 or later`)
6. Copy the connection string - it looks like:
   ```
   mongodb+srv://our-bound-admin:<password>@our-bound-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with the actual password you created in Step 3
8. Save this - you'll add it to `.env.local`

---

## Part 2: Cloudinary Setup (Photo Storage)

Cloudinary is where your photos will be stored and optimized.

### Step 1: Create Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Click **"Sign up for free"**
3. Sign up with your email or Google account
4. You'll get 25GB free storage - plenty for thousands of photos!

### Step 2: Get Your Cloudinary Credentials

1. After signing up, you'll be on the Dashboard
2. Look for the **"Account Details"** section
3. You'll see three important values:
   - **Cloud Name**: Something like `abc123xyz`
   - **API Key**: A long number like `123456789012345`
   - **API Secret**: A long string like `abcdefghijklmnopqrstuvwxyz123456`
4. Copy all three values - you'll need them for `.env.local`

### Step 3: (Optional) Configure Upload Settings

1. In Cloudinary Dashboard, go to **Settings** → **Upload**
2. You can configure:
   - **Allowed formats**: JPG, PNG, WebP, etc.
   - **Max file size**: We recommend 15MB
   - **Auto-format**: Convert to WebP for better performance
3. These settings are optional - the code already validates files

---

## Part 3: Update `.env.local` File

Now let's put everything together.

1. Go to your project folder
2. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```
3. Open `.env.local` in a text editor
4. Fill in your values:

```env
# MongoDB Atlas (from Part 1)
MONGODB_URI=mongodb+srv://our-bound-admin:YOUR_PASSWORD@our-bound-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=our-bound

# Cloudinary (from Part 2)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Admin Passcode
VITE_ADMIN_PASSCODE=admin2410

# API Base (leave as is)
VITE_API_BASE=/.netlify/functions
```

5. Save the file

---

## Part 4: Test Locally

### Option A: Simple Test (Frontend Only)

1. Run:
   ```bash
   npm run dev
   ```
2. Open http://localhost:5173
3. The site will work, but cloud features (memories, uploads) won't work yet
4. This is fine for testing the UI

### Option B: Full Test (With Netlify Functions)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```
2. Login to Netlify:
   ```bash
   netlify login
   ```
3. Run with functions:
   ```bash
   netlify dev
   ```
4. Open http://localhost:8888
5. Now cloud features will work!

---

## Part 5: Deploy to Netlify

### Step 1: Push to GitHub

1. Make sure `.env.local` is in `.gitignore` (it should be)
2. Commit your changes:
   ```bash
   git add .
   git commit -m "Add MongoDB and Cloudinary integration"
   git push
   ```

### Step 2: Deploy to Netlify

1. Go to [https://netlify.com](https://netlify.com)
2. Sign up/login (GitHub login is easiest)
3. Click **"Add new site"** → **"Import an existing project"**
4. Click **"Add from Git"**
5. Authorize Netlify to access your GitHub
6. Select your repository
7. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`
8. Click **"Deploy site"**
9. Wait for deployment to complete (1-2 minutes)

### Step 3: Add Environment Variables

1. After deployment, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"**
3. Add each variable from your `.env.local`:
   - `MONGODB_URI` = your MongoDB connection string
   - `MONGODB_DB_NAME` = `our-bound`
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret
   - `ADMIN_PASSCODE` = your admin passcode
   - `VITE_ADMIN_PASSCODE` = same as ADMIN_PASSCODE
4. Click **"Save"**
5. Redeploy the site (Netlify will prompt you)

---

## Part 6: Test Deployment

1. Open your deployed Netlify URL
2. Try logging in with the app credentials
3. Click "Manage Memories" and enter your admin passcode
4. Try uploading a photo
5. If it works, congratulations! 🎉

---

## Troubleshooting

### "MongoDB connection failed"
- Check your `MONGODB_URI` is correct
- Make sure you replaced `<password>` with the actual password
- Verify Network Access allows `0.0.0.0/0`
- Check that the cluster is created (might take a few minutes)

### "Cloudinary upload failed"
- Verify `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` are correct
- Check that Cloudinary account is active
- Make sure the file is under 15MB

### "Netlify Functions not working locally"
- Install Netlify CLI: `npm install -g netlify-cli`
- Use `netlify dev` instead of `npm run dev`
- Make sure you're logged in: `netlify login`

### "401 Unauthorized" when uploading
- Check that `ADMIN_PASSCODE` is set in Netlify environment variables
- Make sure `VITE_ADMIN_PASSCODE` matches
- Verify you're using the correct passcode in the admin panel

### Build errors
- Run `npm install` to ensure dependencies are installed
- Check that `netlify/functions/package.json` exists
- Try `npm run build` locally first

---

## Security Tips

✅ **DO**:
- Keep your MongoDB password secure
- Keep your Cloudinary API secret secure
- Never commit `.env.local` to git
- Use strong passwords
- Change the default admin passcode

❌ **DON'T**:
- Share your credentials with anyone
- Commit secrets to GitHub
- Use weak passwords
- Leave the default admin passcode unchanged

---

## Cost Summary

Everything is FREE for this project:

| Service | Free Tier | What You Get |
|---------|-----------|--------------|
| **MongoDB Atlas** | Free | 512MB database storage |
| **Cloudinary** | Free | 25GB storage, 25GB bandwidth |
| **Netlify** | Free | Unlimited bandwidth, 500 builds/month |
| **Total** | **$0/month** | Everything you need! |

---

## Need Help?

If you get stuck:
1. Check the MongoDB Atlas Dashboard for errors
2. Check the Cloudinary Dashboard for errors
3. Look at the browser console (F12) for detailed errors
4. Review Netlify deployment logs
5. Double-check all environment variables

Good luck! 🎉
