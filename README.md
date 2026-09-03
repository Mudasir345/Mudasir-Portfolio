# Portfolio Website

A modern, feature-rich portfolio website built with Next.js 16, featuring 3D graphics, admin panel, and comprehensive content management capabilities.

## 🚀 Features

- **Modern UI/UX**: Beautiful design with smooth animations and transitions
- **3D Graphics**: Interactive 3D background effects using React Three Fiber
- **Admin Panel**: Full-featured admin dashboard for content management
- **Dynamic Content**: Manage projects, skills, experience, education, testimonials, and more
- **Contact Forms**: Integrated contact form with email delivery (Web3Forms + Nodemailer)
- **Media Management**: Cloudinary integration for image and video storage
- **Responsive Design**: Fully responsive across all devices
- **SEO Optimized**: Built-in SEO optimization and meta tags
- **Database**: Prisma ORM with MySQL for persistent data storage
- **Authentication**: Secure admin panel with session-based authentication

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: MySQL with Prisma ORM
- **3D Graphics**: React Three Fiber, Three.js, @react-three/drei
- **Animations**: Framer Motion
- **Email**: Nodemailer, Web3Forms
- **Media Storage**: Cloudinary
- **Icons**: Lucide React
- **PDF Generation**: @react-pdf/renderer

## 📋 Prerequisites

- Node.js 18+ 
- MySQL database (local or remote)
- Cloudinary account (for media storage)
- Web3Forms account (for contact forms - optional)

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone https://github.com/Mudasir345/Mudasir-Portfolio.git
cd Mudasir-Portfolio
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.local.example .env.local
```

4. **Configure your environment**
Edit `.env.local` with your actual values:
- Database connection string
- Admin credentials
- API keys for Cloudinary, Web3Forms, etc.

5. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed
```

## 🚀 Running the Project

**Development mode:**
```bash
npm run dev
```

**Production build:**
```bash
npm run build
npm start
```

**Analyze bundle size:**
```bash
npm run analyze
```

Open [http://localhost:3000](http://localhost:3000) to view the website.

## 🔧 Environment Configuration

Key environment variables (see `.env.local.example` for full list):

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/database_name

# Admin Panel
ADMIN_PASSWORD=your-strong-password
ADMIN_SESSION_SECRET=your-32-char-secret

# Contact Forms
NEXT_PUBLIC_WEB3FORMS_KEY=your-web3forms-key
CONTACT_EMAIL=your-email@example.com

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# WhatsApp
NEXT_PUBLIC_WHATSAPP=https://wa.me/92300000000000

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 👨‍💻 Admin Panel

Access the admin panel at `/admin` with the password set in your environment variables.

**Admin Features:**
- Manage projects, skills, experience, education
- Add/update testimonials and certificates
- Manage services and team members
- Upload and manage media files
- View and respond to contact form submissions

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── admin/        # Admin panel pages
│   │   ├── api/          # API routes
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── 3d/          # 3D graphics components
│   │   ├── admin/       # Admin-specific components
│   │   ├── layout/      # Layout components
│   │   ├── sections/    # Page sections
│   │   └── ui/          # UI components
│   ├── actions/         # Server actions
│   ├── data/           # Static data
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Utility functions
├── prisma/             # Database schema and migrations
├── public/             # Static assets
└── scripts/            # Utility scripts
```

## 🗄️ Database Schema

The project uses Prisma with MySQL. Key models include:
- User (admin authentication)
- Project (portfolio projects)
- Skill (technical skills)
- Experience (work experience)
- Education (academic background)
- Testimonial (client testimonials)
- Certificate (certifications)
- Service (services offered)
- Team (team members)
- ContactMessage (contact form submissions)

## 🚀 Deployment

### Vercel (Recommended with Aiven MySQL)

**Prerequisites:**
- GitHub repository with your code
- Aiven MySQL database instance
- Cloudinary account (for media storage)
- Web3Forms account (for contact forms)

**Step-by-Step Deployment:**

1. **Prepare Production Environment:**
   ```bash
   # Copy the production example file
   cp .env.production.example .env.production
   # Fill in your actual production values
   ```

2. **Configure Aiven Database:**
   - Use your Aiven MySQL credentials in `DATABASE_URL`
   - Format: `mysql://avnadmin:PASSWORD@HOST:PORT/defaultdb?ssl-mode=REQUIRED`
   - Example: `mysql://avnadmin:AVNS_xxx@mysql-xxx.aivencloud.com:13153/defaultdb?ssl-mode=REQUIRED`

3. **Set Up Vercel Project:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

4. **Configure Environment Variables in Vercel:**
   Add these environment variables in Vercel Project Settings:
   
   ```
   DATABASE_URL=mysql://avnadmin:YOUR_PASSWORD@mysql-1a089c81-mudasirchoudhry345-352d.a.aivencloud.com:13153/defaultdb?ssl-mode=REQUIRED
   ADMIN_PASSWORD=your-strong-admin-password
   ADMIN_SESSION_SECRET=your-32-char-random-secret
   NEXT_PUBLIC_WEB3FORMS_KEY=your-web3forms-key
   CONTACT_EMAIL=mudasirchoudhry345@gmail.com
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-gmail-app-password
   NEXT_PUBLIC_WHATSAPP=https://wa.me/923047045345
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=as4hjbxb
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-api-secret
   CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME
   NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
   ```

5. **Run Database Migrations:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to production database
   npx prisma db push
   ```

6. **Deploy:**
   - Click "Deploy" in Vercel
   - Wait for deployment to complete
   - Access your site at the provided URL

7. **Post-Deployment:**
   - Update `NEXT_PUBLIC_SITE_URL` with your actual Vercel URL
   - Test admin panel at `/admin`
   - Test contact forms
   - Verify database connectivity

**Production Environment Files:**
- `.env.production` - Production environment variables (local testing, not committed)
- `.env.production.example` - Template for production setup
- `vercel.json` - Vercel configuration file

📖 **For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### Other Platforms
The project can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean
- AWS Amplify

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run analyze` - Analyze bundle size

## 🔒 Security Notes

- Never commit `.env` or `.env.local` files
- Use strong passwords for admin panel
- Keep API keys secure
- Regularly update dependencies
- Use HTTPS in production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 👤 Author

**Mudasir Choudhry**
- GitHub: [@Mudasir345](https://github.com/Mudasir345)
- Email: mudasirchoudhry345@gmail.com

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components inspired by modern design trends
- 3D graphics powered by [Three.js](https://threejs.org)
