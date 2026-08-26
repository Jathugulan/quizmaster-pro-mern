import mongoose from 'mongoose';

const achievementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Achievement title is required'],
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    icon: {
      type: String,
      default: 'Award',
    },
    badgeColor: {
      type: String,
      default: '#0071e3',
    },
    criteriaType: {
      type: String,
      enum: ['quiz_count', 'score_threshold', 'streak_days', 'perfect_score', 'category_count', 'rank_first', 'custom'],
      default: 'quiz_count',
    },
    criteriaValue: {
      type: Number,
      default: 1,
    },
    points: {
      type: Number,
      default: 50,
    },
    isActive: {
      type: Boolean,
      default: true,
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

const Achievement = mongoose.model('Achievement', achievementSchema);
export default Achievement;
