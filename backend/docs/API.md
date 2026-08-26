# QuizMaster Backend REST API Documentation
**Version:** 1.0.0  
**Base URL:** `http://localhost:5000/api`  
**Standard:** REST / JSON / IEEE 830 Specification Compliant  

---

## 1. Overview & Architecture

The QuizMaster Backend is a stateless RESTful service engineered with Node.js, Express.js, MongoDB Atlas (Mongoose), and Google Gemini Generative AI. It enforces authoritative server-side logic for:
- Role-Based Access Control (RBAC) via Bearer JSON Web Tokens.
- Examination timing, Fisher-Yates randomization, and snapshot isolation.
- Pure scoring and grade evaluations incorporating positive marks and negative penalties.
- In-flight exam recovery and idempotent submission handling.
- Administrative intelligence dashboards, AI-assisted question generation, and user moderation.

### Common Request Headers
| Header | Description | Required |
| :--- | :--- | :--- |
| `Content-Type` | `application/json` | Yes (for POST/PUT/PATCH) |
| `Authorization` | `Bearer <JWT_TOKEN>` | Yes (for protected endpoints) |

### Standard Response Envelopes

#### Success Envelope (200 / 201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Human readable confirmation",
  "errors": []
}
```

#### Validation Error Envelope (422)
```json
{
  "success": false,
  "data": null,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    }
  ]
}
```

#### Error Envelope (400 / 401 / 403 / 404 / 409 / 500)
```json
{
  "success": false,
  "data": null,
  "message": "Error description message",
  "errors": []
}
```

---

## 2. Health & Diagnostic Endpoints

### 2.1 API Health Check
- **Method:** `GET`
- **Endpoint:** `/api/health`
- **Access:** Public
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2026-08-24T06:00:00.000Z",
    "env": "development"
  },
  "message": "QuizMaster API is active and operational."
}
```

### 2.2 Database Diagnostics
- **Method:** `GET`
- **Endpoint:** `/api/health/db`
- **Access:** Public
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "state": "connected",
    "isConnected": true,
    "host": "quizmastercluster.bxbxidp.mongodb.net",
    "name": "quizmaster"
  },
  "message": "Database health status retrieved."
}
```

---

## 3. Authentication & Profile Endpoints

### 3.1 Register Student Account
- **Method:** `POST`
- **Endpoint:** `/api/auth/register`
- **Access:** Public *(Note: Strictly creates Student `user` role; admin registration is disallowed)*
- **Request Body:**
```json
{
  "name": "Alex Morgan",
  "username": "alexmorgan",
  "email": "alex.morgan@example.com",
  "password": "alexSecurePassword123!",
  "photo": ""
}
```
- **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67b93a0e1c2d3e4f5a6b7c8d",
      "name": "Alex Morgan",
      "username": "alexmorgan",
      "email": "alex.morgan@example.com",
      "role": "user",
      "status": "active",
      "photo": "",
      "joinedAt": "2026-08-24T06:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Student account registered successfully."
}
```

### 3.2 User Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "identifier": "alexmorgan",
  "password": "alexSecurePassword123!",
  "role": "user"
}
```
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "67b93a0e1c2d3e4f5a6b7c8d",
      "name": "Alex Morgan",
      "username": "alexmorgan",
      "email": "alex.morgan@example.com",
      "role": "user",
      "status": "active"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Authenticated successfully."
}
```

### 3.3 Get Current User Profile
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Access:** Authenticated (Bearer Token)
- **Success Response (200 OK):** Returns current user object.

### 3.4 Update Profile
- **Method:** `PUT`
- **Endpoint:** `/api/auth/profile`
- **Access:** Authenticated (Bearer Token)
- **Request Body:**
```json
{
  "name": "Alex M. Morgan",
  "email": "alex.new@example.com",
  "photo": "data:image/jpeg;base64,..."
}
```

### 3.5 Update Password
- **Method:** `PUT`
- **Endpoint:** `/api/auth/password`
- **Access:** Authenticated (Bearer Token)
- **Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword456!"
}
```

---

## 4. Quizzes Endpoints

### 4.1 List Quizzes
- **Method:** `GET`
- **Endpoint:** `/api/quizzes`
- **Access:** Public / Student / Admin (Students receive `published` quizzes only)
- **Query Parameters:**
  - `page` (integer, default: 1)
  - `limit` (integer, default: 12)
  - `search` (string)
  - `category` (string)
  - `difficulty` (`Easy` | `Medium` | `Hard`)
  - `status` (`draft` | `published` | `archived` — Admin only)
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "67b94a1f1c2d3e4f5a6b7c8e",
        "title": "Intro to Computer Science",
        "description": "A gentle introduction covering programming fundamentals.",
        "category": "Computer Science",
        "difficulty": "Easy",
        "durationSeconds": 600,
        "passingScore": 50,
        "questionCount": 5,
        "status": "published",
        "settings": {
          "randomize": true,
          "shuffleAnswers": true,
          "showExplanations": true,
          "allowRetake": true
        }
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 12,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  },
  "message": "Quizzes retrieved successfully."
}
```

### 4.2 Get Quiz Details
- **Method:** `GET`
- **Endpoint:** `/api/quizzes/:id`
- **Access:** Public / Authenticated *(Note: Correct answers & explanations are omitted for student callers)*

### 4.3 Create Quiz
- **Method:** `POST`
- **Endpoint:** `/api/quizzes`
- **Access:** Admin only
- **Request Body:**
```json
{
  "title": "Modern JavaScript Essentials",
  "description": "Deep dive into ES6+, Async/Await, and Closures.",
  "category": "Web Development",
  "difficulty": "Medium",
  "durationSeconds": 600,
  "passingScore": 60,
  "questionIds": ["67b95c..."],
  "status": "published",
  "settings": {
    "randomize": true,
    "shuffleAnswers": true,
    "showExplanations": true,
    "allowRetake": true
  }
}
```

### 4.4 Update Quiz
- **Method:** `PUT`
- **Endpoint:** `/api/quizzes/:id`
- **Access:** Admin only

### 4.5 Delete / Archive Quiz
- **Method:** `DELETE`
- **Endpoint:** `/api/quizzes/:id?force=false`
- **Access:** Admin only *(Archives by default to protect historical attempt snapshots)*

---

## 5. Question Bank & AI Question Generation

### 5.1 List Questions
- **Method:** `GET`
- **Endpoint:** `/api/questions`
- **Access:** Admin only
- **Query Parameters:** `page`, `limit`, `search`, `category`, `difficulty`, `type`, `isActive`

### 5.2 Create Question
- **Method:** `POST`
- **Endpoint:** `/api/questions`
- **Access:** Admin only
- **Request Body:**
```json
{
  "text": "What is the primary function of DNS in networking?",
  "category": "Networking",
  "difficulty": "Medium",
  "type": "multiple-choice",
  "options": [
    "Translates domain names to IP addresses",
    "Encrypts web traffic",
    "Allocates MAC addresses",
    "Manages database queries"
  ],
  "correctIndex": 0,
  "marks": 1,
  "negativeMarks": 0.25,
  "explanation": "DNS (Domain Name System) translates human-readable hostnames into machine-routable IP addresses."
}
```

### 5.3 AI Question Generation (Google Gemini)
- **Method:** `POST`
- **Endpoint:** `/api/questions/generate-ai`
- **Access:** Admin only *(Rate limited: 15 calls / 15 mins)*
- **Request Body:**
```json
{
  "topic": "Quantum Computing",
  "difficulty": "Hard",
  "count": 5,
  "type": "multiple-choice"
}
```
- **Success Response (200 OK):** Returns validated, normalized array of generated questions ready for authoring.

---

## 6. Examination Sessions & Auto-Save

### 6.1 Start Examination Session
- **Method:** `POST`
- **Endpoint:** `/api/sessions/start`
- **Access:** Student only
- **Request Body:**
```json
{
  "quizId": "67b94a1f1c2d3e4f5a6b7c8e"
}
```
- **Behavior:**
  - Validates retake policy.
  - Returns existing unexpired in-progress session if active (crash-recovery).
  - Shuffles questions (Fisher-Yates) if `randomize` is enabled.
  - Shuffles answer choices and remaps `correctIndex` if `shuffleAnswers` is enabled.
  - Strips correct answers & explanations before sending payload to candidate.
- **Success Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "67b96e...",
    "quizId": "67b94a...",
    "title": "Intro to Computer Science",
    "durationSeconds": 600,
    "remainingSeconds": 600,
    "startedAt": "2026-08-24T06:00:00.000Z",
    "expiresAt": "2026-08-24T06:10:00.000Z",
    "questions": [
      {
        "id": "67b95a...",
        "text": "What does CPU stand for?",
        "options": ["Central Processing Unit", "Computer Power Unit", "Core Program Utility", "Central Program Unit"],
        "marks": 1,
        "negativeMarks": 0
      }
    ],
    "answers": {},
    "flagged": {},
    "currentIndex": 0,
    "status": "in-progress"
  },
  "message": "Examination session initiated successfully."
}
```

### 6.2 Auto-Save Exam Progress
- **Method:** `PUT`
- **Endpoint:** `/api/sessions/:id/progress`
- **Access:** Student only (owns session)
- **Request Body:**
```json
{
  "answers": {
    "67b95a...": 0,
    "67b95b...": 2
  },
  "flagged": {
    "67b95b...": true
  },
  "currentIndex": 2
}
```

### 6.3 Submit Examination Session
- **Method:** `POST`
- **Endpoint:** `/api/sessions/:id/submit`
- **Access:** Student only (owns session)
- **Request Body (Optional):** `{ "answers": { ... } }`
- **Behavior:**
  - Idempotent: Subsequent calls return the existing final attempt record without re-evaluating.
  - Performs authoritative server calculation of marks, negative penalties, pass/fail, and letter grades.
  - Automatically generates unique certificate verification ID (`QM-2026-XXXXXXXX`) if passed.
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "67b97f...",
    "quizId": "67b94a...",
    "title": "Intro to Computer Science",
    "durationSeconds": 600,
    "timeTakenSeconds": 142,
    "passed": true,
    "grade": "A+",
    "result": {
      "maximum": 5,
      "marks": 5,
      "percent": 100,
      "correct": 5,
      "wrong": 0,
      "skipped": 0,
      "perQuestion": [
        {
          "questionId": "67b95a...",
          "text": "What does CPU stand for?",
          "selected": 0,
          "correctIndex": 0,
          "outcome": "correct",
          "gained": 1,
          "explanation": "The CPU is the central processor executing program instructions."
        }
      ]
    },
    "certificate": {
      "eligible": true,
      "verificationId": "QM-2026-A1B2C3D4",
      "issuedAt": "2026-08-24T06:02:22.000Z"
    }
  },
  "message": "Examination submitted and evaluated successfully."
}
```

---

## 7. Attempts & Leaderboards

### 7.1 My Attempt History
- **Method:** `GET`
- **Endpoint:** `/api/attempts/my-attempts`
- **Access:** Student only
- **Query Parameters:** `page`, `limit`, `search`, `quizId`, `passed`, `sortBy`, `order`

### 7.2 Get Attempt Detail & Answer Review
- **Method:** `GET`
- **Endpoint:** `/api/attempts/:id`
- **Access:** Student (own attempt) / Admin (any attempt)

### 7.3 Public Certificate Verification
- **Method:** `GET`
- **Endpoint:** `/api/attempts/certificate/:verificationId`
- **Access:** Public
- **Success Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "verificationId": "QM-2026-A1B2C3D4",
    "candidateName": "Alex Morgan",
    "quizTitle": "Intro to Computer Science",
    "grade": "A+",
    "scorePercent": 100,
    "issuedAt": "2026-08-24T06:02:22.000Z",
    "passingScore": 50
  },
  "message": "Certificate verified successfully."
}
```

### 7.4 Leaderboards
- **Method:** `GET`
- **Endpoint:** `/api/leaderboard`
- **Access:** Public / Authenticated
- **Query Parameters:** `scope` (`global` | `weekly` | `monthly`), `quizId`, `limit`

---

## 8. Admin Moderation, Analytics & Settings

### 8.1 Administrative Metrics & Visual KPIs
- **Method:** `GET`
- **Endpoint:** `/api/admin/metrics`
- **Access:** Admin only
- **Returns:** Platform KPIs (`totalUsers`, `totalActiveQuizzes`, `totalCompletedAttempts`, `globalPassRate`), attempt trend curves, category distributions, difficulty comparisons, and registration growth.

### 8.2 User Management & Moderation
- **Method:** `GET`
- **Endpoint:** `/api/admin/users`
- **Access:** Admin only
- **Query Parameters:** `page`, `limit`, `search`, `status`, `role`

### 8.3 Block / Unblock Candidate
- **Method:** `PATCH`
- **Endpoint:** `/api/admin/users/:id/status`
- **Access:** Admin only
- **Request Body:** `{ "status": "blocked" }` or `{ "status": "active" }`

### 8.4 Inspect Specific Candidate History
- **Method:** `GET`
- **Endpoint:** `/api/admin/users/:id/attempts`
- **Access:** Admin only

### 8.5 System Settings
- **Method:** `GET` / `PUT`
- **Endpoint:** `/api/admin/settings`
- **Access:** Admin only
- **Request Body (PUT):**
```json
{
  "quiz": {
    "defaultDurationSeconds": 600,
    "defaultPassingScore": 50,
    "defaultRandomize": false,
    "defaultShuffleAnswers": false,
    "defaultShowExplanations": true,
    "defaultAllowRetake": true
  },
  "users": {
    "allowRegistration": true,
    "allowPhotoUpload": true
  },
  "appearance": {
    "accent": "#4F46E5"
  }
}
```

---

## 9. Error Codes & HTTP Mapping

| HTTP Code | Error Scenario | Description |
| :--- | :--- | :--- |
| `400 Bad Request` | Invalid params / Malformed payload | Syntax error in JSON body, bad ID format, or retake attempt blocked. |
| `401 Unauthorized` | Missing / Expired JWT | Client did not provide a valid Bearer token. |
| `403 Forbidden` | Insufficient Permissions | Student attempting admin route, or blocked account. |
| `404 Not Found` | Resource missing | Requested Quiz, Question, User, Session, or Attempt does not exist. |
| `409 Conflict` | Duplicate Key | Username or Email already exists in MongoDB. |
| `422 Unprocessable Entity` | Validation Failure | express-validator constraints failed (e.g. invalid email, weak password). |
| `429 Too Many Requests` | Rate limit breached | Exceeded request quota on Auth, AI, or general API tier. |
| `500 Internal Server Error` | Unhandled exception | Server-side exception caught and safely masked. |
| `502 / 503 Bad Gateway` | AI Provider Error | Google Gemini service or quota failure. |
