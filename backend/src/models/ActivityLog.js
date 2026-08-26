import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'user_registered',
        'user_status_changed',
        'google_login',
        'google_signup',
        'google_account_linked',
        'quiz_created',
        'quiz_updated',
        'quiz_published',
        'quiz_deleted',
        'quiz_completed',
        'question_created',
        'question_updated',
        'question_deleted',
        'system_setting_updated',
        'certificate_issued',
      ],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    userName: {
      type: String,
      default: '',
    },
    userRole: {
      type: String,
      enum: ['user', 'admin', 'system'],
      default: 'user',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
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

activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
