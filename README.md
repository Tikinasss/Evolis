# Evolis - AI Business Rescue Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-16%2B-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-336791)](https://www.postgresql.org/)

> **Evolis** is an AI-powered platform that analyzes companies in financial difficulty, identifies critical problems, and generates actionable recovery strategies with personalized training resources.

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Features](#features)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Technology Stack](#technology-stack)
- [Contributing](#contributing)

## 🎯 Overview

Evolis leverages **Amazon Nova AI** to provide:
- **Instant Financial Diagnostics** - Analyze business health in seconds
- **Professional PDF Reports** - Export formatted analysis with charts and recommendations
- **Personalized Training** - Curated YouTube resources mapped to specific business needs
- **Health Score Tracking** - Monitor progress over time with intuitive dashboards
- **Multi-phase Recovery Plans** - Step-by-step guidance to business recovery

**For detailed project context**, see [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)

## ⚡ Quick Start

### Prerequisites
- Node.js 16+
- PostgreSQL 13+
- Firebase project
- Amazon Nova API key

### 1-Minute Setup

```bash
# Clone and install backend
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run migrate
npm start

# Clone and install frontend (new terminal)
cd frontend
npm install
cp .env.example .env
# Edit .env with API endpoint
npm run dev
```

Access at `http://localhost:5173`

## ✨ Features

### 🎨 Frontend
- **Modern UI** - React 18 with Tailwind CSS and responsive design
- **Firebase Auth** - Secure login and registration
- **Business Analysis Form** - Intuitive data collection interface
- **Interactive Dashboard** - Real-time health score and trend visualization
- **PDF Export** - Professional reports with formatted numbers and metrics
- **Training Hub** - AI-mapped YouTube resources for learning
- **Multi-language Support** - English interface with international number formatting

### 🔌 Backend
- **RESTful API** - Clean, well-documented endpoints
- **User Management** - Firebase-based authentication
- **AI Integration** - Amazon Nova for business analysis
- **PostgreSQL Database** - Persistent storage with migrations
- **Email Notifications** - SendGrid integration for alerts
- **Error Handling** - Comprehensive validation and error responses

### 🧠 AI Capabilities
- **Problem Detection** - Identifies 5-10 critical business issues
- **Risk Assessment** - Rates severity (High/Medium/Low)
- **Recovery Planning** - Multi-phase action plans with timelines
- **Strategic Recommendations** - Prioritized actions with estimated ROI
- **Resource Mapping** - Links to relevant YouTube training

## 📦 Installation

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Run database migrations
npm run migrate

# Optional: Populate with seed data
npm run seed

# Start development server
npm run dev
# Server runs on http://localhost:3001
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with API endpoint
nano .env

# Start development server
npm run dev
# App opens at http://localhost:5173
```

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/evolis_db

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Amazon Nova API
NOVA_API_KEY=your_nova_api_key
NOVA_MODEL_ID=amazon.nova-lite-v1:0

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
SUPPORT_EMAIL=support@evolis.ai

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
# API Configuration
VITE_API_URL=http://localhost:3001

# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 🚀 Running the Application

### Local Development

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

### Available Scripts

**Backend:**
- `npm start` - Production server
- `npm run dev` - Development with auto-reload (nodemon)
- `npm run migrate` - Run database migrations
- `npm run seed` - Populate with sample data

**Frontend:**
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - ESLint validation

## 💾 Database Setup

### Creating Database

```bash
# Using PostgreSQL CLI
createdb evolis_db

# Or using your preferred database manager
```

### Running Migrations

```bash
cd backend
npm run migrate
```

### Migration Files

Located in `backend/migrations/`:
- `001_init.sql` - Initial schema (users, analyses, notes)
- `002_add_firebase_uid.sql` - Firebase authentication fields

### Seeding Data (Optional)

```bash
npm run seed
# Populates with sample analyses and recommendations
```

## 📡 API Documentation

### Base URL
- **Local**: `http://localhost:3001/api`
- **Production**: `https://your-backend.vercel.app/api`

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}

Response: 200
{
  "user": { "id": "...", "email": "...", "name": "..." },
  "token": "firebase_id_token"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@company.com",
  "password": "SecurePassword123"
}

Response: 200
{
  "user": { ... },
  "token": "firebase_id_token"
}
```

### Analysis Endpoints

#### Create Analysis
```http
POST /api/analysis/create
Authorization: Bearer firebase_token
Content-Type: application/json

{
  "company_name": "Acme Corp",
  "industry": "Technology",
  "revenue": 5000000,
  "expenses": 4200000,
  "debt": 1500000,
  "cash_flow": "declining",
  "main_challenges": "Declining customer retention and rising operational costs"
}

Response: 200
{
  "id": "analysis_123",
  "risk_level": "High",
  "main_problems": [ ... ],
  "recovery_plan": [ ... ],
  "recommendations": [ ... ],
  "training_resources": [ ... ]
}
```

#### Get Analysis
```http
GET /api/analysis/{id}
Authorization: Bearer firebase_token

Response: 200
{
  "id": "...",
  "company_name": "...",
  "created_at": "...",
  "risk_level": "...",
  "main_problems": [ ... ],
  ...
}
```

#### Get User's Analyses
```http
GET /api/analysis/user/{userId}
Authorization: Bearer firebase_token

Response: 200
[
  { analysis 1 },
  { analysis 2 },
  ...
]
```

### Support Endpoints

#### Add Notes to Analysis
```http
POST /api/support/notes
Authorization: Bearer firebase_token
Content-Type: application/json

{
  "analysis_id": "analysis_123",
  "content": "Client is implementing recommendation #2 this week"
}

Response: 201
{ "id": "note_123", "content": "...", "created_at": "..." }
```

#### Contact Support
```http
POST /api/support/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Feature Request",
  "message": "Would like to add team collaboration..."
}

Response: 200
{ "message": "Your message has been sent" }
```

## 📄 PDF Export Features

The PDF export generates professional diagnostic reports including:

- **Executive Summary** - Company info, health score, date
- **Risk Badge** - Color-coded severity (High/Medium/Low)
- **Financial Metrics** - 2-column table with key numbers
- **Problems Section** - Issues with severity and impact
- **Recovery Plan** - Phases with focus areas and actions
- **Recommendations** - Priority actions with ROI estimates
- **Notes Section** - User-added observations
- **Smart Formatting** - Large numbers displayed as "8.6 milliards USD"

### Export From Dashboard
```javascript
// Triggers PDF generation with all analysis data
onClick={() => handleExportPdf()}
```

## 🌐 Deployment

### Vercel Deployment

#### Backend Deployment

```bash
cd backend
vercel deploy
```

Set environment variables in Vercel Console:
- `DATABASE_URL`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_CLIENT_EMAIL`
- `NOVA_API_KEY`
- `SENDGRID_API_KEY`
- `FRONTEND_URL`

#### Frontend Deployment

```bash
cd frontend
vercel deploy
```

Set environment variable:
- `VITE_API_URL=https://your-backend.vercel.app`

#### GitHub Integration

Both can be connected to GitHub for automatic deployment on push:
1. Import repository in Vercel
2. Auto-detects `frontend/` and `backend/` root directories
3. Sets up CI/CD pipelines

## 📁 Project Structure

```
Evolis/
├── frontend/                          # React + Vite application
│   ├── src/
│   │   ├── components/               # Reusable React components
│   │   │   ├── ExportPanel.jsx       # PDF export with jsPDF
│   │   │   ├── BusinessForm.jsx      # Analysis form
│   │   │   ├── HealthScoreTrend.jsx  # Trend visualization
│   │   │   └── ...
│   │   ├── pages/                    # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   └── ...
│   │   ├── context/                  # React Context
│   │   │   └── AuthContext.jsx       # Auth state management
│   │   ├── api/
│   │   │   └── client.js             # Axios API client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                 # Tailwind styles
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── vercel.json
│
├── backend/                           # Node.js/Express server
│   ├── routes/                        # API routes
│   │   ├── authRoutes.js             # /api/auth/*
│   │   ├── analysisRoutes.js         # /api/analysis/*
│   │   └── supportRoutes.js          # /api/support/*
│   ├── services/                      # Business logic
│   │   ├── firebaseAdmin.js          # Firebase setup
│   │   ├── novaService.js            # Nova AI integration
│   │   └── notificationService.js    # Email notifications
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT verification
│   ├── data/
│   │   ├── db.js                     # Database connection
│   │   └── postgres.js               # PostgreSQL utilities
│   ├── migrations/                    # Database schema
│   │   ├── 001_init.sql
│   │   └── 002_add_firebase_uid.sql
│   ├── scripts/
│   │   ├── migrate.js                # Migration runner
│   │   └── seed.js                   # Data seeding
│   ├── server.js                     # Express app
│   ├── package.json
│   └── vercel.json
│
├── api/                               # Serverless endpoints
│   └── index.js
│
├── PROJECT_OVERVIEW.md                # Project documentation
├── README.md                          # This file
├── LICENSE
└── vercel.json                        # Vercel config
```

## 🛠️ Technology Stack

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | Latest | Build tool |
| Tailwind CSS | 3+ | Styling |
| jsPDF | 2.5.2 | PDF generation |
| Axios | Latest | HTTP client |
| Firebase | Latest | Authentication |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Express | 4+ | Web framework |
| PostgreSQL | 13+ | Database |
| Firebase Admin | Latest | Auth/Firestore |
| Axios | Latest | HTTP client |
| SendGrid | Latest | Email service |

### Infrastructure
| Service | Purpose |
|---------|---------|
| Vercel | Hosting (Frontend + API) |
| PostgreSQL | Database |
| Firebase | Authentication |
| Amazon Nova | AI analysis engine |
| SendGrid | Email notifications |

## 🤝 Contributing

1. **Fork** the repository
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. Submit a **Pull Request**

### Code Style
- Use ESLint configuration provided
- Follow existing code patterns
- Add tests for new features
- Update documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🆘 Support

- **Documentation**: [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)
- **Issues**: GitHub Issues
- **Email**: support@evolis.ai

## 🎯 Roadmap

- [x] Core analysis engine
- [x] PDF export functionality
- [x] Training resource mapping
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Team collaboration features
- [ ] Third-party integrations (Xero, Sage)
- [ ] Multi-language support
- [ ] Real-time collaboration
- [ ] Custom report templates

## 📊 Project Stats

- **Frontend**: ~2,500 lines of React code
- **Backend**: ~1,500 lines of Node.js code
- **Database**: 2 SQL migration files
- **Components**: 15+ reusable React components
- **API Endpoints**: 8+ RESTful endpoints

---

**Built with ❤️ by the Evolis team**

*Empowering businesses to turnaround with AI-powered insights and actionable strategies.*

  "recommendations": []
}
```

## 7. Hackathon Notes

- Data is currently stored in-memory for simplicity.
- Use a persistent database (DynamoDB, PostgreSQL, etc.) for production.
- PDF parsing is best-effort and optional.
