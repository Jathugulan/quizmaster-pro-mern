import mongoose from 'mongoose';

const attemptPerQuestionSchema = new mongoose.Schema(
  {
    questionId: String,
    text: String,
    options: [String],
    selected: { type: Number, default: null },
    correctIndex: Number,
    explanation: String,
    outcome: {
      type: String,
      enum: ['correct', 'wrong', 'skipped'],
    },
    gained: Number,
  },
  { _id: false }
);

const attemptResultSchema = new mongoose.Schema(
  {
    maximum: { type: Number, required: true },
    marks: { type: Number, required: true },
    percent: { type: Number, required: true },
    correct: { type: Number, required: true },
    wrong: { type: Number, required: true },
    skipped: { type: Number, required: true },
    perQuestion: [attemptPerQuestionSchema],
    answerCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const certificateSchema = new mongoose.Schema(
  {
    eligible: { type: Boolean, default: false },
    verificationId: { type: String, default: null },
    issuedAt: { type: Date, default: null },
  },
  { _id: false }
);

const attemptSchema = new mongoose.Schema(
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
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
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
    passingScore: {
      type: Number,
      default: 50,
    },
    showExplanations: {
      type: Boolean,
      default: true,
    },
    durationSeconds: {
      type: Number,
      default: 600,
    },
    timeTakenSeconds: {
      type: Number,
      default: 0,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    questionSnapshot: {
      type: Array,
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
    result: {
      type: attemptResultSchema,
      required: true,
    },
    passed: {
      type: Boolean,
      required: true,
      index: true,
    },
    grade: {
      type: String,
      enum: ['A+', 'A', 'B', 'C', 'D', 'F'],
      required: true,
    },
    autoSubmitted: {
      type: Boolean,
      default: false,
    },
    certificate: {
      type: certificateSchema,
      default: () => ({ eligible: false, verificationId: null, issuedAt: null }),
    },
  },
  {
    timestamps: true,
    toJSON: {
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

attemptSchema.index({ userId: 1, submittedAt: -1 });
attemptSchema.index({ quizId: 1, submittedAt: -1 });
attemptSchema.index({ 'certificate.verificationId': 1 }, { sparse: true });

const Attempt = mongoose.model('Attempt', attemptSchema);
export default Attempt;
