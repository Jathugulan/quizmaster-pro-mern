import CertificateRequest from '../models/CertificateRequest.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import { createCertificate } from './certificateService.js';
import { createNotification } from './notificationService.js';
import { logActivity } from './activityService.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const listRequests = async (query = {}) => {
  const { page, limit, skip } = getPagination(query, 10, 100);
  const filter = {};

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.studentId) {
    filter.studentId = query.studentId;
  }

  const [items, total] = await Promise.all([
    CertificateRequest.find(filter)
      .populate('studentId', 'name username email photo')
      .populate('quizId', 'title category difficulty')
      .populate('reviewedBy', 'name email')
      .populate('certificateId', 'certificateNumber')
      .sort({ requestDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CertificateRequest.countDocuments(filter),
  ]);

  const formatted = items.map((r) => ({
    id: r._id.toString(),
    student: {
      id: r.studentId?._id?.toString() || r.studentId,
      name: r.studentName || r.studentId?.name || 'Student',
      email: r.studentEmail || r.studentId?.email || '',
      photo: r.studentId?.photo || '',
      username: r.studentId?.username || '',
    },
    quiz: {
      id: r.quizId?._id?.toString() || r.quizId,
      title: r.quizTitle || r.quizId?.title || 'General Assessment',
      category: r.quizId?.category || 'General',
    },
    certificateType: r.certificateType,
    score: r.score,
    percentage: r.percentage,
    requestDate: r.requestDate,
    status: r.status,
    rejectionReason: r.rejectionReason,
    reviewedBy: r.reviewedBy ? r.reviewedBy.name : null,
    reviewedAt: r.reviewedAt,
    certificateNumber: r.certificateId?.certificateNumber,
  }));

  return formatPaginatedResponse(formatted, total, page, limit);
};

export const createRequest = async (data, user) => {
  const req = await CertificateRequest.create({
    studentId: user.id,
    studentName: user.name,
    studentEmail: user.email,
    quizId: data.quizId || null,
    quizTitle: data.quizTitle || 'Skill Examination',
    certificateType: data.certificateType || 'Completion',
    score: data.score || 0,
    percentage: data.percentage || 0,
    requestDate: new Date(),
    status: 'pending',
  });

  await createNotification({
    title: '📜 New Certificate Request Submitted',
    message: `${user.name} submitted a certificate request for '${data.quizTitle || 'Assessment'}'.`,
    type: 'info',
    targetRole: 'admin',
    link: '/admin/certificate-requests',
    metadata: { requestId: req._id.toString() },
  });

  return req;
};

export const approveRequest = async (id, adminUser) => {
  const req = await CertificateRequest.findById(id);
  if (!req) {
    const err = new Error('Certificate request not found.');
    err.statusCode = 404;
    throw err;
  }

  // Issue the certificate
  const cert = await createCertificate(
    {
      studentId: req.studentId,
      studentName: req.studentName,
      studentEmail: req.studentEmail,
      quizId: req.quizId,
      quizTitle: req.quizTitle,
      score: req.score,
      percentage: req.percentage || 85,
      grade: req.percentage >= 90 ? 'Distinction' : req.percentage >= 75 ? 'Merit' : 'Pass',
      issuanceReason: `Approved request #${req._id.toString()}`,
    },
    adminUser
  );

  req.status = 'approved';
  req.reviewedBy = adminUser?.id;
  req.reviewedAt = new Date();
  req.certificateId = cert._id;
  await req.save();

  await createNotification({
    title: '🎉 Certificate Request Approved!',
    message: `Your certificate request for '${req.quizTitle}' has been approved and issued.`,
    type: 'achievement',
    targetRole: 'user',
    targetUserId: req.studentId.toString(),
    link: '/user/certificates',
    metadata: { certificateId: cert._id.toString() },
  });

  return { request: req, certificate: cert };
};

export const rejectRequest = async (id, reason = 'Did not meet certification requirements', adminUser) => {
  const req = await CertificateRequest.findById(id);
  if (!req) {
    const err = new Error('Certificate request not found.');
    err.statusCode = 404;
    throw err;
  }

  req.status = 'rejected';
  req.rejectionReason = reason;
  req.reviewedBy = adminUser?.id;
  req.reviewedAt = new Date();
  await req.save();

  await createNotification({
    title: 'Certificate Request Update',
    message: `Your certificate request for '${req.quizTitle}' could not be approved. Reason: ${reason}`,
    type: 'warning',
    targetRole: 'user',
    targetUserId: req.studentId.toString(),
  });

  return req;
};

export default {
  listRequests,
  createRequest,
  approveRequest,
  rejectRequest,
};
