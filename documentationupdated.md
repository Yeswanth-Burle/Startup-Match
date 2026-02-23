# StartupMatch: End-to-End Technical Documentation

Welcome to the complete technical breakdown of StartupMatch. This document is designed to give you a masterful understanding of exactly what we built, how the different pieces fit together, and the logic powering the platform.

---

## 1. Project Purpose & Dual Architecture
**StartupMatch** is a platform built to connect startup founders, developers, marketers, and visionaries. 

It operates on **two distinct networking paradigms**, catering to different ways people form startups:
1. **The Matches System (Tinder for Co-founders):** An algorithmic matching engine that connects you with a single compatible co-founder based on your complementary skills, industry alignment, availability, and experience levels.
2. **The Projects System (Job Board for Startups):** A project marketplace where entrepreneurs can publicly post startup ideas and recruit talented individuals who manually write cover letters and apply to join their team.

---

## 2. Technology Stack & Libraries

### Frontend (React & Vite)
The frontend is the client-side user interface that runs in the browser.
*   **React (`react`, `react-dom`):** The core framework for building reusable UI components (like the Navbar, Forms, and Chat bubbles).
*   **Vite:** The build tool and development server. It is significantly faster than standard Create-React-App.
*   **React Router (`react-router-dom`):** Handles navigation between pages (e.g., `/chat`, `/projects`) without refreshing the browser.
*   **Tailwind CSS (`tailwindcss`):** A utility-first CSS framework that allows us to style the site rapidly directly inside the HTML `className` attributes.
*   **Framer Motion (`framer-motion`):** The animation library responsible for the smooth page transitions, modal pop-ups, and button hover effects.
*   **Lucide React (`lucide-react`):** Our SVG icon library (used for the User, Rocket, Bell icons, etc.).
*   **Axios (`axios`):** A promise-based HTTP client used to seamlessly send `GET/POST/PUT` requests to our backend API.
*   **Socket.io Client (`socket.io-client`):** Connects the browser to our backend WebSocket server for real-time live chat functionality.

### Backend (Node.js & Express)
The backend is the server-side engine that processes logic, talks to the database, and enforces security.
*   **Express (`express`):** The core web framework used to define our API routes (e.g., `app.get('/api/v1/...')`) and handle HTTP requests/responses.
*   **MongoDB & Mongoose (`mongoose`):** MongoDB is our NoSQL database. Mongoose is the Object Data Modeling (ODM) library that allows us to define strict schemas (e.g., making sure a User has a valid Email and Password).
*   **JSON Web Tokens (`jsonwebtoken`):** Used for stateless authentication. When a user logs in, we digitally sign a unique token to verify their identity on future requests.
*   **Bcrypt (`bcryptjs`):** A cryptography library. We use this to irreversibly scramble (hash) user passwords before saving them to the database, ensuring that even if the database is hacked, the passwords remain secure.
*   **Socket.io (`socket.io`):** The server-side WebSocket library that manages live connections and pushes chat messages instantly to active users.
*   **Cors (`cors`):** Middleware that allows our frontend (running on port 5173) to securely talk to our backend (running on port 5000).
*   **Dotenv (`dotenv`):** Loads our secret configuration variables (like the MongoDB URI and JWT Secret) from the [.env](file:///d:/groupProject-startupmatch/backend/.env) file so they aren't hardcoded in the codebase.
*   **Express Rate Limit (`express-rate-limit`):** Security middleware that restricts how many times a user can hit an endpoint in a given timeframe (prevents brute-force attackers from crashing the server).

---

## 3. Core Developer Concepts You Need To Know

*   **RESTful APIs:** Our backend is a REST API. It uses standard HTTP methods:
    *   `POST` to create data (e.g., Registering a User).
    *   `GET` to read data (e.g., Fetching the Chat History).
    *   `PUT`/`PATCH` to update data (e.g., Marking a message as read).
    *   `DELETE` to remove data.
*   **Middlewares:** Functions that intercept a request *before* it reaches its final destination. 
    *   For example, when the frontend asks to view your private Chat (`GET /messages`), the request first hits our **Auth Middleware ([protect](file:///d:/groupProject-startupmatch/backend/src/middleware/auth.middleware.js#5-37))**. The middleware checks if your JWT token is valid. If it is, the middleware says `next()` and passes the request to the controller. If it's fake, the middleware instantly rejects it with a `401 Unauthorized` error.
*   **Database Seeding ([seed.js](file:///d:/groupProject-startupmatch/backend/seed.js)):** A script we run once to inject dummy data into a fresh database. We used this to automatically spawn 10 fake Users and 50 standard Skills (like "JavaScript", "Marketing", "Figma") so the matching algorithm had people to test against.
*   **Zombie Processes:** In backend development, if your Node server crashes improperly, it might leave a "Zombie Process" running invisibly in your computer's background holding Port 5000 hostage. If you try to run `npm run dev` again, it fails because the port is "in use". You must kill the zombie process in your terminal to restart it.
*   **React Context API (`AuthContext`, `SocketContext`):** Normally in React, to share data (like the logged-in User's ID) between the Navbar and the Footer, you have to pass it manually through every component in between (Prop Drilling). The Context API creates a global "bubble" around your app. Any component can instantly tap into the bubble via [useAuth()](file:///d:/groupProject-startupmatch/frontend/src/context/AuthContext.jsx#55-56) to get the user's data instantly.

---

## 4. WebSockets & Real-Time Chat (How It Works)

**Files Responsible:**
*   Backend: [src/config/socket.js](file:///d:/groupProject-startupmatch/backend/src/config/socket.js)
*   Frontend: [src/context/SocketContext.jsx](file:///d:/groupProject-startupmatch/frontend/src/context/SocketContext.jsx) & [src/pages/Chat/Chat.jsx](file:///d:/groupProject-startupmatch/frontend/src/pages/Chat/Chat.jsx)

**The Flow:**
Unlike standard HTTP where the browser has to manually "pull" data from the server, WebSockets create a persistent, open two-way tunnel between the browser and the backend.
1. When you log in, [SocketContext.jsx](file:///d:/groupProject-startupmatch/frontend/src/context/SocketContext.jsx) uses your JWT token to permanently connect to the Node server.
2. When you open the Chat page with a specific Match, your browser yells `joinRoom({ matchId })`. The Node server explicitly groups your socket ID into a private, isolated digital room for just you and your co-founder.
3. When you type a message and press Send:
    *   React fires a standard `POST /messages` HTTP request to securely save the text to MongoDB.
    *   React simultaneously fires a `socket.emit('sendMessage', data)` event down the WebSocket tunnel.
4. The Node server catches the [sendMessage](file:///d:/groupProject-startupmatch/backend/src/modules/messages/message.controller.js#13-23) event and instantly turns around and broadcasts it using `io.to(matchId).emit('newMessage')`. 
5. Your co-founder's browser (which is listening via `socket.on('newMessage')`) instantly catches the text and renders the new chat bubble on their screen without them ever refreshing the page!

---

## 5. Blueprint: End-to-End Features & API Routes

Here is exactly how every feature is split between the UI and the Backend API.

### A. Authentication & User Onboarding
**Purpose:** Securely registering and logging in users.
**Frontend:** [Login.jsx](file:///d:/groupProject-startupmatch/frontend/src/pages/Auth/Login.jsx), [Register.jsx](file:///d:/groupProject-startupmatch/frontend/src/pages/Auth/Register.jsx), [AuthContext.jsx](file:///d:/groupProject-startupmatch/frontend/src/context/AuthContext.jsx).
**Backend:** [auth.controller.js](file:///d:/groupProject-startupmatch/backend/src/modules/auth/auth.controller.js), [auth.routes.js](file:///d:/groupProject-startupmatch/backend/src/modules/auth/auth.routes.js).
*   `POST /api/v1/auth/register`: Takes email/password, hashes the password via Bcrypt, saves to MongoDB, and returns a JWT token.
*   `POST /api/v1/auth/login`: Compares the entered password against the database hash. If it matches, returns the JWT token.
*   `GET /api/v1/auth/me`: A security route. Evaluates the user's JWT token and returns their full profile data to hydrate the React App on refresh.

### B. Founder Profiles & Skills
**Purpose:** Allowing users to define their startup persona.
**Frontend:** [ProfileForm.jsx](file:///d:/groupProject-startupmatch/frontend/src/pages/Profile/ProfileForm.jsx).
**Backend:** [profile.controller.js](file:///d:/groupProject-startupmatch/backend/src/modules/profiles/profile.controller.js), [skill.controller.js](file:///d:/groupProject-startupmatch/backend/src/modules/skills/skill.controller.js).
*   `GET /api/v1/skills`: Fetches the global list of hardcoded skills from the database to populate the frontend multi-select dropdown.
*   `POST/PUT /api/v1/profiles`: Saves the user's selected Title, Industry, Availability (Hours/Week), Experience Level, and Array of Skills.

### C. The AI Matching Engine
**Purpose:** The "Tinder" algorithm that systematically pairs compatible founders.
**Frontend:** [MatchesFeed.jsx](file:///d:/groupProject-startupmatch/frontend/src/pages/Matches/MatchesFeed.jsx).
**Backend:** [match.service.js](file:///d:/groupProject-startupmatch/backend/src/modules/matches/match.service.js), [match.controller.js](file:///d:/groupProject-startupmatch/backend/src/modules/matches/match.controller.js).
*   `POST /api/v1/matches/generate`: The heart of the app. When clicked, the backend pulls your profile and compares it against every other user. It rules-based scores you up to 100 points:
    *   **Complementary Skills (40pts):** Rewards founders with *different* skills (e.g., A Coder matching with a Designer).
    *   **Industry Alignment (20pts):** Rewards picking the exact same target industry.
    *   **Experience & Availability (30pts):** Rewards similar professional levels and weekly time commitments.
    *   *If the final score > 30pts, a [Match](file:///d:/groupProject-startupmatch/backend/check_scores.js#8-37) ticket is generated.*
*   `GET /api/v1/matches`: Pulls all of your active matches to display in the UI.
*   `PUT /api/v1/matches/:id/status`: When you swipe right (`ACCEPTED`) or left (`REJECTED`). If both users Accept, it unlocks the Chat interface.

### D. Startup Project Marketplace (Job Board)
**Purpose:** Posting formal startup ideas and manually recruiting members.
**Frontend:** [ProjectsList.jsx](file:///d:/groupProject-startupmatch/frontend/src/pages/Projects/ProjectsList.jsx).
**Backend:** [project.controller.js](file:///d:/groupProject-startupmatch/backend/src/modules/projects/project.controller.js), [application.controller.js](file:///d:/groupProject-startupmatch/backend/src/modules/applications/application.controller.js).
*   `POST /api/v1/projects`: Allows a user to post their startup "Elevator Pitch" and required skills to the global public feed.
*   `GET /api/v1/projects`: Fetches all `OPEN` projects for applicants to browse.
*   `POST /api/v1/applications`: Submits a user's typed Cover Letter to apply to a specific project.
*   `PUT /api/v1/applications/:id/status`: Allows the Project Owner to toggle an applicant's status to `APPROVED` or `REJECTED`. 
*   `GET /api/v1/applications/my-applications`: Populates the "My Applications" tab so users can see if they got the job.

### E. Notifications & Badges
**Purpose:** Alerting users of important events.
**Frontend:** [Navbar.jsx](file:///d:/groupProject-startupmatch/frontend/src/components/Navbar.jsx) (The glowing red dots) and `Alerts.jsx`.
**Backend:** [notification.controller.js](file:///d:/groupProject-startupmatch/backend/src/modules/notifications/notification.controller.js).
*   `GET /api/v1/notifications/unread-count`: Counts total system alerts (e.g., "Your Application was Approved").
*   `GET /api/v1/messages/unread-count`: Counts unread chat messages.
*   *How it works:* The [Navbar.jsx](file:///d:/groupProject-startupmatch/frontend/src/components/Navbar.jsx) runs a `setInterval()` command, silently pinging both of these endpoints in the background every 30 seconds. If the number is > 0, React injects the red CSS ping animation over the icon!

### F. Real-time Chat Controller
**Purpose:** Fetching and saving text logs.
**Frontend:** [Chat.jsx](file:///d:/groupProject-startupmatch/frontend/src/pages/Chat/Chat.jsx).
**Backend:** [message.controller.js](file:///d:/groupProject-startupmatch/backend/src/modules/messages/message.controller.js).
*   `GET /api/v1/messages/:matchId`: Fetches the entire historical chat log between you and a specific matched co-founder from MongoDB.
*   `PUT /api/v1/messages/:matchId/read`: The moment you click on a user in the Chat Sidebar, this endpoint fires invisibly in the background, blanketing all pending messages as `read: true`, which successfully extinguishes the glowing red dot on your Navbar!

### G. Admin & Analytics Role
**Purpose:** God-mode dashboard metric tracking.
**Frontend:** [AdminDashboard.jsx](file:///d:/groupProject-startupmatch/frontend/src/pages/Admin/AdminDashboard.jsx).
**Backend:** [analytics.controller.js](file:///d:/groupProject-startupmatch/backend/src/modules/analytics/analytics.controller.js).
*   `GET /api/v1/admin/analytics`: Evaluates the global active users, active projects, match percentages, and database metrics. Protected by strict role-based `AUTHORIZE('ADMIN')` middleware.

---

## 6. Comprehensive API Dictionary

This is the definitive list of every single RESTful API route we constructed in the Express Backend Router.

### Authentication Endpoints (`/api/v1/auth/...`)
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/register` | Hashes a new password and creates a new User profile. |
| `POST` | `/login` | Authorizes an existing email and password. |
| `GET`  | `/me` | Validates a frontend JWT token and returns standard User data. |

### Profile & User Endpoints (`/api/v1/profiles/...`)
| Method | Route | Purpose |
|---|---|---|
| `GET`  | `/me` | Retrieves the deeply populated Profile details of the logged in user. |
| `GET`  | `/user/:id` | Retrieves the profile of a specific user. |
| `POST` | `/` | Creates a Founder Profile if the user does not have one yet. |
| `PUT`  | `/` | Updates an existing Founder Profile. |
| `GET`  | `/` | Retrieves a global list of Profiles for diagnostic purposes. |

### Skills Endpoints (`/api/v1/skills/...`)
| Method | Route | Purpose |
|---|---|---|
| `GET`  | `/` | Returns the global list of Database Seeded Skills (e.g. "React", "Marketing"). |
| `POST` | `/` | Administrator route to append new global skills to the database. |

### Matches Endpoints (`/api/v1/matches/...`)
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/generate` | **The Core Algorithm Engine.** Scrapes the database and mathematically scores the user against all other founders based on skills, hours, and industry. |
| `GET`  | `/` | Returns all 'PENDING' and 'ACCEPTED' matches related to the current User. |
| `PUT`  | `/:id/accept` | Approves a Match proposal. Unlocks Chat if both peers accept. |
| `PUT`  | `/:id/reject` | Declines a Match proposal and destroys it from the active feed permanently. |

### Projects Matrix Endpoints (`/api/v1/projects/...`)
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/` | Creates a formal public Startup Project in the Job Board feed. |
| `GET`  | `/` | Returns a list of all active Startup Projects across the platform. |
| `GET`  | [/:id](file:///d:/groupProject-startupmatch/frontend/src/context/AuthContext.jsx#6-54) | Retrieves deep metrics of one specific Project. |
| `PUT`  | [/:id](file:///d:/groupProject-startupmatch/frontend/src/context/AuthContext.jsx#6-54) | Updates a specific Project's core details or status (e.g. from OPEN to CLOSED). |
| `DELETE`| [/:id](file:///d:/groupProject-startupmatch/frontend/src/context/AuthContext.jsx#6-54) | Systematically deletes a Project entirely. |

### Application System Endpoints (`/api/v1/applications/...`)
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/` | Submits a Cover Letter applying to a specific public Project. |
| `GET`  | `/my-applications` | Yields all pending job applications submitted by the current User. |
| `GET`  | `/project/:projectId` | Allows a Project Owner to retrieve all incoming applications/resumes against their Startup. |
| `PUT`  | `/:id/status` | Allows a Project Owner to officially 'APPROVE' or 'REJECT' a specific applicant. |

### Messaging & Websocket Endpoints (`/api/v1/messages/...`)
| Method | Route | Purpose |
|---|---|---|
| `POST` | `/:matchId` | Formally logs a text message sequence to the raw database while Socket boundaries execute frontally. |
| `GET`  | `/:matchId` | Hydrates a raw React Component mounting sequence with the historic Chat text logs between two peers. |
| `GET`  | `/unread-count` | Polled by [Navbar.jsx](file:///d:/groupProject-startupmatch/frontend/src/components/Navbar.jsx) to dynamically render standard CSS Notification "glow" bubbles for unread texts. |
| `PUT`  | `/:matchId/read` | Triggers implicitly when clicking deep into a specific Chat context to clear "New Message" badges. |

### Notification Endpoints (`/api/v1/notifications/...`)
| Method | Route | Purpose |
|---|---|---|
| `GET`  | `/` | Retrieves the User's entire global system Alert History. |
| `GET`  | `/unread-count` | Polled by the Navbar `Alerts` tab to display a Red Dot. |
| `PUT`  | `/:id/read` | Marks a specific individual alert as consumed. |
| `PUT`  | `/read-all` | Marks all active contextual alerts within the User's scope as 'Read: true'. |

### Backend Analytics Endpoints (`/api/v1/admin/...`)
| Method | Route | Purpose |
|---|---|---|
| `GET`  | `/` | High-level data synthesis querying aggregated totals across all Mongo Collections simultaneously. Secured by explicit Role-Based Authorization keys. |

---

