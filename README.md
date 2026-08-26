# 🎓⚡ QuizMaster — Intelligent Examination & Assessment Platform

<div align="center">

<img src="docs/screenshots/quizmaster-banner.png" alt="QuizMaster Banner" width="100%"/>

### 🚀 Enterprise-Grade Online Examination, Quiz & Assessment Platform

**QuizMaster** is a modern, secure, AI-powered examination management platform designed for universities, schools, training institutes, educators, certification providers, and professional learning platforms.

It combines **online examinations, intelligent quiz generation, real-time analytics, resilient exam sessions, server-authoritative scoring, question-bank management, student performance intelligence, digital certificates, leaderboards, and Google Gemini AI** into one unified platform.

<br/>

[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge\&logo=react\&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge\&logo=vite\&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge\&logo=node.js\&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge\&logo=express\&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge\&logo=mongodb\&logoColor=white)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Google-Gemini%20AI-8E75C2?style=for-the-badge\&logo=googlegemini\&logoColor=white)](https://ai.google.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC?style=for-the-badge\&logo=tailwindcss\&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

**🔐 Secure • 🤖 AI-Powered • ⚡ Resilient • 📊 Analytics-Driven • 📜 Certificate-Ready**

</div>

# 📸 Screenshots

## 🏠 Landing Page

![QuizMaster Landing Page](docs/screenshots/landing-page.png)

---

## 🔐 Authentication

![Login Page](docs/screenshots/login.png)

![Registration Page](docs/screenshots/register.png)

---

## 👑 Admin Dashboard

![Admin Dashboard](docs/screenshots/admin-dashboard.png)

The administrative dashboard provides:

* Total students
* Total quizzes
* Published examinations
* Total attempts
* Average score
* Pass/fail statistics
* Certificate statistics
* Registration trends
* Quiz participation
* Performance analytics
* Recent activities
* System health
* Quick actions

---

## 📝 Quiz Management

![Quiz Management](docs/screenshots/quiz-management.png)

Administrators can:

* Create quizzes
* Edit quizzes
* Duplicate quizzes
* Publish/unpublish quizzes
* Archive quizzes
* Configure time limits
* Configure pass percentage
* Configure attempts
* Configure negative marking
* Configure question randomization
* Configure answer randomization
* Configure access permissions
* Configure question pools
* Preview examinations

---

## 🧠 Question Bank

![Question Bank](docs/screenshots/question-bank.png)

Centralized question management supporting:

* Multiple Choice
* Multi-Select
* True/False
* Short Answer
* Difficulty levels
* Categories
* Tags
* Explanations
* Marks
* Negative marks
* Question status
* Bulk import
* Duplicate detection
* Question preview
* Question versioning

---

## 🤖 AI Quiz Generator

![AI Quiz Generator](docs/screenshots/ai-generator.png)

Generate complete examinations using natural-language instructions.

Example:

```text
Generate a 30-question Data Structures examination
for undergraduate students.

Difficulty:
40% Easy
40% Medium
20% Hard

Question Types:
MCQ + True/False

Include:
- Correct answers
- Explanations
- Marks
- Topic classification
```

---

## 🎯 Student Dashboard

![Student Dashboard](docs/screenshots/student-dashboard.png)

Students can view:

* Quiz recommendations
* Upcoming examinations
* Completed quizzes
* Average score
* Pass rate
* Certificates
* Leaderboard rank
* Weak topics
* Strong topics
* Recent activity
* Learning progress

---

## ⏱️ Examination Engine

![Exam Interface](docs/screenshots/exam-interface.png)

The examination engine provides:

* Live countdown timer
* Question navigator
* Previous/Next navigation
* Mark for review
* Answer status
* Auto-save
* Network recovery
* Auto-submit
* Full-screen examination mode
* Attempt protection
* Server-side session synchronization

---

## 📊 Examination Results

![Results Dashboard](docs/screenshots/results-dashboard.png)

Students receive:

* Score
* Percentage
* Grade
* Pass/fail status
* Correct answers
* Incorrect answers
* Unanswered questions
* Time spent
* Question-wise performance
* Topic-wise performance
* Explanations
* Improvement recommendations

---

## 🏆 Leaderboard

![Leaderboard](docs/screenshots/leaderboard.png)

Leaderboard scopes:

* Global
* Weekly
* Monthly
* Quiz-specific
* Category-specific
* Student-group-specific

---

## 📜 Digital Certificate

![Certificate](docs/screenshots/certificate.png)

Certificates include:

* Candidate name
* Course/quiz title
* Score
* Completion date
* Certificate ID
* Verification URL
* QR code
* Organization branding
* Digital signature
* Custom certificate template

---

## 🔎 Certificate Verification

![Certificate Verification](docs/screenshots/certificate-verification.png)

Anyone can verify a certificate using its unique verification code or QR code.

Example:

```text
https://your-domain.com/verify/QM-8F4A9C21
```

---

## 📈 Advanced Analytics

![Analytics Dashboard](docs/screenshots/analytics-dashboard.png)

Analytics include:

* Student registration trends
* Quiz participation
* Pass/fail distribution
* Average scores
* Category performance
* Difficulty performance
* Question accuracy
* Completion rates
* Attempt trends
* Certificate issuance
* Leaderboard analytics

---

# 🌟 Core Features

## 👨‍🎓 Student Features

### 📚 Intelligent Quiz Library

Students can discover quizzes using:

* Search
* Category
* Subject
* Difficulty
* Duration
* Score requirement
* Tags
* Availability
* Completion status

### 🎯 Personalized Dashboard

The dashboard intelligently summarizes:

```text
Quizzes Taken
Average Score
Pass Rate
Certificates Earned
Current Rank
Strongest Topics
Weakest Topics
Recent Attempts
```

### ⏱️ Resilient Examination Engine

QuizMaster is designed to protect examination progress against:

* Browser refresh
* Temporary network failure
* Tab closure
* Connection interruption
* Accidental navigation
* Device changes

Progress is checkpointed through the server-backed session system.

### 🏁 Automatic Submission

When the timer reaches zero:

```text
Timer → Session Validation → Final Sync → Server Scoring → Result
```

The browser does not determine the final score.

---

# 👑 Administrator Features

## 📊 Executive Dashboard

Administrators receive a complete operational overview:

* Students
* Quizzes
* Questions
* Attempts
* Certificates
* Categories
* Groups
* AI usage
* System activity
* Registration statistics

---

## 📝 Advanced Quiz Studio

Quiz creation supports:

### General Information

* Quiz title
* Description
* Category
* Subject
* Instructions
* Thumbnail
* Tags
* Difficulty

### Configuration

* Duration
* Passing percentage
* Maximum attempts
* Question count
* Total marks
* Negative marking
* Random questions
* Random answers
* Availability window

### Access Control

* Public
* Registered students
* Specific groups
* Assigned students
* Private invitation

### Publishing

```text
Draft
 ↓
Review
 ↓
Ready
 ↓
Published
 ↓
Archived
```

---

# 🧠 Advanced Question Bank

The question bank supports:

| Question Type        | Supported |
| -------------------- | --------: |
| Multiple Choice      |         ✅ |
| Multiple Select      |         ✅ |
| True / False         |         ✅ |
| Short Answer         |         ✅ |
| Question Explanation |         ✅ |
| Negative Marking     |         ✅ |
| Difficulty           |         ✅ |
| Tags                 |         ✅ |
| Categories           |         ✅ |
| Question Pools       |         ✅ |
| Bulk Import          |         ✅ |
| Duplicate            |         ✅ |
| Disable/Enable       |         ✅ |
| Versioning           |         ✅ |

---

# 🤖 Google Gemini AI Superpowers

QuizMaster integrates Google Gemini for intelligent educational workflows.

## 🪄 AI Quiz Generation

Input:

```text
JavaScript ES6
30 questions
Intermediate level
MCQ
Include explanations
```

Output:

```text
Quiz
├── Question
│   ├── Question text
│   ├── Options
│   ├── Correct answer
│   ├── Explanation
│   ├── Difficulty
│   ├── Topic
│   └── Marks
```

---

## 🎯 AI Distractor Generator

AI can generate plausible incorrect answers while maintaining educational quality.

---

## 💡 AI Explanation Generator

Automatically generate explanations for:

* Correct answers
* Incorrect answers
* Concepts
* Common mistakes
* Learning resources

---

## 🤖 AI Study Assistant

Students can ask:

```text
Why is this answer correct?

Explain recursion simply.

Give me a hint.

What topic should I study next?

Why did I get this question wrong?
```

The assistant should guide the student without simply revealing answers during an active examination.

---

## 📚 AI Curriculum Generator

Generate structured learning content:

```text
Subject
 ↓
Topics
 ↓
Subtopics
 ↓
Learning Objectives
 ↓
Questions
 ↓
Assessment
 ↓
Performance Analysis
```

---

# 🔐 Security & Examination Integrity

QuizMaster follows a **Zero-Client-Trust examination architecture**.

## 🔒 Server-Authoritative Scoring

Correct answers are never trusted from the browser.

```text
Student Answer
      ↓
Server Session
      ↓
Frozen Exam Snapshot
      ↓
Answer-Key Evaluation
      ↓
Negative Marking
      ↓
Score Calculation
      ↓
Final Result
```

---

## 🧊 Snapshot Isolation

When an examination begins, QuizMaster creates an immutable snapshot.

```text
Question Bank
     │
     ▼
Exam Start
     │
     ▼
Immutable Snapshot
     │
     ▼
Student Attempt
```

Future question edits cannot modify historical attempts.

---

## 🔀 Secure Randomization

QuizMaster supports:

* Fisher-Yates question shuffling
* Option permutation
* Server-generated randomization
* Option-index remapping

This reduces predictable examination patterns.

---

# 🧮 Advanced Scoring Engine

Supports:

### Positive Marks

```text
Correct = +1
```

### Negative Marking

```text
Correct = +1
Wrong   = -0.25
Skipped = 0
```

### Weighted Questions

```text
Easy   = 1 mark
Medium = 2 marks
Hard   = 4 marks
```

### Passing Calculation

```text
Percentage =
(Earned Marks / Maximum Marks) × 100
```

---

# 🏆 Achievement System

Students can unlock achievements such as:

| Achievement           | Example                     |
| --------------------- | --------------------------- |
| 🎯 First Attempt      | Complete your first quiz    |
| 🔥 Perfect Score      | Score 100%                  |
| 🧠 Knowledge Master   | Complete 10 quizzes         |
| 🏆 Top Performer      | Reach leaderboard top 10    |
| 📚 Consistent Learner | Quiz activity for 7 days    |
| ⚡ Speed Solver        | Complete within target time |
| 📜 Certified          | Earn first certificate      |

---

# 📊 Student Performance Intelligence

QuizMaster tracks:

```text
Topic
 ├── Accuracy
 ├── Attempts
 ├── Average Score
 ├── Time Spent
 ├── Difficulty
 └── Improvement
```

Example:

```text
Data Structures
██████████████████░░ 90%

Algorithms
██████████████░░░░░░ 70%

Recursion
██████████░░░░░░░░░░ 50%
```

The platform can identify weak areas and recommend targeted practice.

---

# 👥 Student & Group Management

Administrators can create:

* Classes
* Batches
* Cohorts
* Departments
* Courses
* Training groups

Example:

```text
University
 ├── Faculty of Technology
 │    ├── ICT
 │    │    ├── Year 1
 │    │    ├── Year 2
 │    │    ├── Year 3
 │    │    └── Year 4
```

Quizzes can be assigned to specific groups.

---

# 📜 Certificate Management

Certificate features:

* Custom templates
* Logo
* Background
* Signature
* Border
* Typography
* Candidate information
* QR verification
* Unique certificate IDs
* PDF generation
* Verification portal
* Revocation support

Certificate lifecycle:

```text
Passed
  ↓
Certificate Generated
  ↓
Credential ID Created
  ↓
QR Generated
  ↓
Certificate Issued
  ↓
Public Verification
```

---

# 📡 Real-Time & Resilience Features

Advanced session architecture supports:

### Auto Save

```text
Answer Change
      ↓
Local State
      ↓
API Checkpoint
      ↓
Server Session
```

### Recovery

```text
Network Lost
     ↓
Offline State
     ↓
Local Recovery Data
     ↓
Connection Restored
     ↓
Sync With Server
```

### Conflict Protection

The backend validates:

* Session ownership
* Session status
* Attempt state
* Question version
* Submission state
* Expiration time

---

# 🔔 Notification System

Supported notification types:

* Quiz published
* Quiz assigned
* Examination reminder
* Result published
* Certificate issued
* Achievement unlocked
* System announcement
* AI generation completed
* Account notification

---

# 🔎 Advanced Search & Filtering

Global search supports:

```text
Students
Quizzes
Questions
Categories
Attempts
Certificates
Groups
Activity Logs
```

Filters can include:

* Date
* Status
* Category
* Difficulty
* Score
* Role
* Group
* Completion state

---

# 📝 Bulk Question Import

Administrators can import questions using structured files.

Example:

```csv
question,optionA,optionB,optionC,optionD,correctAnswer,difficulty,marks
"What is 2+2?","3","4","5","6","B","Easy","1"
```

Validation checks:

* Missing fields
* Invalid answers
* Duplicate questions
* Invalid marks
* Invalid categories
* Unsupported question types

---

# 📋 Exam Templates

Administrators can create reusable examination templates.

Example:

```text
Frontend Developer Assessment
├── 10 HTML Questions
├── 10 CSS Questions
├── 10 JavaScript Questions
├── 5 React Questions
└── 5 Web Security Questions
```

Templates reduce repetitive quiz creation.

---

# 🧪 Examination Preview Mode

Before publishing, administrators can preview the exact examination experience.

Preview includes:

* Instructions
* Timer
* Questions
* Navigation
* Mark for review
* Answer selection
* Results preview

---

# 🛡️ Audit Logging

Important actions are recorded:

```text
ADMIN_LOGIN
QUIZ_CREATED
QUIZ_UPDATED
QUIZ_PUBLISHED
QUESTION_CREATED
QUESTION_UPDATED
STUDENT_CREATED
ATTEMPT_STARTED
ATTEMPT_SUBMITTED
CERTIFICATE_ISSUED
CERTIFICATE_REVOKED
AI_GENERATION
SYSTEM_SETTING_CHANGED
```

Audit records can include:

* Actor
* Action
* Timestamp
* Resource
* IP metadata
* Previous value
* New value

---

# 📈 Analytics & Reporting

## Administrator Analytics

Metrics include:

* Total users
* Active users
* Quiz participation
* Average score
* Pass rate
* Failure rate
* Completion rate
* Average completion time
* Most difficult questions
* Most successful questions
* Category performance

## Student Analytics

```text
Overall Performance
        ↓
Category Performance
        ↓
Topic Performance
        ↓
Question Performance
        ↓
Weakness Detection
        ↓
Study Recommendation
```

---

# 🏅 Leaderboard System

Supports:

```text
Global
Weekly
Monthly
Quiz
Category
Group
```

Ranking can consider:

```text
Score
+
Accuracy
+
Completion
+
Time
```

Tie-breaking rules should be handled consistently by the backend.

---

# 🧩 Advanced UI/UX

QuizMaster uses a modern SaaS design system with:

* Responsive layouts
* Light mode
* Dark mode
* Glassmorphism
* Neumorphism-inspired depth
* Modern cards
* Animated statistics
* Interactive charts
* Micro-interactions
* Skeleton loaders
* Toast notifications
* Empty states
* Error states
* Confirmation dialogs
* Accessible forms
* Keyboard navigation

### Responsive Targets

```text
📱 Mobile
📱 Tablet
💻 Laptop
🖥️ Desktop
📺 Large Display
```

---

# 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     QUIZMASTER PLATFORM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  React 19 + Vite + Tailwind                                │
│              │                                              │
│              ▼                                              │
│       REST API / JWT                                        │
│              │                                              │
│              ▼                                              │
│  Node.js + Express                                          │
│              │                                              │
│       ┌──────┼───────────┐                                  │
│       ▼      ▼           ▼                                  │
│   Auth     Exam       AI Services                           │
│   RBAC     Engine     Gemini                                │
│       │      │           │                                  │
│       └──────┼───────────┘                                  │
│              ▼                                              │
│        MongoDB Atlas                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 🛠️ Technology Stack

| Layer             | Technology          |
| ----------------- | ------------------- |
| Frontend          | React 19            |
| Build Tool        | Vite 8              |
| Styling           | Tailwind CSS 3.4    |
| Routing           | React Router        |
| Icons             | Lucide React        |
| Charts            | Recharts / Chart.js |
| Animation         | Framer Motion       |
| Backend           | Node.js 20          |
| API               | Express.js          |
| Database          | MongoDB Atlas       |
| ODM               | Mongoose 8          |
| Authentication    | JWT                 |
| Password Security | bcrypt              |
| AI                | Google Gemini       |
| Security          | Helmet              |
| Rate Limiting     | express-rate-limit  |
| Validation        | express-validator   |
| PDF               | jsPDF               |
| QR                | QR Code Generator   |
| Testing           | Jest / Supertest    |
| API Testing       | Postman             |

---

# 📂 Project Structure

```text
QuizMaster/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── seed/
│   │   ├── app.js
│   │   └── server.js
│   │
│   ├── tests/
│   ├── docs/
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── public/
│   │   │   └── student/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── .env.example
│   └── package.json
│
├── docs/
│   ├── screenshots/
│   ├── architecture/
│   └── api/
│
├── postman/
│   ├── QuizMaster.postman_collection.json
│   └── QuizMaster.postman_environment.json
│
├── README.md
├── TECHNICAL_REPORT.md
└── LICENSE
```

---

# 🔐 Authentication & RBAC

## Roles

### 👑 Administrator

Full system access:

```text
Users
Quizzes
Questions
Categories
Groups
Attempts
Analytics
Certificates
AI
Settings
Audit Logs
```

### 👨‍🎓 Student

```text
Dashboard
Quiz Library
Examinations
Results
Certificates
Leaderboard
Achievements
AI Tutor
Profile
```

---

# 📡 REST API

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Quiz

```http
GET    /api/quizzes
GET    /api/quizzes/:id
POST   /api/quizzes
PUT    /api/quizzes/:id
DELETE /api/quizzes/:id
POST   /api/quizzes/:id/publish
POST   /api/quizzes/:id/duplicate
```

## Questions

```http
GET    /api/questions
POST   /api/questions
GET    /api/questions/:id
PUT    /api/questions/:id
DELETE /api/questions/:id
POST   /api/questions/import
POST   /api/questions/:id/duplicate
```

## Examinations

```http
POST /api/exams/start/:quizId
POST /api/exams/sync/:sessionId
GET  /api/exams/session/:sessionId
POST /api/exams/submit/:sessionId
```

## Results

```http
GET /api/results
GET /api/results/:attemptId
GET /api/results/:attemptId/review
```

## Certificates

```http
GET  /api/certificates
GET  /api/certificates/:id
GET  /api/certificates/verify/:code
POST /api/certificates/:id/revoke
```

## AI

```http
POST /api/ai/generate-quiz
POST /api/ai/generate-question
POST /api/ai/generate-explanation
POST /api/ai/generate-distractors
POST /api/ai/chat
```

## Analytics

```http
GET /api/analytics/dashboard
GET /api/analytics/students
GET /api/analytics/quizzes
GET /api/analytics/categories
GET /api/analytics/performance
```

---

# 🚀 Installation

## Requirements

* Node.js 20+
* npm
* MongoDB Atlas or local MongoDB
* Google Gemini API key

---

## Backend

```bash
cd backend

npm install

cp .env.example .env
```

Configure:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/quizmaster

JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_supported_gemini_model

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

Start:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

---

# 🎨 Frontend

```bash
cd frontend

npm install
```

Create `.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 👤 Demo Accounts

> Change these credentials before deploying a public instance.

| Role          | Email                 | Password   |
| ------------- | --------------------- | ---------- |
| 👑 Admin      | `admin@quizmaster.io` | `admin123` |
| 👨‍🎓 Student | `alex@quizmaster.io`  | `alex123`  |
| 👩‍🎓 Student | `sarah@quizmaster.io` | `sarah123` |

---

# 🧪 Testing

Run backend tests:

```bash
cd backend

npm test
```

Test categories:

```text
Authentication
RBAC
Scoring
Negative Marking
Randomization
Snapshot Isolation
Exam Sessions
API Validation
Certificate Verification
```

---

# 🧪 Example Scoring Test

```text
Question Marks:       2
Negative Mark:        0.5

Correct Answers:      8
Wrong Answers:        2
Skipped:              0

Score:
8 × 2 = 16
2 × 0.5 = 1 penalty

Final Score = 15
```

---

# 🛡️ Security Architecture

QuizMaster implements defense-in-depth security.

### Authentication

* JWT authentication
* Password hashing
* Token expiration
* Protected routes

### API Security

* Helmet
* CORS
* Rate limiting
* Request validation
* Error handling
* RBAC
* Input sanitization

### Examination Security

* Server-side scoring
* Frozen snapshots
* Server-authoritative timer
* Attempt ownership validation
* Session state validation
* Duplicate submission protection
* Randomized questions
* Randomized options

---

# 🧠 Database Architecture

Core collections:

```text
users
roles
quizzes
questions
categories
quizSnapshots
examSessions
attempts
answers
certificates
certificateTemplates
studentGroups
achievements
notifications
leaderboards
auditLogs
aiGenerations
systemSettings
```

Important indexes should be maintained for:

```text
user.email
quiz.slug
quiz.status
question.category
attempt.student
attempt.quiz
certificate.verificationCode
examSession.student
examSession.status
auditLog.createdAt
```

---

# 🔄 Examination Lifecycle

```text
Student selects quiz
        ↓
Pre-exam instructions
        ↓
Server validates eligibility
        ↓
Exam snapshot created
        ↓
Secure session initialized
        ↓
Questions delivered
        ↓
Student answers
        ↓
Automatic checkpoints
        ↓
Timer synchronization
        ↓
Submit / Auto-submit
        ↓
Server validates session
        ↓
Server calculates score
        ↓
Attempt permanently stored
        ↓
Result generated
        ↓
Certificate eligibility checked
        ↓
Certificate issued
```

---

# 🧊 Snapshot Architecture

One of QuizMaster's most important features is immutable examination state.

```text
QUESTION BANK
     │
     ├── Question A
     ├── Question B
     ├── Question C
     │
     ▼
EXAM START
     │
     ▼
SNAPSHOT
     │
     ├── Question A version 1
     ├── Question B version 1
     └── Question C version 1
             │
             ▼
        STUDENT ATTEMPT
```

If an administrator changes Question B later:

```text
Question B v2
```

The historical attempt continues using:

```text
Question B v1
```

This guarantees historical result integrity.

---

# ⚡ Performance Features

QuizMaster is designed for high-concurrency scenarios.

Optimization strategies include:

* MongoDB indexing
* Lean queries
* Pagination
* Aggregation pipelines
* API response normalization
* Lazy-loaded frontend routes
* Component-level code splitting
* Debounced search
* Cached dashboard data
* Efficient exam synchronization
* Minimal payloads
* Server-side pagination

---

# 📱 Progressive Web Experience

Future-ready capabilities can include:

* Installable application
* Offline shell
* Background synchronization
* Push notifications
* Network-aware UI
* Offline exam recovery

---

# ♿ Accessibility

The interface is designed to support:

* Keyboard navigation
* Screen readers
* Accessible labels
* Focus states
* Semantic HTML
* Color-independent status indicators
* Reduced-motion preferences
* Responsive text

---

# 🌍 Internationalization Ready

QuizMaster can be extended for:

```text
English
தமிழ்
සිංහල
```

Future translations can cover:

* Navigation
* Questions
* Instructions
* Results
* Certificates
* Notifications
* Admin interface

---

# 🧑‍💻 Developer Experience

Included developer tooling:

* ESLint
* Environment configuration
* API service abstraction
* Reusable UI components
* Validation middleware
* Centralized error handling
* API documentation
* Postman collection
* Automated tests
* Seed scripts
* Structured logging

---

# 🗺️ Roadmap

## Phase 1 — Core Platform

* [x] Authentication
* [x] Student dashboard
* [x] Admin dashboard
* [x] Quiz management
* [x] Question bank
* [x] Examination engine
* [x] Server-side scoring

## Phase 2 — Intelligence

* [x] Gemini AI integration
* [x] AI quiz generation
* [x] AI explanations
* [x] AI study assistant
* [ ] Adaptive difficulty engine
* [ ] AI-powered question quality scoring

## Phase 3 — Enterprise

* [ ] Organization management
* [ ] Multi-tenant architecture
* [ ] Advanced roles
* [ ] Department management
* [ ] Institution branding
* [ ] SSO
* [ ] Advanced audit reports

## Phase 4 — Advanced Assessment

* [ ] Question difficulty calibration
* [ ] Item analysis
* [ ] Question discrimination index
* [ ] Bloom's taxonomy classification
* [ ] Adaptive testing
* [ ] Exam proctoring integration
* [ ] Browser integrity monitoring

## Phase 5 — Learning Intelligence

* [ ] Personalized learning paths
* [ ] AI-generated study plans
* [ ] Weak-topic prediction
* [ ] Knowledge graphs
* [ ] Skill mastery tracking
* [ ] Recommendation engine

---

# 🔮 Future Advanced Features

QuizMaster can evolve into a complete **AI Assessment Operating System**.

### 🧠 Adaptive Examination Engine

Questions dynamically adjust according to student performance.

```text
Easy
 ↓
Correct
 ↓
Medium
 ↓
Correct
 ↓
Hard
 ↓
Incorrect
 ↓
Medium
```

### 📊 Psychometric Analysis

Future assessment intelligence can calculate:

* Difficulty index
* Discrimination index
* Reliability
* Question effectiveness
* Distractor effectiveness

### 🛡️ AI-Assisted Proctoring

Potential capabilities:

* Face presence detection
* Multiple-person detection
* Tab-switch monitoring
* Suspicious activity detection
* Full-screen monitoring
* Examination event timeline

> Proctoring features should be implemented with appropriate privacy, consent, accessibility, and institutional policies.

---

# 🏢 Enterprise Multi-Tenant Architecture

Future architecture:

```text
Platform
│
├── University A
│   ├── Faculty
│   ├── Departments
│   ├── Teachers
│   └── Students
│
├── University B
│   ├── Faculty
│   ├── Departments
│   ├── Teachers
│   └── Students
│
└── Training Institute C
    ├── Courses
    ├── Trainers
    └── Learners
```

Each organization can have:

* Separate users
* Separate quizzes
* Separate branding
* Separate certificates
* Separate analytics
* Separate configuration

---

# 🏆 Why QuizMaster?

| Capability           | QuizMaster |
| -------------------- | ---------: |
| Online Exams         |          ✅ |
| Quiz Management      |          ✅ |
| Question Bank        |          ✅ |
| Server-Side Scoring  |          ✅ |
| Snapshot Isolation   |          ✅ |
| Auto Save            |          ✅ |
| Exam Recovery        |          ✅ |
| Negative Marking     |          ✅ |
| Randomization        |          ✅ |
| AI Quiz Generation   |          ✅ |
| AI Tutor             |          ✅ |
| Analytics            |          ✅ |
| Leaderboards         |          ✅ |
| Achievements         |          ✅ |
| Digital Certificates |          ✅ |
| QR Verification      |          ✅ |
| Audit Logs           |          ✅ |
| RBAC                 |          ✅ |
| Responsive UI        |          ✅ |
| Dark Mode            |          ✅ |
| API Architecture     |          ✅ |
| Automated Testing    |          ✅ |

---

# 📚 Documentation

Additional documentation:

```text
docs/
├── API.md
├── ARCHITECTURE.md
├── DATABASE.md
├── SECURITY.md
├── AI.md
├── EXAM_ENGINE.md
└── CERTIFICATES.md
```

---

# 🤝 Contributing

Contributions are welcome.

```bash
git clone https://github.com/YOUR_USERNAME/quizmaster.git

cd quizmaster

git checkout -b feature/new-feature

git add .

git commit -m "feat: add new assessment feature"

git push origin feature/new-feature
```

Then open a Pull Request.

---

# 🐛 Bug Reports

When reporting an issue, include:

* Browser
* Operating system
* Reproduction steps
* Expected behavior
* Actual behavior
* Screenshots
* Console errors
* API response where applicable

---

# 🔐 Security Disclosure

Please do not publicly disclose security vulnerabilities.

Report security issues privately to the project maintainer.

---

# 📄 License

This project is licensed under the **MIT License**.

See [LICENSE](LICENSE) for details.

---

# 👨‍💻 Author

<div align="center">

### 🎓 QuizMaster

**Intelligent Examination & Assessment Platform**

Built for:

🎓 Universities
🏫 Schools
📚 Training Institutes
👨‍🏫 Educators
💼 Corporate Training
🏆 Certification Programs

<br/>

**Built with ❤️ using React, Node.js, Express, MongoDB & Google Gemini AI**

</div>

---

# ⭐ Support the Project

If QuizMaster helped you:

⭐ Star the repository
🍴 Fork the project
🐛 Report issues
💡 Suggest features
🤝 Submit pull requests

---

<div align="center">

### 🚀 QuizMaster

**From Traditional Quizzes → Intelligent Assessments**

`Secure • Intelligent • Resilient • Scalable • Verifiable`

</div>
