import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    shortDescription: {
      type: String,
      default: '',
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
      trim: true,
    },
    coverImage: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    subject: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    course: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    instructions: {
      type: String,
      default: '',
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Beginner', 'Intermediate', 'Advanced', 'Premium'],
      default: 'Medium',
      index: true,
    },
    durationSeconds: {
      type: Number,
      default: 600,
      min: [60, 'Duration must be at least 60 seconds'],
    },
    timeLimit: {
      type: Number,
      default: 10,
      min: [1, 'Time limit must be at least 1 minute'],
    },
    passingScore: {
      type: Number,
      default: 50,
      min: [0, 'Passing score must be at least 0'],
      max: [100, 'Passing score cannot exceed 100'],
    },
    passingPercentage: {
      type: Number,
      default: 50,
      min: [0, 'Passing percentage must be at least 0'],
      max: [100, 'Passing percentage cannot exceed 100'],
    },
    certificatePercentage: {
      type: Number,
      default: 80,
      min: [0, 'Certificate eligibility percentage must be at least 0'],
      max: [100, 'Certificate eligibility percentage cannot exceed 100'],
    },
    negativeMarking: {
      type: Boolean,
      default: false,
    },
    negativeMarks: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    questionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true,
    },
    settings: {
      randomize: { type: Boolean, default: false },
      shuffleAnswers: { type: Boolean, default: false },
      showExplanations: { type: Boolean, default: true },
      showResult: { type: Boolean, default: true },
      allowReview: { type: Boolean, default: true },
      allowRetake: { type: Boolean, default: true },
      maxAttempts: { type: Number, default: 0 }, // 0 = unlimited
      randomizeQuestions: { type: Boolean, default: false },
      randomizeOptions: { type: Boolean, default: false },
      questionOrder: { type: String, enum: ['admin', 'random'], default: 'admin' },
      negativeMarking: { type: Boolean, default: false },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

quizSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  subject: 'text',
  course: 'text',
  tags: 'text',
});
quizSchema.index({ status: 1, category: 1, subject: 1, course: 1, difficulty: 1 });
quizSchema.index({ createdAt: -1 });

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
