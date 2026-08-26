import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Award,
  ArrowLeft,
  Sparkles,
  Save,
  User,
  BookOpen,
  Calendar,
  ShieldCheck,
  Eye,
  CheckCircle,
} from 'lucide-react';
import { certificationApi } from '../../api/certificationApi.js';
import { adminApi } from '../../api/adminApi.js';
import { quizApi } from '../../api/quizApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import CertificateDocument from '../../components/CertificateDocument.jsx';

export default function CertificateCreate() {
  const navigate = useNavigate();
  const toast = useToast();

  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    studentId: '',
    quizId: '',
    quizTitle: '',
    category: 'General',
    title: 'Certificate of Excellence & Mastery',
    description: 'has demonstrated outstanding proficiency and satisfied all official assessment requirements.',
    score: 95,
    percentage: 95,
    grade: 'Distinction',
    templateId: '',
    issuerName: 'Dr. Sarah Jenkins',
    issuerPosition: 'Head of Academic Board',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    issuanceReason: 'Direct Administrative Certification',
  });

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const [studRes, quizRes, tplRes] = await Promise.all([
          adminApi.getUsers({ limit: 100 }),
          quizApi.listQuizzes({ limit: 100 }),
          certificationApi.getTemplates(),
        ]);

        if (isMounted) {
          const userList = studRes?.items || [];
          const quizList = quizRes?.items || [];
          const tplList = tplRes || [];

          setStudents(userList);
          setQuizzes(quizList);
          setTemplates(tplList);

          if (userList.length > 0) {
            setFormData((prev) => ({
              ...prev,
              studentId: userList[0].id,
            }));
          }
          if (quizList.length > 0) {
            setFormData((prev) => ({
              ...prev,
              quizId: quizList[0].id,
              quizTitle: quizList[0].title,
              category: quizList[0].category || 'General',
            }));
          }
          if (tplList.length > 0) {
            setFormData((prev) => ({
              ...prev,
              templateId: tplList[0]._id || tplList[0].id,
              issuerName: tplList[0].issuerName || prev.issuerName,
              issuerPosition: tplList[0].issuerPosition || prev.issuerPosition,
            }));
          }
        }
      } catch (err) {
        toast.error('Failed to load form dependencies: ' + err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleQuizChange = (quizId) => {
    const q = quizzes.find((item) => item.id === quizId);
    if (q) {
      setFormData((prev) => ({
        ...prev,
        quizId,
        quizTitle: q.title,
        category: q.category || 'General',
        title: `${q.title} Certificate of Excellence`,
      }));
    }
  };

  const selectedStudent = students.find((s) => s.id === formData.studentId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentId) {
      toast.error('Please select a student.');
      return;
    }

    setSubmitting(true);
    try {
      const cert = await certificationApi.createCertificate({
        ...formData,
        studentName: selectedStudent?.name,
        studentEmail: selectedStudent?.email,
      });

      toast.success(`Certificate ${cert?.certificateNumber || ''} created successfully!`);
      navigate('/admin/certificates');
    } catch (err) {
      toast.error('Failed to create certificate: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const previewProps = {
    studentName: selectedStudent?.name || 'Student Name',
    quizTitle: formData.quizTitle || 'Assessment Title',
    category: formData.category || 'General',
    percent: formData.percentage || 100,
    correct: 10,
    of: 10,
    timeLabel: 'Verified Completion',
    dateLabel: formData.issueDate
      ? new Date(formData.issueDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
      : new Date().toLocaleDateString(),
    serial: 'QM-2026-PREVIEW',
    difficulty: 'Accredited',
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header & Back Link */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/admin/certificates"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-text transition-colors"
        >
          <ArrowLeft size={16} /> Back to Certificates
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
        {/* Left Form Column */}
        <form onSubmit={handleSubmit} className="apple-card p-6 sm:p-8 space-y-5 border border-border w-full lg:w-1/2">
          <div className="border-b border-border pb-4">
            <h1 className="text-xl font-black text-text">Issue Digital Certificate</h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Award an official verifiable credential directly to a candidate.
            </p>
          </div>

          {/* Student Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text flex items-center gap-1.5">
              <User size={13} className="text-primary" /> Recipient Student *
            </label>
            <select
              className="input-base text-xs font-bold cursor-pointer"
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              required
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (@{s.username}) — {s.email}
                </option>
              ))}
            </select>
          </div>

          {/* Quiz Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text flex items-center gap-1.5">
              <BookOpen size={13} className="text-primary" /> Associated Examination *
            </label>
            <select
              className="input-base text-xs font-bold cursor-pointer"
              value={formData.quizId}
              onChange={(e) => handleQuizChange(e.target.value)}
              required
            >
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.title} ({q.category})
                </option>
              ))}
            </select>
          </div>

          {/* Certificate Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text">Certificate Title *</label>
            <input
              className="input-base text-xs"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          {/* Score & Grade Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text">Score Percentage (%) *</label>
              <input
                type="number"
                min="0"
                max="100"
                className="input-base text-xs"
                value={formData.percentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    percentage: Number(e.target.value),
                    score: Number(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text">Awarded Grade</label>
              <select
                className="input-base text-xs font-bold cursor-pointer"
                value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
              >
                <option value="Distinction">Distinction (90-100%)</option>
                <option value="Excellent">Excellent (80-89%)</option>
                <option value="Very Good">Very Good (70-79%)</option>
                <option value="Good">Good (60-69%)</option>
                <option value="Pass">Pass (50-59%)</option>
              </select>
            </div>
          </div>

          {/* Template Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-primary" /> Certificate Template Design
            </label>
            <select
              className="input-base text-xs font-bold cursor-pointer"
              value={formData.templateId}
              onChange={(e) => setFormData({ ...formData, templateId: e.target.value })}
            >
              {templates.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.name} ({t.layout} style)
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text flex items-center gap-1">
                <Calendar size={12} /> Issue Date *
              </label>
              <input
                type="date"
                className="input-base text-xs"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text flex items-center gap-1">
                <Calendar size={12} /> Expiry Date (Optional)
              </label>
              <input
                type="date"
                className="input-base text-xs"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
              />
            </div>
          </div>

          {/* Issuance Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-text">Audit Issuance Notes</label>
            <input
              className="input-base text-xs"
              placeholder="e.g. Special recognition, course milestone, competition prize..."
              value={formData.issuanceReason}
              onChange={(e) => setFormData({ ...formData, issuanceReason: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary-grad w-full text-xs h-10 font-bold shadow-md"
          >
            <Save size={14} /> {submitting ? 'Generating Digital Credential…' : 'Generate & Issue Certificate'}
          </button>
        </form>

        {/* Right Live Preview Column */}
        <div className="w-full lg:w-1/2 space-y-3 sticky top-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <Eye size={13} className="text-primary" /> Live Document Preview
            </span>
            <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
              Interactive
            </span>
          </div>

          <div className="apple-card p-4 border border-border shadow-apple-lg overflow-hidden">
            <CertificateDocument {...previewProps} />
          </div>
        </div>
      </div>
    </div>
  );
}
