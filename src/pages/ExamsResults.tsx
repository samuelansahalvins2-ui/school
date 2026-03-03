import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  GraduationCap, 
  FileText, 
  LayoutGrid, 
  User,
  X,
  TrendingUp,
  Award,
  Trash2
} from 'lucide-react';

interface Exam {
  id: string;
  name: string;
  term: string;
  academic_year: string;
}

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
}

interface Result {
  id: string;
  subject_name: string;
  score: number;
  grade: string;
  remarks: string;
}

export default function ExamsResults() {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedExamId, setSelectedExamId] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    fetchExams();
    fetchClasses();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    const res = await fetch('/api/subjects');
    setSubjects(await res.json());
  };

  const fetchExams = async () => {
    const res = await fetch('/api/exams');
    setExams(await res.json());
  };

  const fetchClasses = async () => {
    const res = await fetch('/api/classes');
    setClasses(await res.json());
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudent(null);
    setResults([]);
    if (classId) {
      const res = await fetch(`/api/classes/${classId}/students`);
      setStudents(await res.json());
    } else {
      setStudents([]);
    }
  };

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    if (selectedExamId) {
      fetchResults(student.id, selectedExamId);
    }
  };

  const fetchResults = async (studentId: string, examId: string) => {
    const res = await fetch(`/api/students/${studentId}/results?exam_id=${examId}`);
    setResults(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, student_id: selectedStudent?.id, exam_id: selectedExamId }),
    });
    if (res.ok) {
      fetchResults(selectedStudent!.id, selectedExamId);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    try {
      const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'exams') fetchExams();
        if (type === 'results') fetchResults(selectedStudent!.id, selectedExamId);
      }
    } catch (err) {
      console.error('Delete failed');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Exams & Results</h1>
          <p className="text-slate-500">Manage examinations and student performance records.</p>
        </div>
        <div className="flex gap-3">
          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button onClick={() => { setFormData({}); setIsModalOpen(true); }} className="btn-primary">
              <Plus size={20} />
              Record Result
            </button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Selection Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Filters</h3>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Examination</label>
              <select 
                className="input-field"
                value={selectedExamId}
                onChange={(e) => {
                  setSelectedExamId(e.target.value);
                  if (selectedStudent) fetchResults(selectedStudent.id, e.target.value);
                }}
              >
                <option value="">Select Exam</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.term})</option>
                ))}
              </select>
              {selectedExamId && (user?.role === 'admin') && (
                <button 
                  onClick={() => {
                    handleDelete('exams', selectedExamId);
                    setSelectedExamId('');
                  }}
                  className="mt-2 text-[10px] font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1"
                >
                  <Trash2 size={12} /> Delete Selected Exam
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Class</label>
              <select 
                className="input-field"
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
              >
                <option value="">Select Class</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-4">Students</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {students.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">Select a class to view students</p>
              ) : students.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleStudentSelect(s)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedStudent?.id === s.id 
                      ? 'bg-orange-50 text-primary border border-orange-100' 
                      : 'hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    selectedStudent?.id === s.id ? 'bg-white shadow-sm' : 'bg-slate-100'
                  }`}>
                    {s.full_name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold truncate max-w-[120px]">{s.full_name}</p>
                    <p className="text-[10px] opacity-60 font-mono">{s.admission_number}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Display */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedStudent ? (
            <div className="card h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <LayoutGrid size={40} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">No Student Selected</h2>
              <p className="text-slate-500 max-w-sm">Please select a class and then a student from the sidebar to view their performance results.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="card p-8 bg-slate-900 text-white border-none relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center text-3xl font-black">
                      {selectedStudent.full_name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black mb-1">{selectedStudent.full_name}</h2>
                      <p className="text-slate-400 font-mono text-sm uppercase tracking-widest">{selectedStudent.admission_number}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Average Score</p>
                    <p className="text-4xl font-black text-primary">
                      {results.length > 0 
                        ? (results.reduce((acc, r) => acc + r.score, 0) / results.length).toFixed(1) 
                        : '0.0'}
                    </p>
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              </div>

              <div className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-900">Performance Breakdown</h3>
                  <Award size={20} className="text-primary" />
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Grade</th>
                      <th className="px-6 py-4">Remarks</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                          No results found for the selected exam.
                        </td>
                      </tr>
                    ) : results.map((result) => (
                      <tr key={result.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{result.subject_name}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-black ${result.score >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {result.score}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black uppercase">
                            {result.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-500">{result.remarks}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {(user?.role === 'admin' || user?.role === 'teacher') && (
                            <button 
                              onClick={() => handleDelete('results', result.id)}
                              className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Record Result Modal */}
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
                <h2 className="text-xl font-black text-slate-900">Record Result</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Score (%)</label>
                  <input 
                    type="number" required min="0" max="100" className="input-field"
                    onChange={(e) => setFormData({ ...formData, score: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Remarks</label>
                  <textarea 
                    className="input-field h-24"
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  />
                </div>
                <button type="submit" className="btn-primary w-full mt-4">Save Result</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
