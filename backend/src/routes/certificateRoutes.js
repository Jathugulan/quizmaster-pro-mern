import { Router } from 'express';
import certificateService from '../services/certificateService.js';
import certificateRequestService from '../services/certificateRequestService.js';
import Certificate from '../models/Certificate.js';
import { protect } from '../middleware/authMiddleware.js';
import { sendSuccess } from '../utils/response.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// 1. Public Verification endpoint (accessible by anyone with QR code or serial)
router.get(
  '/verify/:certificateNumber',
  asyncHandler(async (req, res) => {
    const result = await certificateService.verifyCertificate(req.params.certificateNumber);
    if (!result || result.status === 'not_found') {
      return res.status(404).json({
        success: false,
        verified: false,
        status: 'not_found',
        message: 'Certificate not found in official registry.',
      });
    }
    return sendSuccess(res, result, 'Certificate verification details retrieved.');
  })
);

// 2. Candidate: Get my certificates
router.get(
  '/my',
  protect,
  asyncHandler(async (req, res) => {
    const certs = await Certificate.find({ studentId: req.user.userId, status: { $in: ['issued', 'revoked'] } })
      .populate('templateId')
      .sort({ issueDate: -1 })
      .lean();

    return sendSuccess(
      res,
      certs.map((c) => ({
        id: c._id.toString(),
        certificateNumber: c.certificateNumber,
        title: c.title,
        quizTitle: c.quizTitle,
        category: c.category,
        score: c.score,
        percentage: c.percentage,
        grade: c.grade,
        issueDate: c.issueDate,
        status: c.status,
        verificationUrl: c.verificationUrl,
        issuedBy: c.issuedBy,
        template: c.templateId,
      })),
      'Student certificates retrieved.'
    );
  })
);

// 3. Candidate: Request manual certificate
router.post(
  '/request',
  protect,
  asyncHandler(async (req, res) => {
    const request = await certificateRequestService.createRequest(req.body, req.user);
    return sendSuccess(res, request, 'Certificate request submitted successfully.', 201);
  })
);

export default router;
