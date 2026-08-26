import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UsersRound,
  Plus,
  Edit2,
  Trash2,
  UserPlus,
  BookOpen,
  Award,
  TrendingUp,
  Search,
  CheckCircle,
  Users,
  Save,
  X,
} from 'lucide-react';
import { certificationApi } from '../../api/certificationApi.js';
import { adminApi } from '../../api/adminApi.js';
import { quizApi } from '../../api/quizApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Modal, ConfirmModal } from '../../components/Modal.jsx';
import { CardSkeleton } from '../../components/Skeleton.jsx';
import EmptyState from '../../components/EmptyState.jsx';

export default function StudentGroups() {
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Group Create/Edit Modal
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', studentIds: [], quizIds: [] });

  // Manage Students Modal
  const [manageStudentsGroup, setManageStudentsGroup] = useState(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  // Manage Quizzes Modal
  const [manageQuizzesGroup, setManageQuizzesGroup] = useState(null);
  const [selectedQuizIds, setSelectedQuizIds] = useState([]);

  // Delete Group
  const [deleteGroup, setDeleteGroup] = useState(null);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [grpRes, studRes, quizRes] = await Promise.all([
        certificationApi.getGroups().catch(() => []),
        adminApi.getUsers({ limit: 100 }).catch(() => ({ items: [] })),
        (quizApi.listQuizzes || quizApi.getQuizzes)({ limit: 100 }).catch(() => ({ items: [] })),
      ]);
      setGroups(grpRes || []);
      setStudents(studRes?.items || []);
      setQuizzes(quizRes?.items || []);
    } catch (err) {
      toast.error('Failed to load student groups: ' + err.message);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAllData();
  }, []);

  const openCreateModal = () => {
    setEditingGroup(null);
    setFormData({ name: '', description: '', studentIds: [], quizIds: [] });
    setGroupModalOpen(true);
  };

  const openEditModal = (g) => {
    setEditingGroup(g);
    setFormData({
      name: g.name,
      description: g.description || '',
      studentIds: (g.students || []).map((s) => s._id || s.id || s),
      quizIds: (g.assignedQuizzes || []).map((q) => q._id || q.id || q),
    });
    setGroupModalOpen(true);
  };

  const handleSaveGroup = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingGroup) {
        await certificationApi.updateGroup(editingGroup.id, formData);
        toast.success(`Group '${formData.name}' updated.`);
      } else {
        await certificationApi.createGroup(formData);
        toast.success(`Group '${formData.name}' created successfully.`);
      }
      setGroupModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to save group: ' + err.message);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteGroup) return;
    try {
      await certificationApi.deleteGroup(deleteGroup.id);
      toast.success(`Group '${deleteGroup.name}' deleted.`);
      setDeleteGroup(null);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to delete group: ' + err.message);
    }
  };

  const handleSaveGroupStudents = async () => {
    if (!manageStudentsGroup) return;
    try {
      await certificationApi.updateGroup(manageStudentsGroup.id, {
        studentIds: selectedStudentIds,
      });
      toast.success(`Updated student roster for '${manageStudentsGroup.name}'.`);
      setManageStudentsGroup(null);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to update student roster: ' + err.message);
    }
  };

  const handleSaveGroupQuizzes = async () => {
    if (!manageQuizzesGroup) return;
    try {
      await certificationApi.updateGroup(manageQuizzesGroup.id, {
        quizIds: selectedQuizIds,
      });
      toast.success(`Updated assigned quizzes for '${manageQuizzesGroup.name}'.`);
      setManageQuizzesGroup(null);
      fetchAllData();
    } catch (err) {
      toast.error('Failed to assign quizzes: ' + err.message);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-2">
            <UsersRound size={14} /> Student Cohorts &amp; Classroom Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text">
            Student Groups &amp; Batches
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Organize candidates into academic cohorts, assign targeted examination tracks, and monitor aggregate performance metrics.
          </p>
        </div>

        <button onClick={openCreateModal} className="btn-primary-grad text-xs h-10 px-4 shadow-sm font-bold">
          <Plus size={15} /> Create Student Group
        </button>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={UsersRound}
          title="No student cohorts created yet"
          description="Create your first student cohort (e.g. Batch 2026, Web Development, Advanced Python) to assign quizzes in bulk."
          action={
            <button onClick={openCreateModal} className="btn-primary-grad">
              <Plus size={14} /> Create Student Group
            </button>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div
              key={g.id}
              className="apple-card group p-6 flex flex-col justify-between gap-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-apple-lg border-2 border-border"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    Cohort Group
                  </span>
                  <span className="text-xs font-bold text-muted flex items-center gap-1">
                    <Users size={13} /> {g.totalStudents} Students
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-text group-hover:text-primary transition-colors">
                    {g.name}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                    {g.description || 'No description provided.'}
                  </p>
                </div>

                {/* Metric Summary Box */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
                  <div className="p-2.5 rounded-xl bg-surface">
                    <span className="text-muted block text-[10px] uppercase font-bold">Average Score</span>
                    <span className="font-black text-sm text-text">{g.avgScore}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface">
                    <span className="text-muted block text-[10px] uppercase font-bold">Pass Rate</span>
                    <span className="font-black text-sm text-success">{g.passRate}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface">
                    <span className="text-muted block text-[10px] uppercase font-bold">Assigned Quizzes</span>
                    <span className="font-black text-sm text-text">{(g.assignedQuizzes || []).length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-surface">
                    <span className="text-muted block text-[10px] uppercase font-bold">Certificates</span>
                    <span className="font-black text-sm text-primary">{g.certificatesEarned}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-border">
                <button
                  onClick={() => {
                    setManageStudentsGroup(g);
                    setSelectedStudentIds((g.students || []).map((s) => s._id || s.id || s));
                  }}
                  className="btn-secondary flex-1 text-xs h-8 font-bold"
                  title="Assign / Remove Students"
                >
                  <UserPlus size={12} /> Students
                </button>
                <button
                  onClick={() => {
                    setManageQuizzesGroup(g);
                    setSelectedQuizIds((g.assignedQuizzes || []).map((q) => q._id || q.id || q));
                  }}
                  className="btn-secondary flex-1 text-xs h-8 font-bold"
                  title="Assign Quizzes"
                >
                  <BookOpen size={12} /> Quizzes
                </button>
                <button
                  onClick={() => openEditModal(g)}
                  className="btn-secondary text-xs h-8 px-2.5 font-bold"
                  title="Edit Group"
                >
                  <Edit2 size={12} />
                </button>
                <button
                  onClick={() => setDeleteGroup(g)}
                  className="btn-secondary text-xs h-8 px-2.5 font-bold text-muted hover:text-danger hover:bg-danger/10"
                  title="Delete Group"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Group Modal */}
      {groupModalOpen && (
        <Modal
          open={groupModalOpen}
          onClose={() => setGroupModalOpen(false)}
          title={editingGroup ? `Edit Group: ${editingGroup.name}` : 'Create Student Cohort'}
          size="md"
        >
          <form onSubmit={handleSaveGroup} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-text">Cohort Name *</label>
              <input
                className="input-base text-xs"
                placeholder="e.g. Batch 2026 - Web Development, Python Mastery Cohort..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-text">Description</label>
              <textarea
                className="input-base text-xs h-20"
                placeholder="Group purpose, semester, or academic department..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button type="button" onClick={() => setGroupModalOpen(false)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button type="submit" className="btn-primary-grad text-xs px-4 font-bold">
                <Save size={14} /> Save Group
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Manage Students in Group Modal */}
      {manageStudentsGroup && (
        <Modal
          open={Boolean(manageStudentsGroup)}
          onClose={() => setManageStudentsGroup(null)}
          title={`Manage Students: ${manageStudentsGroup.name}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Select students to include in this academic cohort ({selectedStudentIds.length} selected):
            </p>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-2">
              {students.map((s) => {
                const isSelected = selectedStudentIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedStudentIds(selectedStudentIds.filter((id) => id !== s.id));
                      } else {
                        setSelectedStudentIds([...selectedStudentIds, s.id]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary text-text font-bold' : 'bg-surface border-border text-muted hover:bg-surface/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-lg bg-primary/15 text-primary font-bold text-xs grid place-items-center">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-text font-bold">{s.name}</p>
                        <span className="text-[10px] text-muted">{s.email}</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded border-border text-primary"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button onClick={() => setManageStudentsGroup(null)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button onClick={handleSaveGroupStudents} className="btn-primary-grad text-xs px-4 font-bold">
                Save Student Roster
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manage Quizzes in Group Modal */}
      {manageQuizzesGroup && (
        <Modal
          open={Boolean(manageQuizzesGroup)}
          onClose={() => setManageQuizzesGroup(null)}
          title={`Assign Examinations: ${manageQuizzesGroup.name}`}
          size="lg"
        >
          <div className="space-y-4 text-xs">
            <p className="text-text-secondary">
              Select examination tracks assigned to this cohort ({selectedQuizIds.length} selected):
            </p>

            <div className="max-h-72 overflow-y-auto space-y-1.5 pr-2">
              {quizzes.map((q) => {
                const isSelected = selectedQuizIds.includes(q.id);
                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedQuizIds(selectedQuizIds.filter((id) => id !== q.id));
                      } else {
                        setSelectedQuizIds([...selectedQuizIds, q.id]);
                      }
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary text-text font-bold' : 'bg-surface border-border text-muted hover:bg-surface/80'
                    }`}
                  >
                    <div>
                      <p className="text-text font-bold">{q.title}</p>
                      <span className="text-[10px] text-muted">{q.category} · {q.difficulty}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded border-border text-primary"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <button onClick={() => setManageQuizzesGroup(null)} className="btn-secondary text-xs px-4">
                Cancel
              </button>
              <button onClick={handleSaveGroupQuizzes} className="btn-primary-grad text-xs px-4 font-bold">
                Save Assigned Examinations
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Group Modal */}
      <ConfirmModal
        open={Boolean(deleteGroup)}
        title={`Delete Group '${deleteGroup?.name}'?`}
        message="Are you sure you want to remove this student group cohort? Students and quizzes in this group will not be deleted."
        confirmText="Delete Group"
        danger={true}
        onConfirm={handleDeleteGroup}
        onClose={() => setDeleteGroup(null)}
      />
    </div>
  );
}
