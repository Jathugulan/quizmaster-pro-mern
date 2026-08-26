import mongoose from 'mongoose';

const sessionQuestionSnapshotSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      default: 'Medium',
    },
    type: {
      type: String,
      default: 'multiple-choice',
    },
    options: {
      type: [String],
      required: true,
    },
    correctIndex: {
      type: Number,
      required: true,
    },
    marks: {
      type: Number,
      default: 1,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    explanation: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      default: 'Medium',
    },
    durationSeconds: {
      type: Number,
      required: true,
    },
    passingScore: {
      type: Number,
      default: 50,
    },
    showExplanations: {
      type: Boolean,
      default: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    questionSnapshot: {
      type: [sessionQuestionSnapshotSchema],
      required: true,
    },
    answers: {
      type: Map,
      of: Number,
      default: {},
    },
    flagged: {
      type: Map,
      of: Boolean,
      default: {},
    },
    currentIndex: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['in-progress', 'submitted'],
      default: 'in-progress',
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        // Convert Map to plain object if needed
        if (ret.answers instanceof Map) {
          ret.answers = Object.fromEntries(ret.answers);
        }
        if (ret.flagged instanceof Map) {
          ret.flagged = Object.fromEntries(ret.flagged);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        ret.id = ret._id ? ret._id.toString() : undefined;
        if (ret.answers instanceof Map) {
          ret.answers = Object.fromEntries(ret.answers);
        }
        if (ret.flagged instanceof Map) {
          ret.flagged = Object.fromEntries(ret.flagged);
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

sessionSchema.index({ userId: 1, quizId: 1, status: 1 });
sessionSchema.index({ expiresAt: 1, status: 1 });

const Session = mongoose.model('Session', sessionSchema);
export default Session;
