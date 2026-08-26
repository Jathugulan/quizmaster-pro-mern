# QuizMaster 🎓

A premium, portfolio-grade **Quiz Management & Examination Platform**. A frontend-only build with demo data, but architected so a Node.js/Express/MongoDB backend can be plugged in later with minimal refactoring — all data access is isolated behind `src/utils/storage.js`.

## Tech Stack
- **React + Vite** (v19 / Vite 8)
- **Bootstrap 5** — responsive grid/layout utilities
- **Tailwind CSS** — custom premium styling layer (dark/light theme tokens)
- **React Router v7** — role-guarded routing
- **Recharts** — admin analytics dashboards
- **Lucide React** — icon set
- **LocalStorage** — demo persistence (swappable for a real API)

## Getting started
```bash
npm install
npm run dev       # start the dev server (http://localhost:5173)
npm run build     # production build
npm run preview   # preview the production build
```

## Demo credentials (mock only)
> ⚠️ The admin account uses hardcoded plaintext credentials **purely for this frontend demo**. A real deployment **must** replace this with backend auth (hashed passwords, server-side sessions) — see the comments in `src/data/users.js` and `src/utils/storage.js`.

| Role    | Username | Password |
| ------- | -------- | -------- |
| Admin   | `admin`  | `admin123` |
| Student | `alexmorgan` | `alex123` |

- Sign In includes a **role selector** (Student / Admin) — credentials are checked against the selected role.
- Sign Up is **Students only** and honours the "Allow new registrations" system setting.

## Key features
**Student**
- Dashboard with quick stats (quizzes completed, average, certificates, leaderboard rank)
- Filterable/searchable **Quiz Library**, Quiz Details with instructions
- **Quiz Attempt**: single-question view, live countdown timer (auto-submit at 0), previous/next, mark-for-review, question navigator (side panel on desktop / bottom drawer on mobile), auto-save to LocalStorage (survives refresh)
- Result page (circular progress, grade, breakdown), per-question **Answer Review**
- My Results history, Leaderboard (global/weekly/monthly/quiz), printable Certificates, Profile & Settings

**Admin**
- Platform dashboard with charts (attempts over time, registrations, category popularity, per-quiz performance)
- Quiz CRUD (publish/draft/disable, duplicate, delete, behaviour toggles)
- Question Bank + Question CRUD (preview/edit/duplicate/disable/delete)
- User Management (search, attempts, avg score, block/unblock, per-user quiz history)
- Admin Profile, System Settings (quiz defaults, registration & photo upload toggles, accent color)

## Project structure
```
src/
├── components/     # AppShell pieces, QuizCard, QuestionCard, Timer, QuestionNavigator,
│                   #   ResultCard, Modal, Toast, Skeleton, EmptyState, ThemeToggle, guards
├── pages/
│   ├── auth/       # SignIn (role selector), SignUp (students only)
│   ├── user/       # Dashboard, Library, QuizDetail, QuizAttempt, Result, AnswerReview,
│   │               #   Results, Leaderboard, Certificates, Profile, Settings
│   └── admin/      # Dashboard, QuizManagement, QuizEditor, QuestionBank, QuestionEditor,
│                   #   UserManagement, AdminProfile, SystemSettings
├── layouts/        # AppShell (responsive sidebar + mobile bottom tabs), UserLayout, AdminLayout
├── data/           # mock users.js, quizzes.js, questions.js
├── context/        # AuthContext, ThemeContext, ToastContext
└── utils/          # storage.js (DATA-ACCESS LAYER), quizEngine.js, scoreCalculator.js, image.js
```

## Architecture notes
- **`utils/storage.js` is the single data-access layer.** Nothing reads/writes `localStorage` directly outside it. To move to a real backend, replace the bodies of these functions (and remove `seed()`) with `fetch()` calls — no component changes required.
- **Attached attempt snapshots** — each attempt stores its own question snapshot (with randomization/shuffling applied), so reviews remain stable and results are independent of later quiz edits.
- **Theme** — colors are CSS variables in `src/index.css`; the `dark` class on `<html>` flips them. Components reference tokens (e.g. `bg-bg`, `text-text`, `bg-card`) rather than hardcoded hex values.
- **Demo attempt data** is seeded so leaderboards and admin charts are populated on first run (`createAttempts` in `storage.js`).

## Known limitations
- Admin "Preview" of a quiz navigates to the student quiz page, which is guarded for Student role; admins are redirected to the admin dashboard (role-based guarding). In production this would be a shared read-only preview route.
- Photos are stored as compressed data-URLs in LocalStorage (fine for demo; a production backend would use object storage).