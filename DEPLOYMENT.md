# 🚀 Deployment Guide

This guide provides detailed instructions for deploying the Portfolio website to Vercel with Aiven MySQL database.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Database Setup (Aiven)](#database-setup-aiven)
- [Environment Configuration](#environment-configuration)
- [Vercel Deployment](#vercel-deployment)
- [Post-Deployment Steps](#post-deployment-steps)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with repository access
- ✅ Vercel account (free tier works)
- ✅ Aiven account with MySQL instance
- ✅ Cloudinary account (for media storage)
- ✅ Web3Forms account (for contact forms)
- ✅ Node.js 18+ installed locally

## 🗄️ Database Setup (Aiven)

### 1. Create Aiven MySQL Instance

1. Log in to [Aiven Console](https://console.aiven.io/)
2. Create a new service:
   - Service type: MySQL
   - Cloud provider: AWS/GCP/Azure (your choice)
   - Region: Choose closest to your users
   - Plan: Free tier or startup plan

### 2. Get Database Credentials

Once your service is running, note these details:

```
Service URI: mysql://avnadmin:YOUR_PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED
Host: mysql-your-instance.aivencloud.com
Port: 13153 (MySQL) - Use this, NOT MySQLX port 13157
User: avnadmin
Password: YOUR_AIVEN_PASSWORD
Database: defaultdb
SSL Mode: REQUIRED

IMPORTANT: Use the MySQL connection string (port 13153), NOT MySQLX (port 13157)
MySQLX is for different protocol - Prisma and standard MySQL clients need the MySQL connection
```

### 3. Test Database Connection

```bash
# Install MySQL client if needed
# Windows: Download MySQL Shell
# Mac: brew install mysql-client
# Linux: sudo apt-get install mysql-client

# Test connection
mysql -h mysql-your-instance.aivencloud.com -P 13153 -u avnadmin -p
```

## ⚙️ Environment Configuration

### 1. Local Production Testing

Create a local production environment file:

```bash
cp .env.production.example .env.production
```

Edit `.env.production` with your actual values:

```env
# Database (Aiven MySQL)
DATABASE_URL=mysql://avnadmin:YOUR_AIVEN_PASSWORD@mysql-your-instance.aivencloud.com:13153/defaultdb?ssl-mode=REQUIRED

# Admin Authentication (USE STRONG VALUES!)
ADMIN_PASSWORD=your-very-strong-admin-password-123!
ADMIN_SESSION_SECRET=generate-32-char-random-secret-here

# Contact Forms
NEXT_PUBLIC_WEB3FORMS_KEY=your-web3forms-access-key
CONTACT_EMAIL=your-email@example.com

# Email Backup
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-gmail-app-password

# WhatsApp
NEXT_PUBLIC_WHATSAPP=https://wa.me/92300000000000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME

# Site URL (update after deployment)
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### 2. Generate Strong Secrets

```bash
# Generate 32-character random secret for sessions
# OpenSSL (Windows/Mac/Linux)
openssl rand -hex 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🌐 Vercel Deployment

### Step 1: Connect GitHub to Vercel

1. Log in to [Vercel](https://vercel.com)
2. Go to Settings → Git Integrations
3. Connect your GitHub account
4. Grant access to your repository

### Step 2: Import Project

1. Click "Add New Project"
2. Select your GitHub repository: `Mudasir345/Mudasir-Portfolio`
3. Vercel will auto-detect Next.js settings

### Step 3: Configure Build Settings

Vercel will auto-configure these settings:

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### Step 4: Add Environment Variables

**IMPORTANT:** Add these environment variables in Vercel Project Settings → Environment Variables, NOT in vercel.json. The vercel.json file has been fixed to remove the env section that was causing the "DATABASE_URL should be string" error.

In Vercel Project Settings → Environment Variables, add:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `mysql://avnadmin:YOUR_AIVEN_PASSWORD@mysql-1a089c81-mudasirchoudhry345-352d.a.aivencloud.com:13153/defaultdb?ssl-mode=REQUIRED` | Aiven MySQL connection (use port 13153, NOT 13157) |
| `ADMIN_PASSWORD` | `your-strong-password` | Admin panel password |
| `ADMIN_SESSION_SECRET` | `32-char-random-secret` | Session encryption key |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | `your-web3forms-key` | Contact form API |
| `CONTACT_EMAIL` | `your-email@example.com` | Contact form recipient |
| `EMAIL_USER` | `your-gmail@gmail.com` | Backup email sender |
| `EMAIL_PASS` | `your-gmail-app-password` | Gmail app password |
| `NEXT_PUBLIC_WHATSAPP` | `https://wa.me/92300000000000` | WhatsApp link |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | `your-api-key` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | Cloudinary secret |
| `CLOUDINARY_URL` | `cloudinary://API_KEY:SECRET@CLOUD_NAME` | Cloudinary URL |
| `NEXT_PUBLIC_SITE_URL` | `https://your-app.vercel.app` | Production URL |

**Important:** Select appropriate environments for each variable:
- Production (required)
- Preview (optional, for pull requests)
- Development (optional)

### Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Vercel will provide a URL like: `https://mudasir-portfolio-xyz.vercel.app`

## 🔧 Post-Deployment Steps

### 1. Update Site URL

After deployment, update the `NEXT_PUBLIC_SITE_URL` in Vercel:

1. Go to Project Settings → Environment Variables
2. Edit `NEXT_PUBLIC_SITE_URL`
3. Set it to your actual Vercel URL
4. Redeploy the application

### 2. Run Database Migrations

The Prisma schema needs to be applied to your production database:

```bash
# Set your production DATABASE_URL
set DATABASE_URL=mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED

# Generate Prisma client
npx prisma generate

# Push schema to production database
npx prisma db push

# Or use migrations (recommended for production)
npx prisma migrate deploy
```

### 3. Seed Database (Optional)

If you have seed data:

```bash
npx prisma db seed
```

### 4. Test the Application

- **Homepage:** Visit your Vercel URL
- **Admin Panel:** Go to `/admin` and test login
- **Contact Form:** Submit a test message
- **Database:** Check Aiven console for new records
- **Media Upload:** Test image uploads via admin panel

### 5. Configure Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_SITE_URL` with custom domain

## 🐛 Troubleshooting

### Database Connection Issues

**Problem:** "Connection refused" or SSL errors

**Solution:**
```env
# Ensure SSL mode is properly set
DATABASE_URL=mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED
```

**MySQL vs MySQLX Port Issue:**
- **Use MySQL connection (port 13153)** - This is for standard MySQL protocol
- **NOT MySQLX connection (port 13157)** - This is for MySQL X Protocol
- Prisma and standard MySQL clients require the MySQL connection
- Aiven provides both, but you must use the MySQL one for this project

### Build Failures

**Problem:** Build fails in Vercel but works locally

**Solution:**
- Check Node.js version in Vercel (should be 18+)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Environment Variables Not Working

**Problem:** Features not working due to missing env vars

**Solution:**
- Ensure variables are set in Production environment
- Redeploy after adding variables
- Check variable names match exactly (case-sensitive)

### DATABASE_URL Validation Error

**Problem:** "Invalid request: `env.DATABASE_URL` should be string"

**Solution:**
- **This error occurs when environment variables are defined in vercel.json**
- **Remove the "env" section from vercel.json** (we've already fixed this)
- **Add environment variables directly in Vercel Project Settings:**
  1. Go to your Vercel project
  2. Navigate to Settings → Environment Variables
  3. Add each variable manually (DATABASE_URL, ADMIN_PASSWORD, etc.)
  4. Select "Production" environment
  5. Click "Save"
  6. Redeploy your application

**Important:** Never define sensitive environment variables in vercel.json - always use Vercel's Environment Variables settings.

### Prisma Issues

**Problem:** Database schema not applied

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Check database connection
npx prisma db pull
```

### Admin Panel Not Accessible

**Problem:** Cannot login to admin panel

**Solution:**
- Verify `ADMIN_PASSWORD` is set correctly
- Check `ADMIN_SESSION_SECRET` is 32+ characters
- Clear browser cookies and try again

## 🔒 Security Best Practices

1. **Never commit** `.env.production` with real credentials
2. **Use strong passwords** for admin panel
3. **Rotate secrets** periodically
4. **Enable HTTPS** (Vercel does this automatically)
5. **Monitor database** access logs in Aiven
6. **Limit API keys** to specific domains
7. **Regular updates** of dependencies

## 📊 Monitoring

### Vercel Analytics
- Enable in Project Settings → Analytics
- Monitor page views and performance

### Aiven Monitoring
- Database connection metrics
- Query performance
- Storage usage

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for session recording

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Update production"
git push origin main
```

Vercel will automatically build and deploy changes.

## 📞 Support

If you encounter issues:
- Check [Vercel Docs](https://vercel.com/docs)
- Check [Aiven Docs](https://docs.aiven.io)
- Check project GitHub issues
- Contact: mudasirchoudhry345@gmail.com