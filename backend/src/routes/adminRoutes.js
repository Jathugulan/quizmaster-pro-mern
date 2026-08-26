import { Router } from 'express';
import adminController from '../controllers/adminController.js';
import {
  updateUserStatusValidator,
  updateSettingsValidator,
  listUsersValidator,
} from '../validators/adminValidator.js';
import validateRequest from '../middleware/validationMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/roleMiddleware.js';

const router = Router();

// All admin routes strictly require valid Admin authentication
router.use(protect, requireAdmin);

// Dashboard & Analytics
router.get('/dashboard/stats', adminController.getDashboardKPIs);
router.get('/metrics', adminController.getMetrics);
router.get('/analytics', adminController.getAnalyticsDetailed);
router.get('/analytics/ai-insights', adminController.getAiInsights);
router.get('/search', adminController.globalSearch);


// Student Management
router.get('/users', listUsersValidator, validateRequest, adminController.listUsers);
router.get('/students', listUsersValidator, validateRequest, adminController.listUsers);
router.post('/students/bulk-action', adminController.bulkActionStudents);
router.get('/users/compare', adminController.compareStudents);
router.get('/users/:id', adminController.getStudentDetail);
router.get('/students/:id', adminController.getStudentDetail);
router.get('/users/:id/progress', adminController.getStudentProgress);
router.get('/students/:id/progress', adminController.getStudentProgress);
router.get('/users/:id/attempts', adminController.getUserAttempts);
router.get('/students/:id/attempts', adminController.getUserAttempts);
router.get('/students/:id/certificates', adminController.getStudentCertificates);
router.patch('/users/:id/status', updateUserStatusValidator, validateRequest, adminController.updateUserStatus);
router.patch('/students/:id/status', updateUserStatusValidator, validateRequest, adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);
router.delete('/students/:id', adminController.deleteUser);

// Student Groups & Cohorts
router.get('/student-groups', adminController.listStudentGroups);
router.post('/student-groups', adminController.createStudentGroup);
router.put('/student-groups/:id', adminController.updateStudentGroup);
router.delete('/student-groups/:id', adminController.deleteStudentGroup);
router.post('/student-groups/:id/students', adminController.addStudentsToGroup);
router.delete('/student-groups/:id/students/:studentId', adminController.removeStudentFromGroup);
router.post('/student-groups/:id/quizzes', adminController.assignQuizzesToGroup);

// Student Achievements & Gamification
router.get('/achievements', adminController.listAchievements);
router.post('/achievements', adminController.createAchievement);
router.put('/achievements/:id', adminController.updateAchievement);
router.delete('/achievements/:id', adminController.deleteAchievement);
router.post('/achievements/:id/assign', adminController.assignAchievement);

// Digital Certification Management
router.get('/certificates', adminController.listCertificates);
router.get('/certificates/:id', adminController.getCertificateDetail);
router.post('/certificates', adminController.createCertificate);
router.post('/certificates/:id/revoke', adminController.revokeCertificate);
router.post('/certificates/:id/reissue', adminController.reissueCertificate);
router.delete('/certificates/:id', adminController.deleteCertificate);

// Certificate Templates
router.get('/certificate-templates', adminController.listCertificateTemplates);
router.post('/certificate-templates', adminController.createCertificateTemplate);
router.put('/certificate-templates/:id', adminController.updateCertificateTemplate);
router.delete('/certificate-templates/:id', adminController.deleteCertificateTemplate);

// Certificate Requests
router.get('/certificate-requests', adminController.listCertificateRequests);
router.put('/certificate-requests/:id/approve', adminController.approveCertificateRequest);
router.put('/certificate-requests/:id/reject', adminController.rejectCertificateRequest);

// Certificate Analytics
router.get('/certificate-analytics', adminController.getCertificateAnalytics);

// Quiz Marks & Results
router.get('/results', adminController.listResults);
router.get('/results/:id', adminController.getResultDetail);
router.delete('/results/:id', adminController.deleteResult);

// Leaderboard & Reports
router.get('/leaderboard', adminController.getAdminLeaderboard);
router.get('/reports', adminController.getReportsData);

// Notifications & Activity Logs
router.get('/notifications', adminController.getNotifications);
router.patch('/notifications/:id/read', adminController.markNotificationRead);
router.delete('/notifications/:id', adminController.deleteNotification);
router.get('/activity', adminController.getActivityLogs);

// System Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', updateSettingsValidator, validateRequest, adminController.updateSettings);

export default router;

