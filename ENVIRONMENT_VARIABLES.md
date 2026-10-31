# Environment Variables Configuration

This document lists all environment variables required for the Our Bound birthday website, their purposes, and how to configure them.

---

## 📋 Overview

The project uses environment variables for:
- Database connections (MongoDB Atlas)
- Cloud storage (Cloudinary)
- API configuration
- Authentication
- Build and deployment settings

---

## 🔐 Security Best Practices

1. **Never commit `.env` files to Git**
2. **Use strong, unique passwords and secrets**
3. **Rotate secrets regularly**
4. **Limit database access to trusted IPs in production**
5. **Use different secrets for development and production**

---

## 📁 Environment Files

### Development (.env.local)

Create a `.env.local` file in the project root for local development:

```env
# API Configuration
VITE_API_BASE_URL=/.netlify/functions

# Admin Passcode (for accessing admin panel)
VITE_ADMIN_PASSCODE=admin2410
```

### Production (Netlify Dashboard)

Add these variables in Netlify → Site Settings → Environment Variables.

---

## 🗄️ MongoDB Variables

### MONGODB_URI

**Purpose**: Connection string for MongoDB Atlas database

**Format**:
```
mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority
```

**Example**:
```
mongodb+srv://myuser:securepassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority
```

**How to get**:
1. Go to MongoDB Atlas Dashboard
2. Click **Connect** → **Connect your application**
3. Copy the connection string
4. Replace `<password>` with your database user password

**Where to set**:
- Development: Not needed (fallback to local memories)
- Production: Netlify Environment Variables

---

### MONGODB_DB_NAME

**Purpose**: Name of the database in MongoDB Atlas

**Default**: `our-bound`

**Example**:
```
MONGODB_DB_NAME=our-bound
```

**Where to set**:
- Development: Not needed
- Production: Netlify Environment Variables

---

## ☁️ Cloudinary Variables

### CLOUDINARY_CLOUD_NAME

**Purpose**: Your Cloudinary cloud account name

**Example**:
```
CLOUDINARY_CLOUD_NAME=my-birthday-cloud
```

**How to get**:
1. Go to Cloudinary Dashboard
2. Copy the **Cloud Name** from Account Details

**Where to set**:
- Development: Not needed (fallback to local memories)
- Production: Netlify Environment Variables

---

### CLOUDINARY_API_KEY

**Purpose**: API key for Cloudinary authentication

**Example**:
```
CLOUDINARY_API_KEY=123456789012345
```

**How to get**:
1. Go to Cloudinary Dashboard
2. Copy the **API Key** from Account Details

**Where to set**:
- Development: Not needed
- Production: Netlify Environment Variables

**Security**: This is public but should still be kept secure.

---

### CLOUDINARY_API_SECRET

**Purpose**: API secret for Cloudinary authentication (for signed uploads)

**Example**:
```
CLOUDINARY_API_SECRET=abc123def456ghi789
```

**How to get**:
1. Go to Cloudinary Dashboard
2. Copy the **API Secret** from Account Details

**Where to set**:
- Development: Not needed
- Production: Netlify Environment Variables

**Security**: ⚠️ **CRITICAL** - Never expose this in frontend code!

---

## 🔑 Authentication Variables

### ADMIN_PASSCODE

**Purpose**: Passcode to access the admin panel for uploading and managing photos

**Default**: `admin2410`

**Example**:
```
ADMIN_PASSCODE=mySecurePass123
```

**Where to set**:
- Development: `VITE_ADMIN_PASSCODE` in `.env.local`
- Production: Both `ADMIN_PASSCODE` and `VITE_ADMIN_PASSCODE` in Netlify

**Security**: Use a strong, unique passcode. Do not use common passwords.

### GALLERY_USERNAME and GALLERY_PASSWORD

**Purpose**: Credentials checked by the `auth` Netlify Function when a visitor signs in.

**Where to set**: Netlify environment variables (server-side), and `.env.local` when running with Netlify CLI.

These values do not use the `VITE_` prefix and must not be exposed to frontend code.

---

### VITE_ADMIN_PASSCODE

**Purpose**: Frontend version of admin passcode (for React app)

**Default**: `admin2410`

**Example**:
```
VITE_ADMIN_PASSCODE=mySecurePass123
```

**Where to set**:
- Development: `.env.local`
- Production: Netlify Environment Variables

**Note**: Should match `ADMIN_PASSCODE` for consistency.

---

## 🌐 API Configuration Variables

### VITE_API_BASE_URL

**Purpose**: Base URL for API calls (Netlify Functions or external backend)

**Development value**:
```
VITE_API_BASE_URL=/.netlify/functions
```

**Production value (with Netlify Functions)**:
```
VITE_API_BASE_URL=/.netlify/functions
```

**Production value (with separate backend)**:
```
VITE_API_BASE_URL=https://your-backend.onrender.com
```

**Where to set**:
- Development: `.env.local`
- Production: Netlify Environment Variables

---

### FRONTEND_URL

**Purpose**: Frontend URL for CORS configuration (backend only)

**Example**:
```
FRONTEND_URL=https://our-bound-birthday.netlify.app
```

**Where to set**:
- Development: Not needed
- Production: Backend environment variables (Render/Railway)

**Note**: Only needed if using a separate backend (not Netlify Functions).

---

## 🔧 Backend/Server Variables

### PORT

**Purpose**: Port number for the backend server

**Default**: `3000`

**Example**:
```
PORT=3000
```

**Where to set**:
- Development: `.env.local` (if running local backend)
- Production: Backend environment variables (Render/Railway)

**Note**: Not needed for Netlify Functions.

---

### JWT_SECRET

**Purpose**: Secret key for JWT token authentication (if implementing JWT)

**Example**:
```
JWT_SECRET=super-secret-jwt-key-12345
```

**Where to set**:
- Development: `.env.local`
- Production: Backend environment variables

**Note**: Current implementation uses passcode-based auth, not JWT. This is optional for future enhancements.

---

## 📦 Build Configuration Variables

### NODE_ENV

**Purpose**: Environment mode (development or production)

**Values**:
- `development` (default)
- `production`

**Example**:
```
NODE_ENV=production
```

**Where to set**:
- Development: Usually auto-detected
- Production: Netlify automatically sets this

---

## 🧪 Testing Environment Variables

For testing, you can use a `.env.test` file:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ADMIN_PASSCODE=test123
MONGODB_URI=mongodb://localhost:27017/test-our-bound
MONGODB_DB_NAME=test-our-bound
CLOUDINARY_CLOUD_NAME=test-cloud
CLOUDINARY_API_KEY=test-key
CLOUDINARY_API_SECRET=test-secret
ADMIN_PASSCODE=test123
```

---

## 📝 Complete .env.local Example

For local development with all features enabled:

```env
# API Configuration
VITE_API_BASE_URL=/.netlify/functions

# Admin Passcode
VITE_ADMIN_PASSCODE=admin2410

# MongoDB (optional for local dev if using Netlify Functions)
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
# MONGODB_DB_NAME=our-bound

# Cloudinary (optional for local dev if using Netlify Functions)
# CLOUDINARY_CLOUD_NAME=your-cloud-name
# CLOUDINARY_API_KEY=your-api-key
# CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🌍 Netlify Environment Variables Setup

### Step 1: Go to Netlify Dashboard

1. Select your site
2. Go to **Site Configuration** → **Environment variables**

### Step 2: Add Variables

Add each variable with its value:

```
MONGODB_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME = our-bound
CLOUDINARY_CLOUD_NAME = your-cloud-name
CLOUDINARY_API_KEY = your-api-key
CLOUDINARY_API_SECRET = your-api-secret
ADMIN_PASSCODE = your-secure-passcode
VITE_ADMIN_PASSCODE = your-secure-passcode
VITE_API_BASE_URL = /.netlify/functions
```

### Step 3: Save and Redeploy

1. Click **Save**
2. Go to **Deploys**
3. Click **Trigger deploy** → **Deploy site**

---

## 🔍 Verification

### Check if Variables are Set

In the browser console (for frontend variables):
```javascript
console.log(import.meta.env.VITE_API_BASE_URL);
console.log(import.meta.env.VITE_ADMIN_PASSCODE);
```

For backend variables, check Netlify Function logs.

---

## ⚠️ Common Mistakes

1. **Forgot to add `VITE_` prefix**: Frontend variables must start with `VITE_`
2. **Committed `.env` file**: This exposes secrets. Add to `.gitignore`
3. **Using localhost in production**: Update API base URL for production
4. **Missing MongoDB URI**: Database features won't work
5. **Wrong Cloudinary secret**: Uploads will fail
6. **Passcode mismatch**: Admin panel won't authenticate

---

## 🛡️ Security Checklist

- [ ] `.env` file in `.gitignore`
- [ ] No secrets committed to Git
- [ ] Strong admin passcode
- [ ] MongoDB URI not exposed in frontend
- [ ] Cloudinary API secret not exposed in frontend
- [ ] Different secrets for dev/prod
- [ ] Regular secret rotation scheduled
- [ ] IP whitelisting configured for MongoDB (production)

---

## 📞 Need Help?

- [Netlify Environment Variables Docs](https://docs.netlify.com/site-configuration/env-vars/)
- [MongoDB Atlas Connection String Guide](https://docs.atlas.mongodb.com/driver-connection/)
- [Cloudinary Authentication Docs](https://cloudinary.com/documentation/authentication)
