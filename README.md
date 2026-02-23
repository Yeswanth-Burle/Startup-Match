# StartupMatch – AI Co-Founder Finder 🚀

A production-ready MERN SaaS application to connect startup founders using AI-driven matching algorithms, real-time chat, and a project marketplace.

## Architecture & Tech Stack

This project is structured as a **modular Monorepo** containing both `backend` and `frontend`. 

### Backend Architecture
- **Node.js + Express.js**: Handles HTTP requests.
- **MongoDB + Mongoose**: Data persistence and schema validations.
- **Strict Modular Design**: Each feature is enclosed in its own module inside `backend/src/modules/` (e.g., `auth`, `profiles`, `matches`, `projects`), containing:
  - `model.js`: Mongoose schema.
  - `service.js`: Core business logic (keeps controllers thin).
  - `controller.js`: Request/Response handling.
  - `routes.js`: Express routing.
- **Matching Engine**: Weighted scoring mechanism based on:
  - Skill complementarity (40%)
  - Industry alignment (20%)
  - Availability similarity (15%)
  - Experience balance (15%)
  - Personality overlap (10%)
- **Socket.io**: Real-time bidirectional event-based communication for the chat system.
- **Standardized Responses**: Controlled via `src/utils/responseHandler.js`.
- **Security**: Helmet, CORS, Express Rate Limiter, Morgan logging.

### Frontend Architecture
- **React + Vite**: Blazing fast frontend.
- **TailwindCSS**: Utility-first styling with responsive, modern UI components.
- **Context API**: Handles global authentication state (`AuthContext`) and real-time Socket connections (`SocketContext`).
- **Axios Interceptors**: Automatically attaches JWT tokens to outgoing requests.
- **React Router**: Protected routes logic using a custom `<ProtectedRoute>` component.
- **Recharts**: Beautiful, accessible charts for the Admin Analytics Dashboard.
- **Lucide Icons**: Crisp, SVG-based icons.

## Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (running locally or a MongoDB Atlas connection string)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Establish Environment Variables:
   - Make sure your MongoDB instance is running locally at `mongodb://localhost:27017/startupmatch` OR update the `MONGO_URI` in `backend/.env`.
4. Run the Seed Script (To create the Admin user and default skills):
   ```bash
   npm run seed
   ```
   *Admin Credentials: `admin@startupmatch.com` / `adminpassword123`*
5. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```

## Features Complete ✅
- **Role-based Authentication** (FOUNDER, ADMIN).
- **Match Generation Engine** with 0-100 Circular Compatibility Score algorithm.
- **Real-time Messaging** (Socket.io) with accepted matches.
- **Project Marketplace** (Post projects, Apply, Accept/Reject logic).
- **In-App Notifications**.
- **Admin Dashboard** utilizing Aggregation pipelines and Recharts visual data.
