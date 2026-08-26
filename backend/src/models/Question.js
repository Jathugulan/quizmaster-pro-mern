import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      index: true,
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
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
    },
    course: {
      type: String,
      default: '',
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Beginner', 'Intermediate', 'Advanced'],
      default: 'Medium',
      index: true,
    },
    type: {
      type: String,
      enum: ['multiple-choice', 'boolean', 'multiple-select'],
      default: 'multiple-choice',
      index: true,
    },
    options: {
      type: [String],
      required: [true, 'Options are required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length >= 2;
        },
        message: 'A question must contain at least 2 options',
      },
    },
    correctIndex: {
      type: Number,
      default: 0,
      validate: {
        validator: function (v) {
          if (this.type === 'multiple-select') return true;
          return Number.isInteger(v) && v >= 0 && v < this.options.length;
        },
        message: 'Correct index must point to a valid option index',
      },
    },
    correctIndices: {
      type: [Number],
      default: [],
    },
    marks: {
      type: Number,
      default: 1,
      min: [0, 'Marks cannot be negative'],
    },
    negativeMarks: {
      type: Number,
      default: 0,
      min: [0, 'Negative marks cannot be negative'],
    },
    explanation: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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

questionSchema.index({ text: 'text', category: 'text', subject: 'text', course: 'text' });
questionSchema.index({ quizId: 1, order: 1 });
questionSchema.index({ category: 1, difficulty: 1, isActive: 1 });

const Question = mongoose.model('Question', questionSchema);
export default Question;
