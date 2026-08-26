import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ScrollText,
  Plus,
  Edit2,
  Trash2,
  Copy,
  CheckCircle,
  Eye,
  ShieldCheck,
  Award,
  Sparkles,
  Save,
} from 'lucide-react';
import { certificationApi } from '../../api/certificationApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ConfirmModal } from '../../components/Modal.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import CertificateDocument from '../../components/CertificateDocument.jsx';

export default function CertificateTemplates() {
  const toast = useToast();

  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [deleteTemplate, setDeleteTemplate] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    organizationName: 'QuizMaster Academy of Excellence',
    certificateTitle: 'Certificate of Excellence',
    description: 'has demonstrated outstanding proficiency and satisfied all official assessment requirements.',
    signatureText: 'QuizMaster Academic Examination Board',
    issuerName: 'Dr. Sarah Jenkins',
    issuerPosition: 'Head of Academic Board & Certification',
    layout: 'gold',
    qrCodeEnabled: true,
    isActive: true,
    isDefault: false,
  });

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await certificationApi.getTemplates();
      setTemplates(res || []);
    } catch (err) {
      toast.error('Failed to load certificate templates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const openCreateModal = () => {
    setEditingTemplate(null);
    setFormData({
      name: 'New Custom Template',
      organizationName: 'QuizMaster Academy of Excellence',
      certificateTitle: 'Certificate of Excellence',
      description: 'has demonstrated outstanding proficiency and satisfied all official assessment requirements.',
      signatureText: 'QuizMaster Academic Examination Board',
      issuerName: 'Dr. Sarah Jenkins',
      issuerPosition: 'Head of Academic Board & Certification',
      layout: 'gold',
      qrCodeEnabled: true,
      isActive: true,
      isDefault: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (t) => {
    setEditingTemplate(t);
    setFormData({
      name: t.name,
      organizationName: t.organizationName || 'QuizMaster Academy',
      certificateTitle: t.certificateTitle || 'Certificate of Excellence',
      description: t.description || '',
      signatureText: t.signatureText || 'QuizMaster Academic Board',
      issuerName: t.issuerName || '',
      issuerPosition: t.issuerPosition || '',
      layout: t.layout || 'gold',
      qrCodeEnabled: t.qrCodeEnabled !== false,
      isActive: t.isActive !== false,
      isDefault: t.isDefault || false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingTemplate) {
        await certificationApi.updateTemplate(editingTemplate._id || editingTemplate.id, formData);
        toast.success(`Template '${formData.name}' updated.`);
      } else {
        await certificationApi.createTemplate(formData);
        toast.success(`Template '${formData.name}' created.`);
      }
      setModalOpen(false);
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to save template: ' + err.message);
    }
  };

  const handleDuplicate = async (t) => {
    try {
      await certificationApi.createTemplate({
        ...t,
        name: `${t.name} (Copy)`,
        isDefault: false,
      });
      toast.success(`Duplicated '${t.name}'.`);
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to duplicate template: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTemplate) return;
    try {
      await certificationApi.deleteTemplate(deleteTemplate._id || deleteTemplate.id);
      toast.success(`Template deleted.`);
      setDeleteTemplate(null);
      fetchTemplates();
    } catch (err) {
      toast.error('Failed to delete template: ' + err.message);
    }
  };

  const previewDocProps = (t) => ({
    studentName: 'Alex Morgan',
    quizTitle: 'Advanced Full-Stack Engineering',
    category: 'Programming',
    percent: 96,
    correct: 10,
    of: 10,
    timeLabel: 'Verified Exam',
    dateLabel: new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }),
    serial: 'QM-2026-PREVIEW',
    difficulty: 'Distinction',
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <ScrollText size={14} /> Typography &amp; Layout Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            Certificate Templates
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Design and customize official digital certificate layouts, logos, authority signatures, and typography.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary-grad text-xs h-10 px-4 shadow-sm font-bold">
          <Plus size={15} /> Create Template
        </button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => (
            <div
              key={t._id || t.id}
              className="apple-card group p-6 flex flex-col justify-between gap-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-apple-lg border-2 border-border"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {t.layout} Layout
                  </span>
                  {t.isDefault && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-500 border border-amber-500/30">
                      ★ Default Template
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-text group-hover:text-primary transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">{t.organizationName}</p>
                </div>

                <div className="p-3 rounded-xl bg-surface text-xs space-y-1 text-muted">
                  <div>
                    Issuer: <strong className="text-text">{t.issuerName || 'Dr. Sarah Jenkins'}</strong>
                  </div>
                  <div>
                    Title: <strong className="text-text">{t.issuerPosition || 'Head of Examination'}</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => setPreviewTemplate(t)}
                  className="btn-secondary flex-1 text-xs h-9 font-bold"
                  title="Preview Template"
                >
                  <Eye size={13} /> Preview
                </button>
                <button
                  onClick={() => openEditModal(t)}
                  className="btn-secondary text-xs h-9 px-3 font-bold"
                  title="Edit Template"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDuplicate(t)}
                  className="btn-secondary text-xs h-9 px-3 font-bold"
                  title="Duplicate Template"
                >
                  <Copy size={13} />
                </button>
                {!t.isDefault && (
                  <button
                    onClick={() => setDeleteTemplate(t)}
                    className="btn-secondary text-xs h-9 px-3 font-bold text-muted hover:text-danger hover:bg-danger/10"
                    title="Delete Template"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Create Template Modal */}
      {modalOpen && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingTemplate ? `Edit Template: ${editingTemplate.name}` : 'Create Certificate Template'}
          size="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-text">Template Name *</label>
                <input
                  className="input-base text-xs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text">Organization Name *</label>
                <input
                  className="input-base text-xs"
                  value={formData.organizationName}
                  onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-text">Certificate Title *</label>
                <input
                  className="input-base text-xs"
                  value={formData.certificateTitle}
                  onChange={(e) => setFormData({ ...formData, certificateTitle: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text">Layout Aesthetic</label>
                <select
                  className="input-base text-xs font-bold cursor-pointer"
                  value={formData.layout}
                  onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                >
                  <option value="gold">Executive Gold Crest</option>
                  <option value="classic">Classic Academic Slate</option>
                  <option value="modern">Modern Cobalt Blue</option>
                  <option value="distinction">Presidential Distinction</option>
                  <option value="minimal">Minimal Modern</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text">Certification Statement Text</label>
              <textarea
                className="input-base text-xs h-16"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-text">Issuer Full Name</label>
                <input
                  className="input-base text-xs"
                  value={formData.issuerName}
                  onChange={(e) => setFormData({ ...formData, issuerName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text">Issuer Official Position</label>
                <input
                  className="input-base text-xs"
                  value={formData.issuerPosition}
                  onChange={(e) => setFormData({ ...formData, issuerPosition: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded border-border text-primary"
                />
                <span className="font-bold text-text">Set as Default Template</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.qrCodeEnabled}
                  onChange={(e) => setFormData({ ...formData, qrCodeEnabled: e.target.checked })}
                  className="rounded border-border text-primary"
                />
                <span className="font-bold text-text">Include Verification QR Code</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button type="submit" className="btn-primary-grad text-xs px-4 font-bold">
                <Save size={14} /> Save Template
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Preview Modal */}
      {previewTemplate && (
        <Modal
          open={Boolean(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
          title={`Template Preview: ${previewTemplate.name}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="w-full">
              <CertificateDocument {...previewDocProps(previewTemplate)} />
            </div>
            <div className="flex justify-end pt-2 border-t border-border">
              <button onClick={() => setPreviewTemplate(null)} className="btn-secondary text-xs px-4">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={Boolean(deleteTemplate)}
        title="Delete Certificate Template?"
        message={`Are you sure you want to delete template '${deleteTemplate?.name}'?`}
        confirmText="Delete Template"
        danger={true}
        onConfirm={handleDelete}
        onClose={() => setDeleteTemplate(null)}
      />
    </div>
  );
}
