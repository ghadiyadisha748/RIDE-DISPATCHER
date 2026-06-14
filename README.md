# RIDE-DISPATCHER

> **AI-powered ride booking and dispatch platform** — Final Year Major Project

Built by **Disha Ghadiya**, **Anshika Badala**, and **Shruti Babariya**  
Primary demo city: **Surat, Gujarat** 🇮🇳

---

## 🚀 Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React.js + Vite + Tailwind CSS            |
| Backend     | Node.js + Express.js + Socket.IO          |
| Database    | PostgreSQL 16                             |
| AI Service  | Python + FastAPI + scikit-learn + XGBoost |
| Maps        | OpenStreetMap + Leaflet + OSRM            |
| Auth        | JWT (access + refresh tokens) + bcrypt    |
| Deployment  | Vercel (frontend) + Render (backend)      |

---

## 📁 Project Structure

```
RIDE-DISPATCHER/
├── frontend/        ← React.js app (Vite + Tailwind)
├── backend/         ← Node.js REST API + Socket.IO server
├── ai-service/      ← Python FastAPI AI microservice
├── database/        ← PostgreSQL schema + migrations + seed data
├── nginx/           ← Reverse proxy configuration
├── docs/            ← API docs, setup guide, project report
└── docker-compose.yml
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 16
- Git

### 1. Clone & setup environment

```bash
git clone <repo-url>
cd RIDE-DISPATCHER
cp .env.example .env   # Edit with your values
```

### 2. Database setup

```bash
# Create database
psql -U postgres -c "CREATE DATABASE ride_dispatcher;"
psql -U postgres -d ride_dispatcher -f database/schema.sql
psql -U postgres -d ride_dispatcher -f database/seed.sql
```

### 3. Backend

```bash
cd backend
cp .env.example .env   # Fill in DATABASE_URL, JWT_SECRET, etc.
npm install
npm run dev            # Starts on http://localhost:5000
```

### 4. AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# Models auto-train on first startup (~30-60 sec)
# Swagger UI: http://localhost:8000/docs
```

### 5. Frontend

```bash
cd frontend
cp .env.example .env   # Set VITE_API_URL=http://localhost:5000
npm install
npm run dev            # Starts on http://localhost:5173
```

### 6. (Optional) Full Docker stack

```bash
docker-compose up --build
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000
# AI:       http://localhost:8000
# Nginx:    http://localhost:80
```

---

## 🔑 Default Test Credentials

| Role   | Email                       | Password       |
|--------|-----------------------------|----------------|
| Admin  | disha@ridedispatcher.in     | Password@123   |
| Admin  | anshika@ridedispatcher.in   | Password@123   |
| Rider  | arjun.mehta@gmail.com       | Password@123   |
| Driver | ramesh.tadvi@gmail.com      | Password@123   |

---

## 🤖 AI Models

| Model                 | Algorithm              | Accuracy   |
|-----------------------|------------------------|------------|
| Fare Predictor        | Random Forest          | R² > 0.92  |
| Smart Dispatch        | KD-Tree + Weighted Score | Real-time |
| Demand Forecaster     | XGBoost                | ~88%       |
| Sentiment Analyzer    | TF-IDF + LogReg        | ~91%       |
| Fraud Detector        | Isolation Forest       | ~94%       |
| Driver Performance    | Composite Score        | A–F Grade  |

---

## 🌐 Cities Supported

- 🟢 **Surat** (Primary demo city)
- 🔵 Ahmedabad
- 🟡 Vadodara
- 🟠 Rajkot

---

## 📡 Key API Routes

```
POST /api/auth/register          Register user/driver
POST /api/auth/login             Login, get JWT
GET  /api/users/me               User profile
POST /api/rides/estimate         AI fare estimate
POST /api/rides/book             Book a ride
GET  /api/rides/:id              Ride details
POST /api/ai/fare-predict        Fare prediction
GET  /api/admin/stats            Dashboard analytics
```

Full API documentation: [docs/API_DOCS.md](docs/API_DOCS.md)

---

## 🔐 Security

- JWT access tokens (7d) + refresh tokens (30d)
- bcrypt password hashing (cost factor 12)
- Role-based access control (user / driver / admin)
- Parameterized SQL queries (no SQL injection)
- Rate limiting on auth routes (5 req/15 min)
- Helmet.js security headers

---

## 📄 Documentation

- [Setup Instructions](docs/SETUP.md)
- [API Reference](docs/API_DOCS.md)
- [AI Module Details](docs/AI_MODULE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Project Report](docs/PROJECT_REPORT.md)

---

## 👥 Team

| Member | Role |
|--------|------|
| Disha Ghadiya | AI/ML Development, Backend Development, Model Integration |
| Anshika Badala | Frontend Development, UI/UX Design, React Development |
| Shruti Babariya | Database Management, Testing, Quality Assurance, Documentation |

---

*Built as a Final Year Major Project · AI/ML Portfolio · Startup Demonstration*
