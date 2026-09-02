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

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

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
