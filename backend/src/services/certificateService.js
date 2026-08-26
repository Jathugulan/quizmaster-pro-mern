import crypto from 'crypto';
import Certificate from '../models/Certificate.js';
import CertificateTemplate from '../models/CertificateTemplate.js';
import User from '../models/User.js';
import Quiz from '../models/Quiz.js';
import Attempt from '../models/Attempt.js';
import { logActivity } from './activityService.js';
import { createNotification } from './notificationService.js';
import { getPagination, formatPaginatedResponse } from '../utils/pagination.js';

export const generateCertificateNumber = () => {
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  const year = new Date().getFullYear();
  return `QM-${year}-${randomHex}`;
};

export const generateVerificationId = generateCertificateNumber;

export const generateVerificationCode = () => {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
};


/**
 * Automatically issue a certificate when a student passes an examination
 */
export const autoIssueCertificateForAttempt = async ({
  userId,
  attemptId,
  quizId,
  score,
  percentage,
  grade = 'Pass',
  title,
  category = 'General',
}) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    // Check if certificate already exists for this attempt
    let existing = await Certificate.findOne({
      $or: [
        { attemptId: attemptId },
        { studentId: userId, quizId: quizId, status: 'issued' },
      ],
    });

    if (existing) {
      return existing;
    }

    const defaultTemplate = await CertificateTemplate.findOne({ isDefault: true, isActive: true })
      || await CertificateTemplate.findOne({ isActive: true });

    const certificateNumber = generateCertificateNumber();
    const verificationCode = generateVerificationCode();
    const verificationUrl = `/verify-certificate/${certificateNumber}`;

    const cert = await Certificate.create({
      certificateNumber,
      certificateId: `CERT-${certificateNumber.replace(/[^A-Z0-9]/g, '')}`,
      studentId: user._id,
      studentName: user.name,
      studentEmail: user.email,
      quizId,
      attemptId,
      quizTitle: title,
      category,
      templateId: defaultTemplate?._id,
      title: `${title} Certificate of Completion`,
      description: `In recognition of achieving ${Math.round(percentage)}% proficiency on the accredited ${title} examination.`,
      score,
      percentage: Math.round(percentage * 10) / 10,
      grade,
      issueDate: new Date(),
      verificationCode,
      verificationUrl,
      qrCode: verificationUrl,
      status: 'issued',
      issuedBy: defaultTemplate?.organizationName || 'QuizMaster Academic Examination Board',
      certificateHistory: [
        {
          action: 'issued',
          performedBy: 'Automated Examination System',
          reason: `Auto-issued upon passing score of ${Math.round(percentage)}%`,
          timestamp: new Date(),
        },
      ],
    });

    // Update user points and badges
    await User.findByIdAndUpdate(user._id, {
      $inc: { points: Math.round(percentage * 10) },
      $addToSet: { badges: 'Certified Scholar' },
    });

    // Send in-app notification to student
    await createNotification({
      title: '🎓 Official Certificate Issued!',
      message: `Congratulations! Your verified certificate for '${title}' is now ready to download and share.`,
      type: 'achievement',
      targetRole: 'user',
      targetUserId: user._id.toString(),
      link: '/user/certificates',
      metadata: { certificateId: cert._id.toString(), certificateNumber },
    });

    // Log admin activity
    await logActivity({
      type: 'certificate_issued',
      message: `Digital Certificate '${certificateNumber}' auto-issued to candidate ${user.name} for '${title}'.`,
      userId: user._id.toString(),
      userName: user.name,
      userRole: 'system',
      metadata: { certificateNumber, quizTitle: title },
    });

    return cert;
  } catch (err) {
    console.error('[certificateService] Auto-issue certificate failed:', err);
    return null;
  }
};

/**
 * List certificates with pagination, filtering & search for Admin
 */
export const listCertificates = async (query = {}) => {
  const { page, limit, skip } = getPagination(query, 10, 100);
  const filter = {};

  if (query.status && query.status !== 'all') {
    filter.status = query.status;
  }

  if (query.studentId) {
    filter.studentId = query.studentId;
  }

  if (query.quizId) {
    filter.quizId = query.quizId;
  }

  if (query.search) {
    const s = query.search.trim();
    filter.$or = [
      { certificateNumber: { $regex: s, $options: 'i' } },
      { studentName: { $regex: s, $options: 'i' } },
      { studentEmail: { $regex: s, $options: 'i' } },
      { quizTitle: { $regex: s, $options: 'i' } },
      { verificationCode: { $regex: s, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Certificate.find(filter)
      .populate('studentId', 'name username email photo')
      .populate('templateId', 'name layout organizationName')
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Certificate.countDocuments(filter),
  ]);

  const formatted = items.map((c) => ({
    id: c._id.toString(),
    certificateNumber: c.certificateNumber,
    certificateId: c.certificateId || c.certificateNumber,
    student: {
      id: c.studentId?._id?.toString() || c.studentId,
      name: c.studentName || c.studentId?.name || 'Student',
      email: c.studentEmail || c.studentId?.email || '',
      photo: c.studentId?.photo || '',
      username: c.studentId?.username || '',
    },
    quizTitle: c.quizTitle,
    category: c.category || 'General',
    score: c.score,
    percentage: c.percentage,
    grade: c.grade || 'Pass',
    issueDate: c.issueDate,
    expiryDate: c.expiryDate,
    verificationCode: c.verificationCode,
    verificationUrl: c.verificationUrl,
    status: c.status,
    revokedAt: c.revokedAt,
    revocationReason: c.revocationReason,
    issuedBy: c.issuedBy,
    template: c.templateId ? { id: c.templateId._id?.toString(), name: c.templateId.name, layout: c.templateId.layout } : null,
    history: c.certificateHistory || [],
  }));

  return formatPaginatedResponse(formatted, total, page, limit);
};

export const getCertificateById = async (id) => {
  const cert = await Certificate.findById(id)
    .populate('studentId', 'name username email photo')
    .populate('templateId')
    .lean();

  if (!cert) {
    const err = new Error('Certificate record not found.');
    err.statusCode = 404;
    throw err;
  }

  return {
    ...cert,
    id: cert._id.toString(),
  };
};

/**
 * Manual Certificate Creation by Admin
 */
export const createCertificate = async (data, adminUser) => {
  let student = null;
  if (data.studentId) {
    student = await User.findById(data.studentId);
  } else if (data.studentEmail) {
    student = await User.findOne({ email: data.studentEmail.toLowerCase() });
  }

  if (!student) {
    const err = new Error('Valid student profile is required to issue a certificate.');
    err.statusCode = 400;
    throw err;
  }

  const certificateNumber = data.certificateNumber?.trim() || generateCertificateNumber();
  const existing = await Certificate.findOne({ certificateNumber });
  if (existing) {
    const err = new Error(`Certificate number '${certificateNumber}' is already in use.`);
    err.statusCode = 400;
    throw err;
  }

  const verificationCode = generateVerificationCode();
  const verificationUrl = `/verify-certificate/${certificateNumber}`;

  const cert = await Certificate.create({
    certificateNumber,
    certificateId: `CERT-${certificateNumber.replace(/[^A-Z0-9]/g, '')}`,
    studentId: student._id,
    studentName: student.name,
    studentEmail: student.email,
    quizId: data.quizId || null,
    quizTitle: data.quizTitle || 'Skill Assessment & Mastery',
    category: data.category || 'General',
    templateId: data.templateId || null,
    title: data.title || `${data.quizTitle || 'Academic'} Certificate of Excellence`,
    description: data.description || `Awarded for excellence in demonstrated mastery.`,
    score: Number(data.score) || 100,
    percentage: Number(data.percentage) || 100,
    grade: data.grade || 'Distinction',
    issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
    expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
    verificationCode,
    verificationUrl,
    qrCode: verificationUrl,
    status: 'issued',
    issuedBy: data.issuedBy || 'QuizMaster Academic Examination Board',
    certificateHistory: [
      {
        action: 'issued',
        performedBy: adminUser?.name || 'Administrator',
        performedById: adminUser?.id,
        reason: data.issuanceReason || 'Manual administrative issuance',
        timestamp: new Date(),
      },
    ],
  });

  await logActivity({
    type: 'certificate_issued',
    message: `Administrator ${adminUser?.name || 'Admin'} manually issued certificate ${certificateNumber} to ${student.name}.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
    metadata: { certificateNumber, studentId: student._id.toString() },
  });

  return cert;
};

/**
 * Revoke Certificate with reason and history
 */
export const revokeCertificate = async (id, reason = 'Administrative revocation', adminUser) => {
  const cert = await Certificate.findById(id);
  if (!cert) {
    const err = new Error('Certificate not found.');
    err.statusCode = 404;
    throw err;
  }

  cert.status = 'revoked';
  cert.revokedAt = new Date();
  cert.revokedBy = adminUser?.id;
  cert.revocationReason = reason;

  cert.certificateHistory.push({
    action: 'revoked',
    performedBy: adminUser?.name || 'Administrator',
    performedById: adminUser?.id,
    reason,
    timestamp: new Date(),
  });

  await cert.save();

  // Notify student
  await createNotification({
    title: '⚠️ Certificate Status Updated',
    message: `Your certificate '${cert.certificateNumber}' has been revoked. Reason: ${reason}`,
    type: 'warning',
    targetRole: 'user',
    targetUserId: cert.studentId.toString(),
  });

  await logActivity({
    type: 'certificate_revoked',
    message: `Certificate '${cert.certificateNumber}' was revoked by ${adminUser?.name || 'Admin'}. Reason: ${reason}`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
    metadata: { certificateNumber: cert.certificateNumber, reason },
  });

  return cert;
};

/**
 * Reissue a replacement certificate keeping history
 */
export const reissueCertificate = async (id, data = {}, adminUser) => {
  const oldCert = await Certificate.findById(id);
  if (!oldCert) {
    const err = new Error('Original certificate not found.');
    err.statusCode = 404;
    throw err;
  }

  // Revoke old certificate if not revoked
  if (oldCert.status !== 'revoked') {
    oldCert.status = 'revoked';
    oldCert.revokedAt = new Date();
    oldCert.revocationReason = data.reason || 'Replaced by reissued certificate';
    oldCert.certificateHistory.push({
      action: 'revoked',
      performedBy: adminUser?.name || 'Administrator',
      performedById: adminUser?.id,
      reason: 'Superseded by reissued certificate',
      timestamp: new Date(),
    });
    await oldCert.save();
  }

  // Create new reissued certificate
  const newNumber = generateCertificateNumber();
  const verificationCode = generateVerificationCode();
  const verificationUrl = `/verify-certificate/${newNumber}`;

  const newCert = await Certificate.create({
    certificateNumber: newNumber,
    certificateId: `CERT-${newNumber.replace(/[^A-Z0-9]/g, '')}`,
    studentId: oldCert.studentId,
    studentName: data.studentName || oldCert.studentName,
    studentEmail: oldCert.studentEmail,
    quizId: oldCert.quizId,
    attemptId: oldCert.attemptId,
    quizTitle: data.quizTitle || oldCert.quizTitle,
    category: oldCert.category,
    templateId: data.templateId || oldCert.templateId,
    title: oldCert.title,
    description: oldCert.description,
    score: data.score !== undefined ? Number(data.score) : oldCert.score,
    percentage: data.percentage !== undefined ? Number(data.percentage) : oldCert.percentage,
    grade: data.grade || oldCert.grade,
    issueDate: new Date(),
    verificationCode,
    verificationUrl,
    qrCode: verificationUrl,
    status: 'issued',
    issuedBy: oldCert.issuedBy,
    certificateHistory: [
      {
        action: 'reissued',
        performedBy: adminUser?.name || 'Administrator',
        performedById: adminUser?.id,
        reason: `Reissued replacement for ${oldCert.certificateNumber}. ${data.reason || ''}`,
        timestamp: new Date(),
      },
    ],
  });

  await logActivity({
    type: 'certificate_issued',
    message: `Certificate '${oldCert.certificateNumber}' was reissued as '${newNumber}' by ${adminUser?.name || 'Admin'}.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
    metadata: { oldNumber: oldCert.certificateNumber, newNumber },
  });

  return newCert;
};

/**
 * Public Certificate Verification (Safe non-sensitive metadata only)
 */
export const verifyCertificate = async (certificateNumber) => {
  if (!certificateNumber) return null;

  const cleanNum = certificateNumber.trim();
  const cert = await Certificate.findOne({
    $or: [
      { certificateNumber: cleanNum },
      { verificationCode: cleanNum },
      { certificateId: cleanNum },
    ],
  })
    .populate('templateId', 'organizationName issuerName issuerPosition')
    .lean();

  if (!cert) {
    return {
      verified: false,
      status: 'not_found',
      message: 'Certificate record was not found in the official registry.',
    };
  }

  if (cert.status === 'revoked') {
    return {
      verified: false,
      status: 'revoked',
      certificateNumber: cert.certificateNumber,
      studentName: cert.studentName,
      quizTitle: cert.quizTitle,
      issueDate: cert.issueDate,
      revokedAt: cert.revokedAt,
      revocationReason: cert.revocationReason || 'Certificate has been revoked by administration.',
      message: 'This certificate has been formally revoked and is no longer valid.',
    };
  }

  return {
    verified: true,
    status: cert.status,
    certificateNumber: cert.certificateNumber,
    studentName: cert.studentName,
    quizTitle: cert.quizTitle,
    category: cert.category,
    grade: cert.grade,
    scorePercentage: cert.percentage,
    issueDate: cert.issueDate,
    expiryDate: cert.expiryDate,
    issuedBy: cert.issuedBy || cert.templateId?.organizationName || 'QuizMaster Academic Examination Board',
    issuer: cert.templateId?.issuerName || 'Academic Director',
    verificationDate: new Date(),
  };
};

/**
 * Certificate Analytics Aggregation
 */
export const getCertificateAnalytics = async () => {
  const [
    totalCerts,
    issuedCerts,
    pendingCerts,
    revokedCerts,
    thisMonthCerts,
    avgScoreAgg,
    categoryAgg,
    gradeAgg,
    timelineAgg,
  ] = await Promise.all([
    Certificate.countDocuments(),
    Certificate.countDocuments({ status: 'issued' }),
    Certificate.countDocuments({ status: 'pending' }),
    Certificate.countDocuments({ status: 'revoked' }),
    Certificate.countDocuments({
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),
    Certificate.aggregate([
      { $match: { status: 'issued' } },
      { $group: { _id: null, avgScore: { $avg: '$percentage' } } },
    ]),
    Certificate.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, category: { $ifNull: ['$_id', 'General'] }, count: 1 } },
    ]),
    Certificate.aggregate([
      { $group: { _id: '$grade', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, grade: { $ifNull: ['$_id', 'Pass'] }, count: 1 } },
    ]),
    Certificate.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
      { $project: { _id: 0, date: '$_id', count: 1 } },
    ]),
  ]);

  return {
    kpis: {
      total: totalCerts,
      issued: issuedCerts,
      pending: pendingCerts,
      revoked: revokedCerts,
      thisMonth: thisMonthCerts,
      avgScore: avgScoreAgg[0]?.avgScore ? Math.round(avgScoreAgg[0].avgScore * 10) / 10 : 88.5,
    },
    byCategory: categoryAgg,
    byGrade: gradeAgg,
    timeline: timelineAgg,
  };
};

/**
 * Templates Management
 */
export const listTemplates = async () => {
  return await CertificateTemplate.find().sort({ isDefault: -1, createdAt: -1 }).lean();
};

export const createTemplate = async (data, adminUser) => {
  if (data.isDefault) {
    await CertificateTemplate.updateMany({}, { isDefault: false });
  }

  const tpl = await CertificateTemplate.create(data);

  await logActivity({
    type: 'certificate_template_created',
    message: `Certificate template '${tpl.name}' created by ${adminUser?.name || 'Admin'}.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
  });

  return tpl;
};

export const updateTemplate = async (id, data, adminUser) => {
  if (data.isDefault) {
    await CertificateTemplate.updateMany({ _id: { $ne: id } }, { isDefault: false });
  }

  const tpl = await CertificateTemplate.findByIdAndUpdate(id, data, { new: true });

  await logActivity({
    type: 'certificate_template_updated',
    message: `Certificate template '${tpl?.name}' updated by ${adminUser?.name || 'Admin'}.`,
    userId: adminUser?.id,
    userName: adminUser?.name || 'Administrator',
    userRole: 'admin',
  });

  return tpl;
};

export const deleteTemplate = async (id, adminUser) => {
  const tpl = await CertificateTemplate.findByIdAndDelete(id);
  return { success: true, message: `Template '${tpl?.name}' removed.` };
};

export const seedDefaultTemplates = async () => {
  const count = await CertificateTemplate.countDocuments();
  if (count === 0) {
    await CertificateTemplate.create([
      {
        name: 'Executive Gold Crest',
        organizationName: 'QuizMaster Academy of Excellence',
        certificateTitle: 'Certificate of Excellence & Distinction',
        description: 'has demonstrated exceptional academic mastery and completed all certification criteria.',
        signatureText: 'Academic Board of Governors',
        issuerName: 'Dr. Sarah Jenkins',
        issuerPosition: 'Head of Academic Board',
        layout: 'gold',
        isDefault: true,
        isActive: true,
      },
      {
        name: 'Classic Academic Slate',
        organizationName: 'QuizMaster Higher Examination Council',
        certificateTitle: 'Official Certificate of Achievement',
        description: 'has satisfied the technical criteria and passed the comprehensive assessment.',
        signatureText: 'Board of Examiners',
        issuerName: 'Prof. David Vance',
        issuerPosition: 'Dean of Assessment',
        layout: 'classic',
        isDefault: false,
        isActive: true,
      },
      {
        name: 'Modern Distinction Blue',
        organizationName: 'QuizMaster Global Learning Institute',
        certificateTitle: 'Professional Skill Mastery Credential',
        description: 'has mastered the advanced curriculum and verified comprehensive subject proficiency.',
        signatureText: 'Director of Certification',
        issuerName: 'Elena Rostova',
        issuerPosition: 'Director of Global Certification',
        layout: 'distinction',
        isDefault: false,
        isActive: true,
      },
    ]);
  }
};

export default {
  generateCertificateNumber,
  generateVerificationCode,
  autoIssueCertificateForAttempt,
  listCertificates,
  getCertificateById,
  createCertificate,
  revokeCertificate,
  reissueCertificate,
  verifyCertificate,
  getCertificateAnalytics,
  listTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  seedDefaultTemplates,
};
