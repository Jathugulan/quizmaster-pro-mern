import { useState, useEffect } from 'react';
import {
  Medal,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  Trophy,
  Star,
  Flame,
  Target,
  Compass,
  Crown,
  Award,
  Sparkles,
  Users,
  Save,
} from 'lucide-react';
import { certificationApi } from '../../api/certificationApi.js';
import { adminApi } from '../../api/adminApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ConfirmModal } from '../../components/Modal.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';

const ICON_MAP = {
  Trophy,
  Star,
  Flame,
  Target,
  Compass,
  Crown,
  Award,
  Medal,
};

export default function StudentAchievements() {
  const toast = useToast();

  const [achievements, setAchievements] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAch, setEditingAch] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    icon: 'Trophy',
    badgeColor: '#0071e3',
    criteriaType: 'quiz_count',
    criteriaValue: 5,
    points: 50,
    isActive: true,
  });

  // Assign Modal
  const [assignAch, setAssignAch] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Delete Confirmation
  const [deleteAch, setDeleteAch] = useState(null);

  const fetchAchievements = async () => {
    setLoading(true);
    try {
      const [achRes, studRes] = await Promise.all([
        certificationApi.getAchievements(),
        adminApi.getUsers({ limit: 100 }),
      ]);
      setAchievements(achRes || []);
      setStudents(studRes?.items || []);
    } catch (err) {
      toast.error('Failed to load achievements: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const openCreateModal = () => {
    setEditingAch(null);
    setFormData({
      title: '',
      description: '',
      icon: 'Trophy',
      badgeColor: '#0071e3',
      criteriaType: 'quiz_count',
      criteriaValue: 5,
      points: 50,
      isActive: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (ach) => {
    setEditingAch(ach);
    setFormData({
      title: ach.title,
      description: ach.description,
      icon: ach.icon || 'Trophy',
      badgeColor: ach.badgeColor || '#0071e3',
      criteriaType: ach.criteriaType || 'quiz_count',
      criteriaValue: ach.criteriaValue || 1,
      points: ach.points || 50,
      isActive: ach.isActive !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    try {
      if (editingAch) {
        await certificationApi.updateAchievement(editingAch.id, formData);
        toast.success(`Achievement '${formData.title}' updated.`);
      } else {
        await certificationApi.createAchievement(formData);
        toast.success(`Achievement '${formData.title}' created.`);
      }
      setModalOpen(false);
      fetchAchievements();
    } catch (err) {
      toast.error('Failed to save achievement: ' + err.message);
    }
  };

  const handleAssign = async () => {
    if (!assignAch || !selectedStudentId) {
      toast.error('Please select a student.');
      return;
    }
    setAssigning(true);
    try {
      await certificationApi.assignAchievement(assignAch.id, selectedStudentId);
      toast.success(`Badge '${assignAch.title}' awarded!`);
      setAssignAch(null);
      setSelectedStudentId('');
      fetchAchievements();
    } catch (err) {
      toast.error('Failed to assign achievement: ' + err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAch) return;
    try {
      await certificationApi.deleteAchievement(deleteAch.id);
      toast.success(`Achievement deleted.`);
      setDeleteAch(null);
      fetchAchievements();
    } catch (err) {
      toast.error('Failed to delete achievement: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <Medal size={14} /> Student Gamification &amp; Milestones
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            Student Achievements &amp; Badges
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Configure learning milestone badges, point multipliers, reward criteria, and manually award distinctions.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary-grad text-xs h-10 px-4 shadow-sm font-bold">
          <Plus size={15} /> Add Achievement
        </button>
      </div>

      {/* Achievements Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <EmptyState
          icon={Medal}
          title="No achievements found"
          description="Create learning milestone badges to incentivize student examination performance."
          action={
            <button onClick={openCreateModal} className="btn-primary-grad">
              <Plus size={14} /> Add Achievement
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {achievements.map((ach) => {
            const IconComponent = ICON_MAP[ach.icon] || Award;
            return (
              <div
                key={ach.id}
                className="apple-card group p-6 flex flex-col justify-between gap-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-apple-lg border-2 border-border"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div
                      className="h-12 w-12 rounded-2xl flex items-center justify-center shadow-md text-white shrink-0"
                      style={{ backgroundColor: ach.badgeColor || '#0071e3' }}
                    >
                      <IconComponent size={24} />
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                        +{ach.points} Points
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-text group-hover:text-primary transition-colors">
                      {ach.title}
                    </h3>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      {ach.description}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs">
                    <span className="text-muted">Students Earned</span>
                    <span className="font-black text-text flex items-center gap-1">
                      <Users size={13} className="text-primary" /> {ach.earnedCount || 0}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <button
                    onClick={() => {
                      setAssignAch(ach);
                      if (students.length > 0) setSelectedStudentId(students[0].id);
                    }}
                    className="btn-primary-grad flex-1 text-xs h-8 font-bold"
                    title="Award to Student"
                  >
                    <UserCheck size={13} /> Award Badge
                  </button>
                  <button
                    onClick={() => openEditModal(ach)}
                    className="btn-secondary text-xs h-8 px-2.5 font-bold"
                    title="Edit Achievement"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => setDeleteAch(ach)}
                    className="btn-secondary text-xs h-8 px-2.5 font-bold text-muted hover:text-danger hover:bg-danger/10"
                    title="Delete Achievement"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingAch ? `Edit Achievement: ${editingAch.title}` : 'Create Achievement Badge'}
          size="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-text">Badge Title *</label>
              <input
                className="input-base text-xs"
                placeholder="e.g. Master Scholar, Streak Champion..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text">Achievement Description *</label>
              <textarea
                className="input-base text-xs h-16"
                placeholder="Describe how students unlock this badge..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-text">Icon Symbol</label>
                <select
                  className="input-base text-xs font-bold cursor-pointer"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  <option value="Trophy">Trophy (🏆)</option>
                  <option value="Star">Star (⭐)</option>
                  <option value="Flame">Flame (🔥)</option>
                  <option value="Target">Target (🎯)</option>
                  <option value="Compass">Compass (🧭)</option>
                  <option value="Crown">Crown (👑)</option>
                  <option value="Award">Award Ribbon (🎖️)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-text">Awarded Points</label>
                <input
                  type="number"
                  min="0"
                  className="input-base text-xs"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text">Badge Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-8 w-14 rounded-lg cursor-pointer border border-border"
                  value={formData.badgeColor}
                  onChange={(e) => setFormData({ ...formData, badgeColor: e.target.value })}
                />
                <span className="font-mono text-xs text-muted">{formData.badgeColor}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button type="submit" className="btn-primary-grad text-xs px-4 font-bold">
                <Save size={14} /> Save Badge
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Award Badge to Student Modal */}
      {assignAch && (
        <Modal
          open={Boolean(assignAch)}
          onClose={() => setAssignAch(null)}
          title={`Award '${assignAch.title}' Badge`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Select a candidate student to grant this official milestone badge (+{assignAch.points} Points):
            </p>

            <div className="space-y-1">
              <label className="font-bold text-text">Candidate Student *</label>
              <select
                className="input-base text-xs font-bold cursor-pointer"
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} (@{s.username}) — {s.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button onClick={() => setAssignAch(null)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={assigning}
                className="btn-primary-grad text-xs px-4 font-bold"
              >
                {assigning ? 'Awarding…' : 'Award Achievement'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        open={Boolean(deleteAch)}
        title="Delete Achievement?"
        message={`Are you sure you want to delete badge '${deleteAch?.title}'?`}
        confirmText="Delete Badge"
        danger={true}
        onConfirm={handleDelete}
        onClose={() => setDeleteAch(null)}
      />
    </div>
  );
}
