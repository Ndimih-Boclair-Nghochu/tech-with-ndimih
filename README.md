# TECH WITH NDIMIH - Personal Portfolio Website

A modern, full-stack personal portfolio website built with React and Django. Features a beautiful UI, admin dashboard, blog, portfolio showcase, donation system, and more.

![Tech Stack](https://img.shields.io/badge/React-18.2-blue) ![Django](https://img.shields.io/badge/Django-4.2-green) ![Vite](https://img.shields.io/badge/Vite-5.0-purple) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-blue)

## 🌟 Features

### Frontend (React + Vite + Tailwind CSS)
- **Modern UI/UX**: Glass morphism design with smooth animations
- **Responsive Design**: Fully responsive across all devices
- **3D Hero Section**: Interactive hero with customizable content
- **Portfolio Showcase**: Display projects with images, live links, and GitHub repos
- **Blog System**: Full-featured blog with product integration
- **Services & Skills**: Dynamic services and skills display
- **Reviews System**: Client testimonials with rotation carousel
- **Contact Form**: Working contact form with file uploads
- **Resources Page**: Secure PDF viewer for CV and certifications
- **About Page**: Personal information with social links
- **Donation System**: Multiple payment options (Mobile Money, Bank, Gift Cards)
- **Admin Dashboard**: Full CRUD interface for managing all content

### Backend (Django + DRF)
- **RESTful API**: Complete REST API with Django REST Framework
- **JWT Authentication**: Secure token-based authentication
- **File Uploads**: Support for images, PDFs, and other media
- **Admin Panel**: Django admin for content management
- **Database Models**: Portfolio, Blog, Products, Services, Skills, Reviews, Donations, etc.
- **Email Integration**: Contact form email notifications
- **S3 Storage Support**: Optional cloud storage for media files

## 🚀 Tech Stack

### Frontend
- **React 18.2** - UI library
- **Vite 5.0** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Three.js** - 3D graphics (for hero section)

### Backend
- **Django 4.2.8** - Web framework
- **Django REST Framework 3.14** - API framework
- **djangorestframework-simplejwt** - JWT authentication
- **django-cors-headers** - CORS handling
- **django-ratelimit** - Rate limiting
- **Gunicorn** - WSGI HTTP server

## 📁 Project Structure

```
.
├── backend/              # Django project
│   ├── app/             # Main Django app
│   │   ├── settings.py  # Django settings
│   │   ├── urls.py      # URL routing
│   │   └── patches.py   # Python 3.14 compatibility
│   ├── content/         # Content app (models, views, serializers)
│   ├── manage.py
│   └── requirements.txt
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/       # Page components
│   │   ├── styles/      # CSS files
│   │   ├── lib/         # Utilities (API client)
│   │   └── context/     # React context (Auth)
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── README.md
└── DEPLOYMENT_CHECKLIST.md
```

## 🛠️ Setup & Installation

### Prerequisites
- Python 3.10+ (tested with Python 3.14)
- Node.js 18+ and npm
- Git

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   # Create .env file in project root
   cp .env.example .env
   # Edit .env with your settings
   ```

5. **Run migrations**
   ```bash
   python manage.py migrate
   ```

6. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

7. **Run development server**
   ```bash
   python manage.py runserver
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file in frontend directory
   VITE_API_URL=http://localhost:8000/api
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## 🔐 Environment Variables

### Backend (.env in project root)
```env
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Frontend (.env in frontend directory)
```env
VITE_API_URL=http://localhost:8000/api
```

## 📖 Usage

### Admin Dashboard
1. Navigate to `/admin` or `/admin-dashboard`
2. Login with your superuser credentials
3. Manage:
   - Portfolio items
   - Blog posts
   - Products
   - Services & Skills
   - CV & Certifications
   - About page content
   - Hero section
   - Donation information

### API Endpoints
- `/api/portfolio/` - Portfolio items
- `/api/blog/` - Blog posts
- `/api/products/` - Products
- `/api/services/` - Services
- `/api/skills/` - Skills
- `/api/reviews/` - Reviews
- `/api/donation-info/` - Donation information
- `/api/gift-cards/` - Gift cards
- `/api/auth/token/` - JWT token authentication

## 🚢 Deployment

See [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for detailed deployment instructions.

### Quick Deployment Steps

1. **Set production environment variables**
   - `DJANGO_DEBUG=False`
   - `DJANGO_SECRET_KEY` (generate a strong key)
   - `ALLOWED_HOSTS` (your domain)
   - `DATABASE_URL` (PostgreSQL recommended)

2. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

3. **Collect static files**
   ```bash
   cd backend
   python manage.py collectstatic --noinput
   ```

4. **Run migrations**
   ```bash
   python manage.py migrate
   ```

5. **Start with Gunicorn**
   ```bash
   gunicorn app.wsgi:application --bind 0.0.0.0:8000
   ```

## 🎨 Features Overview

- ✅ Portfolio showcase with live project links
- ✅ Blog system with product integration
- ✅ Services and skills display
- ✅ Client reviews with carousel
- ✅ Contact form with file uploads
- ✅ Resources page (CV & Certifications)
- ✅ About page with social links
- ✅ Donation system (Mobile Money, Bank, Gift Cards)
- ✅ Full admin dashboard
- ✅ JWT authentication
- ✅ Responsive design
- ✅ SEO-friendly
- ✅ Error handling & boundaries

## 🤝 Contributing

This is a personal portfolio project. Feel free to fork and use it as a template for your own portfolio!

## 📝 License

See [LICENSE](./LICENSE) file for details.

## 👤 Author

**Ndimih Boclair Nghochu**
- GitHub: [@Ndimih-Boclair-Nghochu](https://github.com/Ndimih-Boclair-Nghochu)
- Website: [Tech with Ndimih](https://techwithndimih.com)

## 🙏 Acknowledgments

- Built with React, Django, and modern web technologies
- UI inspired by modern glass morphism design trends
- Powered by TECH WITH NDIMIH

---

**Made with ❤️ by Ndimih Boclair Nghochu**
