# QuizMaster Backend 🎓⚡

Production-grade RESTful API backend for **QuizMaster** built with Node.js, Express.js, MongoDB Atlas (Mongoose ODM), and Google Gemini Generative AI.

---

## 🛠️ Technology Stack
- **Runtime:** Node.js (18.x / 20.x LTS) — ES Modules (`"type": "module"`)
- **Framework:** Express.js 4.21.x
- **Database & ODM:** MongoDB Atlas / Mongoose 8.12.x
- **Authentication & Security:** JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `cors`, `express-rate-limit`
- **Validation & Logging:** `express-validator`, `morgan`
- **AI Engine:** Google Gemini AI (`@google/generative-ai`)
- **Documentation:** Full API specification in `docs/API.md`

---

## 🚀 Getting Started

### 1. Installation
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create or configure your `.env` file based on `.env.example`:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
```

### 3. Database Seeding
Populate initial admin (`admin` / `admin123`), sample student accounts (`alexmorgan` / `alex123`), default system settings, and categorized quizzes with questions:
```bash
npm run seed
```

### 4. Running the Server
```bash
# Start server in development mode (with hot-reload)
npm run dev

# Start server in production mode
npm start
```

Server endpoints will be available at:
- **Base API:** `http://localhost:5000/api`
- **Health Check:** `http://localhost:5000/api/health`
- **DB Health:** `http://localhost:5000/api/health/db`

---

## 🧪 Automated Testing
Run the automated test suite verifying score calculations, negative marking, Fisher-Yates randomization, index remapping, password security, and API route guards:
```bash
npm test
```

---

## 📂 Project Structure
```
backend/
├── docs/
│   └── API.md                    # Complete REST API documentation
├── src/
│   ├── config/                   # Database, environment, and Gemini configurations
│   ├── controllers/              # Thin HTTP controllers
│   ├── middleware/               # Auth, Role, Rate Limit, Validation, and Error middlewares
│   ├── models/                   # Mongoose Schemas (User, Quiz, Question, Session, Attempt, Setting)
│   ├── routes/                   # Express Routers
│   ├── seed/                     # Database seeders (Admin, Settings, Quizzes, Questions)
│   ├── services/                 # Authoritative domain business logic (Scoring, Exams, AI, Analytics)
│   ├── utils/                    # Password hashing, JWT, Fisher-Yates shuffle, pure score calculator
│   ├── validators/               # express-validator request validation schemas
│   ├── app.js                    # Express app configuration & route mounting
│   └── server.js                 # Server entrypoint & DB connector
└── tests/
    ├── auth.test.js              # Password & JWT verification tests
    ├── scoring.test.js           # Scoring, negative marks & grade tests
    ├── shuffle.test.js           # Fisher-Yates and index remapping tests
    ├── api.test.js               # Route integration tests
    └── runner.js                 # Automated test runner
```

---

## 🔒 Security Highlights
- **Stateless Bearer JWT** verification with role separation (`user` vs `admin`).
- **Snapshot Isolation:** Examination attempts store an immutable deep snapshot of questions created at start. Edits to the question bank never mutate past results.
- **Server Authoritative Scoring:** The frontend is never trusted for scores, grades, or passing status. All calculations occur strictly on the backend.
- **Crash Resilience:** Live progress auto-saves continuously, allowing candidates to refresh or reconnect before expiration.
