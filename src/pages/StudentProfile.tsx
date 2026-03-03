import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  UserPlus, 
  Trash2, 
  UserCircle, 
  Mail, 
  Shield, 
  X,
  Plus,
  Link as LinkIcon
} from 'lucide-react';

interface ParentLink {
  link_id: string;
  user_id: string;
  full_name: string;
  email: string;
  relationship_type: string;
}

interface Student {
  id: string;
  full_name: string;
  email: string;
  admission_number: string;
  class_name: string;
}

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [parents, setParents] = useState<ParentLink[]>([]);
  const [availableParents, setAvailableParents] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    parent_id: '',
    relationship_type: 'father'
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [studentRes, parentsRes, allParentsRes] = await Promise.all([
        fetch(`/api/students`), // We'll filter in JS for simplicity or add a specific endpoint
        fetch(`/api/students/${id}/parents`),
        fetch(`/api/parents`)
      ]);

      const students = await studentRes.json();
      const currentStudent = students.find((s: any) => s.id === id);
      setStudent(currentStudent);
      setParents(await parentsRes.json());
      setAvailableParents(await allParentsRes.json());
    } catch (err) {
      console.error('Failed to fetch student data');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignParent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/students/${id}/parents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchData();
        setIsModalOpen(false);
        setFormData({ parent_id: '', relationship_type: 'father' });
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to assign parent');
      }
    } catch (err) {
      console.error('Failed to assign parent');
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to remove this parent link?')) return;
    try {
      await fetch(`/api/parent-student/${linkId}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Failed to remove link');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;
  if (!student) return <div className="p-8 text-center text-slate-500">Student not found.</div>;

  return (
    <div className="space-y-8">
      <button
        onClick={() => navigate('/dashboard/users')}
        className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to User Management
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Student Info Card */}
        <div className="card p-8 space-y-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-primary font-black text-3xl mx-auto mb-4">
              {student.full_name.charAt(0)}
            </div>
            <h1 className="text-2xl font-black text-slate-900">{student.full_name}</h1>
            <p className="text-primary font-bold uppercase tracking-wider text-sm">Student</p>
          </div>

          <div className="space-y-4 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3 text-slate-600">
              <Mail size={18} className="text-slate-400" />
              <span className="text-sm">{student.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <Shield size={18} className="text-slate-400" />
              <span className="text-sm font-bold">Adm: {student.admission_number || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600">
              <UserCircle size={18} className="text-slate-400" />
              <span className="text-sm font-bold">Class: {student.class_name || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Linked Parents Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <LinkIcon size={24} className="text-primary" />
              Linked Parents
            </h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <UserPlus size={20} />
              Assign Parent
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {parents.length === 0 ? (
              <div className="col-span-2 card p-12 text-center text-slate-400 border-dashed">
                No parents linked to this student yet.
              </div>
            ) : parents.map((parent) => (
              <motion.div
                key={parent.link_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 flex items-start justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold">
                    {parent.full_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{parent.full_name}</p>
                    <p className="text-xs text-slate-500 mb-2">{parent.email}</p>
                    <span className="px-2 py-1 bg-orange-50 text-primary border border-orange-100 rounded-full text-[10px] font-black uppercase tracking-wider">
                      {parent.relationship_type}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveLink(parent.link_id)}
                  className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Remove Link"
                >
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Assign Parent Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Assign Parent</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAssignParent} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Select Parent</label>
                  <select
                    required
                    value={formData.parent_id}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Choose a parent...</option>
                    {availableParents.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Relationship Type</label>
                  <select
                    value={formData.relationship_type}
                    onChange={(e) => setFormData({ ...formData, relationship_type: e.target.value })}
                    className="input-field"
                  >
                    <option value="father">Father</option>
                    <option value="mother">Mother</option>
                    <option value="guardian">Guardian</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary flex-1">
                    Link Parent
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
