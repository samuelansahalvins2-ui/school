import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  School, 
  Layers, 
  X, 
  Edit2,
  ChevronRight,
  User,
  Hash
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

interface Class {
  id: string;
  name: string;
  department_id: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
  department_id: string;
}

interface ClassSubject {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string;
  subject_name: string;
  teacher_name: string;
}

export default function AcademicManagement() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'departments' | 'classes' | 'subjects' | 'assignment'>('departments');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'dept' | 'class' | 'subject' | 'assign'>('dept');
  
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [depts, cls, subs, teachersRes] = await Promise.all([
        fetch('/api/departments').then(r => r.json()),
        fetch('/api/classes').then(r => r.json()),
        fetch('/api/subjects').then(r => r.json()),
        fetch('/api/users').then(r => r.json()).then(users => users.filter((u: any) => u.role === 'admin' || u.role === 'hr')) // Simplified: anyone who can teach
      ]);
      setDepartments(depts);
      setClasses(cls);
      setSubjects(subs);
      setTeachers(teachersRes);
    } catch (err) {
      console.error('Failed to fetch academic data');
    }
  };

  const fetchClassSubjects = async (classId: string) => {
    try {
      const res = await fetch(`/api/classes/${classId}/subjects`);
      const data = await res.json();
      setClassSubjects(data);
    } catch (err) {
      console.error('Failed to fetch class subjects');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = '';
    let method = 'POST';
    
    if (modalType === 'dept') url = '/api/departments';
    if (modalType === 'class') url = '/api/classes';
    if (modalType === 'subject') url = '/api/subjects';
    if (modalType === 'assign') url = `/api/classes/${formData.class_id}/subjects`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchData();
        if (modalType === 'assign') fetchClassSubjects(formData.class_id);
        setIsModalOpen(false);
        setFormData({});
      }
    } catch (err) {
      console.error('Failed to save');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error('Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Academic Management</h1>
          <p className="text-slate-500">Manage departments, classes, subjects and assignments.</p>
        </div>
        <button 
          onClick={() => {
            setModalType(activeTab === 'assignment' ? 'assign' : activeTab === 'departments' ? 'dept' : activeTab === 'classes' ? 'class' : 'subject');
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Add {activeTab.slice(0, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
        {[
          { id: 'departments', label: 'Departments', icon: Layers },
          { id: 'classes', label: 'Classes', icon: School },
          { id: 'subjects', label: 'Subjects', icon: BookOpen },
          { id: 'assignment', label: 'Class Assignments', icon: ChevronRight },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6">
        {activeTab === 'departments' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {departments.map((dept) => (
              <div key={dept.id} className="card p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <Layers size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{dept.name}</h3>
                    <p className="text-xs text-slate-500">Department</p>
                  </div>
                </div>
                <button onClick={() => handleDelete('departments', dept.id)} className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="card p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <School size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{cls.name}</h3>
                    <p className="text-xs text-slate-500">
                      {departments.find(d => d.id === cls.department_id)?.name || 'No Dept'}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete('classes', cls.id)} className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'subjects' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((sub) => (
              <div key={sub.id} className="card p-6 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{sub.name}</h3>
                    <p className="text-xs text-slate-500 font-mono uppercase">{sub.code}</p>
                  </div>
                </div>
                <button onClick={() => handleDelete('subjects', sub.id)} className="p-2 text-slate-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'assignment' && (
          <div className="card overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4">
                <label className="text-sm font-bold text-slate-700">Select Class to View Subjects:</label>
                <select 
                  className="input-field max-w-xs"
                  onChange={(e) => fetchClassSubjects(e.target.value)}
                >
                  <option value="">Choose a class...</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classSubjects.map((cs) => (
                  <tr key={cs.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-900">{cs.subject_name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <p className="text-sm text-slate-600">{cs.teacher_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          handleDelete('class-subjects', cs.id);
                          fetchClassSubjects(cs.class_id);
                        }}
                        className="text-slate-300 hover:text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
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
                <h2 className="text-xl font-black text-slate-900">Add {modalType}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {modalType === 'dept' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Department Name</label>
                    <input 
                      type="text" required className="input-field" 
                      onChange={(e) => setFormData({ name: e.target.value })}
                    />
                  </div>
                )}

                {modalType === 'class' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Class Name</label>
                      <input 
                        type="text" required className="input-field" 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                      <select 
                        required className="input-field"
                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      >
                        <option value="">Select Dept</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                    </div>
                  </>
                )}

                {modalType === 'subject' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Name</label>
                      <input 
                        type="text" required className="input-field" 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subject Code</label>
                      <input 
                        type="text" required className="input-field" 
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      />
                    </div>
                  </>
                )}

                {modalType === 'assign' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Class</label>
                      <select 
                        required className="input-field"
                        onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                      >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                      <select 
                        required className="input-field"
                        onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Teacher</label>
                      <select 
                        required className="input-field"
                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                      </select>
                    </div>
                  </>
                )}

                <button type="submit" className="btn-primary w-full mt-4">Save</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
