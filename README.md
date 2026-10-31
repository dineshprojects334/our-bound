# Our Bound ♡ — Permanent Cloud Photo Gallery & Birthday Experience

> *"Namma memories, namma bond, forever. ❤️"*

An interactive, responsive, romantic, cinematic birthday surprise application named **Our Bound**, built with **React 19**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, **MongoDB Atlas**, **Cloudinary**, and **Netlify Functions**.

Designed specifically to celebrate a lifelong friendship bond, preserve memories permanently in the cloud, and allow continuous photo uploads even after deployment.

---

## ✨ Features & User Journey

1. **Brand Identity: Our Bound ♡**
   - Polished wordmark header displaying **"Our Bound ♡"** with gentle pulsing heart animations.
   - Tagline: *"Namma memories, namma bond, forever. ❤️"*
   - Deep midnight plum background with floating romantic hearts and neon pink accents.

2. **Private Personalized Login Screen**
   - Headline: *"A Little World Made Just for You ❤️"*
   - Password visibility toggle with eye icon
   - Friendly input validation and hint system (Passcode: `2410`, `birthday`, or `eruma`)
   - Session authentication preserving state across page reloads under `ourbound_authenticated`

3. **Thanglish Friendship Question Journey (7 Screens)**
   - All questions, options, and reactions written in natural Romanized Tamil-English (*Thanglish*)
   - Funny banter, chaos moments, emotional support, and shared memories
   - Heart-shaped progress indicators that fill with glowing pink light
   - Dynamic feedback bubbles with supportive reactions

4. **Escaping NO Button Interaction (Question 6)**
   - *"Oru question kekkava? Indha friendship-la irundhu, namma life long best friends-ah iruppiya? 🫂❤️♾️"*
   - Smooth spring physics evasion (`framer-motion`) when mouse pointer or touch approaches
   - Teasing quote bubbles in Thanglish
   - After attempts, the glowing YES button pulses even bigger!

5. **Heart Transition**
   - Particle gathering and giant glowing heart explosion across the viewport
   - *"Yayyy! Nee vandhuta! 🥹💖"*
   - Smooth segue into the Memories Scrapbook

6. **Permanent Cloud Memories Gallery**
   - Heading: *"Namma Little Collection of Memories 💗"*
   - Polaroid-style cards with washi tape, rotation angles, stamps, and handwritten titles
   - **Cloud-First Architecture**: Live records fetched from MongoDB Atlas via Netlify Functions, with automatic fallback to local demo memories if cloud is unconfigured
   - Interactive Lightbox: Click any photo for a full high-resolution modal with date, location, Thanglish description, and keyboard arrow navigation
   - Graceful image fallback for missing or slow-loading photos

7. **Secure Gallery Admin Panel ("Manage Memories")**
   - Protected by private passcode gate (`VITE_ADMIN_PASSCODE`)
   - Accessible via the **"Manage Memories"** button in the header or floating console
   - **Drag-and-Drop Photo Upload**: Multi-file selection, preview before saving
   - **Metadata Editor**: Memory title, personalized Thanglish description, date, and location
   - **Gallery Reordering**: Move up / move down controls to arrange display sequence
   - **Publish / Unpublish Toggle**: Set memories as live or draft
   - **Destructive Action Protection**: Confirmation dialog before deleting photos
   - **Automatic Cleanup**: Deleting a memory removes both the database record and the cloud storage asset

8. **Secret Wax-Sealed Birthday Letter**
   - 3D animated wax-sealed envelope with heart stamp
   - Unfolds into a parchment-style heartfelt letter
   - Emotional Thanglish friendship letter celebrating the birthday bestie

9. **Grand Birthday Celebration Finale**
   - Crowned portrait avatar with glowing neon ring
   - Animated multi-tiered birthday cake with blowable candles and realistic smoke puff
   - Multi-stage confetti fireworks (`canvas-confetti`) with streamers and hearts
   - Floating colorful balloons rising across the screen
   - Secret wish reveal and replay controls

10. **Web Audio Synthesizer & Music Player**
    - Procedural Web Audio API sound effects (chimes, pops, cartoon dodges, fanfares)
    - Zero external audio link dependency — 100% offline, guaranteed to play without 404 or CORS errors
    - Floating music player with track playlist and mute controls

---

## 🏛️ Architecture & Security Model

```mermaid
flowchart TD
    A["Browser / Visitor"] --> B["Our Bound Frontend\n(Netlify)"]
    Admin["Owner / Admin"] -->|"Passcode"| AdminPanel["Admin Management Area\n(/src/components/screens/MemoryAdmin.tsx)"]
    AdminPanel -->|"Upload Photo (JPEG/PNG/WebP < 15MB)"| NetlifyFunctions["Netlify Functions\n(/netlify/functions)"]
    NetlifyFunctions -->|"Upload"| Cloudinary["Cloudinary\n(Photo Storage)"]
    NetlifyFunctions -->|"Save / Edit / Reorder / Delete"| MongoDB["MongoDB Atlas\n(Database)"]
    B -->|"Fetch Published Memories"| NetlifyFunctions
    NetlifyFunctions -->|"Query"| MongoDB
    B -->|"Load Images"| Cloudinary
```

### Security Safeguards

- **Private-by-Default Database Access**: MongoDB Atlas is secured via Network Access (IP whitelist) and authentication. Only Netlify Functions can access the database.
- **Protected Administrative Operations**: All database operations (INSERT, UPDATE, DELETE) go through Netlify Functions, which verify the admin passcode before executing.
- **Private Cloud Storage**: Cloudinary can be configured with upload presets and signed URLs. Photos are stored securely.
- **Zero Secret Exposure**: Database credentials (MONGODB_URI) and Cloudinary secrets are server-side environment variables, never exposed to the browser.
- **File Validation**: Uploads are validated by MIME type (JPEG, PNG, WebP, GIF, HEIC) and size limit (15 MB maximum).
- **Unique Storage Keys**: Storage paths use randomized timestamps (`memories/<timestamp>_<random>.<ext>`) to prevent collision or overwriting.
- **Safe Replacement & Deletion**: Database deletion triggers Cloudinary cleanup so orphaned files don't accumulate.

---

## 🚀 Setup & Local Development

### 1. Clone & Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=our-bound
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
VITE_ADMIN_PASSCODE=your-secret-admin-passcode
VITE_API_BASE=/.netlify/functions
```

### 3. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (free tier M0 is sufficient)
3. In Database Access, create a database user with username and password
4. In Network Access, allow access from anywhere (0.0.0.0/0) for Netlify Functions
5. Get your connection string from Connect → Connect your application
6. Add to `.env.local` as `MONGODB_URI`

### 4. Set Up Cloudinary

1. Go to [Cloudinary](https://cloudinary.com) and create a free account
2. Go to Dashboard → Account Details
3. Copy your Cloud Name, API Key, and API Secret
4. Add to `.env.local` as `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

### 5. Start Local Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Note**: Netlify Functions won't work locally without Netlify CLI. For full local testing, run:
```bash
netlify dev
```

---

## 🌐 Deployment Guide

### Deploying to Netlify (Recommended)

1. Push your repository to GitHub (ensure `.env.local` is ignored in `.gitignore`).
2. Log into [Netlify](https://netlify.com) and select **"Add new site"** → **"Import an existing project"**.
3. Select your repository.
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. In **Site Configuration → Environment variables**, add:
   - `MONGODB_URI`: Your MongoDB connection string
   - `MONGODB_DB_NAME`: your database name (e.g., `our-bound`)
   - `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
   - `CLOUDINARY_API_KEY`: Your Cloudinary API key
   - `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
   - `ADMIN_PASSCODE`: Your private admin passcode
   - `VITE_ADMIN_PASSCODE`: Same as ADMIN_PASSCODE (for frontend)
6. Click **Deploy Site**. SPA routing is configured via `netlify.toml` and `public/_redirects`.

---

## 🔒 Admin Panel Usage ("Manage Memories")

1. Open the deployed website or local server.
2. Complete the initial login (or use the Dev Customizer drawer to skip to any stage).
3. In the top navigation bar, click the **"Manage Memories"** button (or click the bottom-left admin icon).
4. Enter your `VITE_ADMIN_PASSCODE` (default: `admin2410`).
5. In the Admin Panel:
   - **Upload**: Drag and drop photos or click to browse.
   - **Edit Draft**: Fill in memory title, Thanglish story, optional date, and location.
   - **Upload & Save**: Photos are uploaded to Cloudinary and records are created in MongoDB via Netlify Functions.
   - **Live Updates**: Newly uploaded photos immediately appear in the public memories gallery without requiring a redeployment!
   - **Reorder**: Use the Up and Down arrows to customize the order in which memories appear.
   - **Publish / Unpublish**: Toggle photos between draft and live status.
   - **Delete**: Click the trash icon and confirm to safely delete the memory and its cloud storage file.

---

## 💾 Long-Term Retention & Backup Procedures

Your photos and memories are saved in permanent cloud storage (Cloudinary) and a MongoDB database. They will persist across code changes, new deployments, and git pushes.

### Free Tier Limits

**MongoDB Atlas Free Tier (M0)**:
- **Database Storage**: 512MB (~thousands of memory metadata rows)
- **Shared RAM**: 512MB
- **Perfect for personal projects**

**Cloudinary Free Tier**:
- **Storage**: 25GB (~2,500 high-res photos)
- **Bandwidth**: 25GB/month
- **Transformations**: 25GB/month

### Backup Procedure

To ensure your memories are never lost, export backups periodically:

#### 1. Export MongoDB Data
From MongoDB Atlas:
- Go to **Database** → **Collections** → **Export Collection**
- Or use MongoDB Compass to export as JSON
- Or use mongodump: `mongodump --uri="your-connection-string" --out=backup`

#### 2. Download Cloud Photos Backup
Cloudinary provides backup options:
- Use Cloudinary's Media Library to download assets
- Or use Cloudinary CLI: `cld admin download`

#### 3. Disaster Recovery
If you ever switch cloud providers:
1. Export MongoDB data
2. Download all photos from Cloudinary
3. Import to new database/storage
4. Update environment variables and redeploy

---

## 🎨 Color Tokens & Design System

|| Token | Hex | Usage |
|---|---|---|
| Hot Pink | `#FF4F9A` | Primary brand glow, active buttons, neon accents |
| Blush Pink | `#FFE4EF` | Subtitles, badge backgrounds, taglines |
| Rose | `#E91E63` | Wax seals, buttons, deep romantic accents |
| Lavender | `#B8A4FF` | Soft text, secondary accents |
| Purple | `#8067D8` | Deep gradients, ambient lighting |
| Midnight Plum | `#24142F` | Romantic card glassmorphism |
| Midnight Dark | `#150B1C` | Page background canvas |

---

## 🛠️ Verification & Acceptance Tests

Run the production build:
```bash
npm run build
```

Expected result:
```
✓ built in ~2.9s with 0 errors
```

For full local testing with Netlify Functions:
```bash
npm install -g netlify-cli
netlify dev
```
