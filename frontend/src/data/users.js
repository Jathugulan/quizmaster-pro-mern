// ============================================================================
// Mock users / demo credentials.
//
// ⚠️  IMPORTANT: This is DEMO data only.
//   - The Admin account below uses hardcoded plaintext credentials purely so
//     the frontend build can be explored. In production this MUST be replaced
//     by real backend authentication (Node.js/Express + MongoDB) with hashed
//     passwords and server-side sessions.
//   - Users who self-register via the Sign Up page are appended at runtime to
//     this dataset through src/utils/storage.js.
// ============================================================================

// Predefined mock Admin account. Clearly segregated so it is trivial to strip
// out when a real auth backend is introduced.
export const MOCK_ADMIN = {
  id: 'admin-1',
  username: 'admin',
  password: 'admin123', // demo only — never store plaintext in production!
  name: 'Platform Administrator',
  email: 'admin@quizmaster.dev',
  role: 'admin',
  photo: '',
  status: 'active',
  joinedAt: '2026-01-01T00:00:00.000Z',
};

// Seed Users (Student role). Additional users are added at runtime on signup.
// Default passwords are demo-placeholder values; students normally set their
// own via the signup form or profile settings.
export const SEED_USERS = [
  {
    id: 'u-1001',
    username: 'alexmorgan',
    password: 'alex123',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    role: 'user',
    photo: '',
    status: 'active',
    joinedAt: '2026-05-12T09:20:00.000Z',
  },
  {
    id: 'u-1002',
    username: 'priyak',
    password: 'priya123',
    name: 'Priya Kapoor',
    email: 'priya.k@example.com',
    role: 'user',
    photo: '',
    status: 'active',
    joinedAt: '2026-05-18T14:05:00.000Z',
  },
  {
    id: 'u-1003',
    username: 'codethao',
    password: 'thao123',
    name: 'Thao Nguyen',
    email: 'thao.n@example.com',
    role: 'user',
    photo: '',
    status: 'active',
    joinedAt: '2026-06-02T11:45:00.000Z',
  },
  {
    id: 'u-1004',
    username: 'mbelici',
    password: 'belicia123',
    name: 'Belicia Rosa',
    email: 'belicia.r@example.com',
    role: 'user',
    photo: '',
    status: 'blocked',
    joinedAt: '2026-06-21T08:30:00.000Z',
  },
  {
    id: 'u-1005',
    username: 'dfernando',
    password: 'diego123',
    name: 'Diego Fernandez',
    email: 'diego.f@example.com',
    role: 'user',
    photo: '',
    status: 'active',
    joinedAt: '2026-07-08T16:12:00.000Z',
  },
  {
    id: 'u-1006',
    username: 'sarahwells',
    password: 'sarah123',
    name: 'Sarah Wells',
    email: 'sarah.w@example.com',
    role: 'user',
    photo: '',
    status: 'active',
    joinedAt: '2026-07-25T10:55:00.000Z',
  },
];

// Every runtime/registered user starts empty; the platform computes stats from
// the attempts store rather than persisting derived counters.
export const NEW_USER_TEMPLATE = {
  role: 'user',
  photo: '',
  status: 'active',
  joinedAt: null, // set at signup time
};