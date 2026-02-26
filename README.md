# Dynamic Batch-Based Seat Booking System

A comprehensive office seat management system with batch-based scheduling, seat booking, and admin analytics.

## 🏗️ Architecture

```
├── backend/          # Node.js + Express + MongoDB
│   └── src/
│       ├── config/           # Environment configuration
│       ├── core/
│       │   ├── middlewares/   # Auth, Role, Validation, Error
│       │   ├── strategies/    # Booking strategies (Strategy Pattern)
│       │   └── utils/         # Date utilities, error classes
│       ├── database/          # Connection + Seed script
│       └── modules/
│           ├── auth/          # JWT Authentication
│           ├── booking/       # Booking CRUD + Analytics
│           ├── batch/         # Batch schedule + rotation
│           ├── holiday/       # Holiday management
│           ├── seat/          # Seat layout + availability
│           ├── squad/         # Squad details
│           └── user/          # User management
├── frontend/         # React + Vite + TypeScript + TailwindCSS
│   └── src/
│       ├── api/              # Axios client + API functions
│       ├── components/       # Reusable UI components
│       ├── hooks/            # Custom hooks (countdown timer)
│       ├── pages/            # Route pages
│       ├── stores/           # Zustand state management
│       └── types/            # TypeScript interfaces
└── Dockerfile        # Multi-stage production build
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run seed          # Seeds database with test data
npm run dev           # Starts backend on port 5000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev           # Starts frontend on port 5173
```

### Access the App
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api/v1

## 📋 Test Credentials

| Role  | Email                      | Password    |
|-------|----------------------------|-------------|
| Admin | admin@seatbooking.com      | admin123    |
| User  | user.s1m1@seatbooking.com  | password123 |

> User email format: `user.s{squadId}m{memberNum}@seatbooking.com`

## 🏢 Business Rules

### Batch Schedule
- **Batch 1** (Squads 1-5): Monday, Tuesday, Wednesday
- **Batch 2** (Squads 6-10): Thursday, Friday
- **Rotation**: Every alternate week (ISO week % 2 == 0), batches swap days

### Booking Rules
| Seat Type        | When                     | Rules                                    |
|------------------|--------------------------|------------------------------------------|
| Designated       | Your batch day           | Within 14-day window, your squad seat    |
| Buffer           | Non-batch day            | 1 day before, after 3 PM                |
| Temp Buffer      | Non-batch day            | Released seat, same rules as buffer      |

### Constraints
- One booking per employee per date (enforced by compound unique index)
- No bookings on weekends or holidays
- MongoDB transactions for concurrency control

## 🎨 UI Color Guide

| Color   | Meaning         |
|---------|-----------------|
| 🟢 Green | Available       |
| 🔴 Red   | Booked          |
| 🔵 Blue  | My Seat         |
| 🟡 Yellow| Buffer          |
| ⚫ Gray  | Disabled        |
| 🟠 Orange| Temp Buffer     |

## 🔌 API Endpoints

### Auth
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh-token` - Refresh JWT
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/profile` - Get profile

### Bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/my` - My bookings
- `GET /api/v1/bookings/date?date=` - Bookings by date
- `GET /api/v1/bookings/weekly` - Weekly overview
- `PATCH /api/v1/bookings/:id/release` - Release booking
- `PATCH /api/v1/bookings/:id/cancel` - Cancel booking
- `GET /api/v1/bookings/analytics` - Analytics (Admin)

### Seats
- `GET /api/v1/seats` - All seats
- `GET /api/v1/seats/availability?date=` - Seat availability
- `GET /api/v1/seats/buffer` - Buffer seats
- `GET /api/v1/seats/squad/:id` - Squad seats

### Holidays
- `GET /api/v1/holidays` - All holidays
- `POST /api/v1/holidays` - Add holiday (Admin)
- `DELETE /api/v1/holidays/:id` - Remove holiday (Admin)

### Batches & Squads
- `GET /api/v1/batches/schedule` - Week schedule
- `GET /api/v1/batches/info` - Batch configuration
- `GET /api/v1/squads` - All squads
- `GET /api/v1/squads/:id` - Squad details

## 🧪 Testing
```bash
cd backend
npm test
```

## 🐳 Docker
```bash
docker build -t seat-booking .
docker run -p 5000:5000 --env-file backend/.env seat-booking
```

## 📐 Design Patterns
- **Strategy Pattern**: `DesignatedBookingStrategy`, `BufferBookingStrategy`, `TempBufferStrategy`
- **Factory Pattern**: `BookingStrategyFactory`
- **Repository Pattern**: Separate DB logic per module
- **Middleware Pattern**: Auth → Role → Validation → Controller

## 📦 Tech Stack
- **Frontend**: React 18, Vite, TypeScript, TailwindCSS v4, Zustand, Recharts
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Zod
- **Testing**: Jest
