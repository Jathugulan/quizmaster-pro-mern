import mongoose from 'mongoose';

const certificateTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
    },
    organizationName: {
      type: String,
      default: 'QuizMaster Academy of Excellence',
      trim: true,
    },
    logo: {
      type: String,
      default: '',
    },
    certificateTitle: {
      type: String,
      default: 'Certificate of Excellence',
      trim: true,
    },
    description: {
      type: String,
      default: 'has successfully satisfied all rigorous examination requirements and demonstrated mastery of the designated curriculum.',
    },
    signatureText: {
      type: String,
      default: 'QuizMaster Academic Examination Board',
    },
    issuerName: {
      type: String,
      default: 'Dr. Sarah Jenkins',
    },
    issuerPosition: {
      type: String,
      default: 'Head of Academic Board & Certification',
    },
    layout: {
      type: String,
      enum: ['gold', 'classic', 'modern', 'minimal', 'distinction'],
      default: 'gold',
    },
    qrCodeEnabled: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
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

const CertificateTemplate = mongoose.model('CertificateTemplate', certificateTemplateSchema);
export default CertificateTemplate;
