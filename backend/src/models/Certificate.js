import mongoose from 'mongoose';

const certificateHistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ['issued', 'reissued', 'revoked', 'updated', 'verified'],
    },
    performedBy: {
      type: String,
      default: 'System Administrator',
    },
    performedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reason: {
      type: String,
      default: '',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const certificateSchema = new mongoose.Schema(
  {
    certificateNumber: {
      type: String,
      required: [true, 'Certificate number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    certificateId: {
      type: String,
      unique: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
      index: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    studentEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      index: true,
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Attempt',
      index: true,
    },
    quizTitle: {
      type: String,
      required: [true, 'Assessment title is required'],
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CertificateTemplate',
    },
    title: {
      type: String,
      default: 'Certificate of Excellence',
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    score: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      required: true,
    },
    grade: {
      type: String,
      default: 'Pass',
    },
    issueDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiryDate: {
      type: Date,
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    verificationUrl: {
      type: String,
      default: '',
    },
    qrCode: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['issued', 'pending', 'revoked', 'expired'],
      default: 'issued',
      index: true,
    },
    revokedAt: {
      type: Date,
    },
    revokedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    revocationReason: {
      type: String,
      default: '',
    },
    issuedBy: {
      type: String,
      default: 'QuizMaster Academic Examination Board',
    },
    certificateHistory: [certificateHistorySchema],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

certificateSchema.index({ studentId: 1, quizId: 1 });
certificateSchema.index({ status: 1, issueDate: -1 });

const Certificate = mongoose.model('Certificate', certificateSchema);
export default Certificate;
