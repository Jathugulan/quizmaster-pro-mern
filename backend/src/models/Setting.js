import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    quiz: {
      defaultDurationSeconds: { type: Number, default: 600 },
      defaultPassingScore: { type: Number, default: 50 },
      defaultRandomize: { type: Boolean, default: false },
      defaultShuffleAnswers: { type: Boolean, default: false },
      defaultShowExplanations: { type: Boolean, default: true },
      defaultAllowRetake: { type: Boolean, default: true },
    },
    users: {
      allowRegistration: { type: Boolean, default: true },
      allowPhotoUpload: { type: Boolean, default: true },
    },
    appearance: {
      accent: { type: String, default: '#4F46E5' },
    },
    jwtExpiration: {
      type: String,
      default: '7d',
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
  }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
