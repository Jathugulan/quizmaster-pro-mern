import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { Compass } from 'lucide-react';

// Providers
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Guards
import { HomeRedirect, GuestOnly, UserGuard, AdminGuard } from './components/GuardedRoute.jsx';

// Auth
import SignIn from './pages/auth/SignIn.jsx';
import SignUp from './pages/auth/SignUp.jsx';

// Public Verification Page
import CertificateVerificationPage from './pages/public/CertificateVerificationPage.jsx';

// Layouts
import UserLayout from './layouts/UserLayout.jsx';
import AdminLayout from './layouts/AdminLayout.jsx';

// User pages
import UserDashboard from './pages/user/Dashboard.jsx';
import StudentCategories from './pages/user/StudentCategories.jsx';
import StudentCategoryDetail from './pages/user/StudentCategoryDetail.jsx';
import QuizLibrary from './pages/user/Library.jsx';
import QuizDetail from './pages/user/QuizDetail.jsx';
import QuizAttempt from './pages/user/QuizAttempt.jsx';
import Result from './pages/user/Result.jsx';
import AnswerReview from './pages/user/AnswerReview.jsx';
import MyResults from './pages/user/Results.jsx';
import Leaderboard from './pages/user/Leaderboard.jsx';
import Certificates from './pages/user/Certificates.jsx';
import UserProfile from './pages/user/Profile.jsx';
import UserSettings from './pages/user/Settings.jsx';
import Progress from './pages/user/Progress.jsx';
import Achievements from './pages/user/Achievements.jsx';
import AiAssistant from './pages/user/AiAssistant.jsx';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import QuizManagement from './pages/admin/QuizManagement.jsx';
import QuizEditor from './pages/admin/QuizEditor.jsx';
import QuestionBank from './pages/admin/QuestionBank.jsx';
import QuestionEditor from './pages/admin/QuestionEditor.jsx';
import CategoryManagement from './pages/admin/CategoryManagement.jsx';
import CategoryDetail from './pages/admin/CategoryDetail.jsx';
import CategoryAnalytics from './pages/admin/CategoryAnalytics.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import StudentDetail from './pages/admin/StudentDetail.jsx';
import StudentProgress from './pages/admin/StudentProgress.jsx';
import StudentGroups from './pages/admin/StudentGroups.jsx';
import StudentAchievements from './pages/admin/StudentAchievements.jsx';
import CertificatesManagement from './pages/admin/CertificatesManagement.jsx';
import CertificateCreate from './pages/admin/CertificateCreate.jsx';
import CertificateTemplates from './pages/admin/CertificateTemplates.jsx';
import CertificateRequests from './pages/admin/CertificateRequests.jsx';
import CertificateAnalytics from './pages/admin/CertificateAnalytics.jsx';
import CertificateVerifyAdmin from './pages/admin/CertificateVerifyAdmin.jsx';
import ResultsManagement from './pages/admin/ResultsManagement.jsx';
import ResultDetail from './pages/admin/ResultDetail.jsx';
import AdminLeaderboard from './pages/admin/AdminLeaderboard.jsx';
import AnalyticsView from './pages/admin/AnalyticsView.jsx';
import ReportsManagement from './pages/admin/ReportsManagement.jsx';
import NotificationCenter from './pages/admin/NotificationCenter.jsx';
import ActivityLogs from './pages/admin/ActivityLogs.jsx';
import AdminProfile from './pages/admin/AdminProfile.jsx';
import SystemSettings from './pages/admin/SystemSettings.jsx';
import AIManagement from './pages/admin/AIManagement.jsx';

function NotFound() {
  return (
    <div className="min-h-screen bg-bg grid place-items-center p-6 text-center">
      <div className="space-y-4">
        <div className="grid h-16 w-16 mx-auto place-items-center rounded-2xl bg-primary-soft text-primary">
          <Compass size={30} />
        </div>
        <h1 className="text-3xl font-extrabold">404</h1>
        <p className="text-muted">This page doesn't exist, or has moved.</p>
        <Link to="/" className="btn-primary-grad inline-flex">Go home</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomeRedirect />} />
              <Route path="/login" element={<Navigate to="/auth/signin" replace />} />
              <Route path="/register" element={<Navigate to="/auth/signup" replace />} />

              <Route path="/auth/signin" element={<GuestOnly><SignIn /></GuestOnly>} />
              <Route path="/auth/signup" element={<GuestOnly><SignUp /></GuestOnly>} />

              {/* Public Verifiable Credentials */}
              <Route path="/verify-certificate/:certificateNumber" element={<CertificateVerificationPage />} />
              <Route path="/verify-certificate" element={<CertificateVerificationPage />} />

              {/* Student Portal Routes */}
              <Route path="/user" element={<UserGuard><UserLayout /></UserGuard>}>
                <Route index element={<UserDashboard />} />
                <Route path="categories" element={<StudentCategories />} />
                <Route path="categories/:categoryId" element={<StudentCategoryDetail />} />
                <Route path="library" element={<QuizLibrary />} />
                <Route path="quiz/:quizId" element={<QuizDetail />} />
                <Route path="attempt/:sessionId" element={<QuizAttempt />} />
                <Route path="result/:attemptId" element={<Result />} />
                <Route path="review/:attemptId" element={<AnswerReview />} />
                <Route path="results" element={<MyResults />} />
                <Route path="progress" element={<Progress />} />
                <Route path="leaderboard" element={<Leaderboard />} />
                <Route path="achievements" element={<Achievements />} />
                <Route path="certificates" element={<Certificates />} />
                <Route path="ai-assistant" element={<AiAssistant />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="settings" element={<UserSettings />} />
                <Route path="*" element={<Navigate to="/user" replace />} />
              </Route>

              {/* Admin Console Routes */}
              <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
                <Route index element={<AdminDashboard />} />

                {/* EXAMINATION MANAGEMENT */}
                <Route path="quizzes" element={<QuizManagement />} />
                <Route path="quizzes/create" element={<QuizEditor />} />
                <Route path="quiz/new" element={<QuizEditor />} />
                <Route path="quizzes/:quizId/edit" element={<QuizEditor />} />
                <Route path="quiz/:quizId/edit" element={<QuizEditor />} />
                <Route path="quizzes/:quizId/preview" element={<QuizEditor />} />
                <Route path="quiz/:quizId/preview" element={<QuizEditor />} />

                {/* QUESTION MANAGEMENT */}
                <Route path="questions" element={<QuestionBank />} />
                <Route path="question/new" element={<QuestionEditor />} />
                <Route path="question/:questionId/edit" element={<QuestionEditor />} />

                {/* RESULTS & MARKS */}
                <Route path="results" element={<ResultsManagement />} />
                <Route path="results/:id" element={<ResultDetail />} />

                {/* STUDENT MANAGEMENT */}
                <Route path="users" element={<UserManagement />} />
                <Route path="students" element={<UserManagement />} />
                <Route path="users/:id" element={<StudentDetail />} />
                <Route path="students/:id" element={<StudentDetail />} />
                <Route path="users/:id/progress" element={<StudentProgress />} />
                <Route path="students/:id/progress" element={<StudentProgress />} />
                <Route path="progress" element={<StudentProgress />} />
                <Route path="compare" element={<StudentProgress />} />
                <Route path="student-groups" element={<StudentGroups />} />
                <Route path="student-achievements" element={<StudentAchievements />} />

                {/* CERTIFICATION MANAGEMENT */}
                <Route path="certificates" element={<CertificatesManagement />} />
                <Route path="certificates/create" element={<CertificateCreate />} />
                <Route path="certificate-templates" element={<CertificateTemplates />} />
                <Route path="certificate-verification" element={<CertificateVerifyAdmin />} />
                <Route path="certificate-requests" element={<CertificateRequests />} />
                <Route path="certification-analytics" element={<CertificateAnalytics />} />

                {/* ANALYTICS & SYSTEM */}
                <Route path="leaderboard" element={<AdminLeaderboard />} />
                <Route path="analytics" element={<AnalyticsView />} />
                <Route path="reports" element={<ReportsManagement />} />
                <Route path="notifications" element={<NotificationCenter />} />
                <Route path="activity" element={<ActivityLogs />} />
                <Route path="ai" element={<AIManagement />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="settings" element={<SystemSettings />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}