import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  Download,
  Filter,
  Trash2
} from 'lucide-react';

interface Payment {
  id: string;
  student_id: string;
  amount: number;
  type: string;
  status: string;
  date: string;
}

interface Student {
  id: string;
  full_name: string;
  admission_number: string;
}

export default function FinanceOverview() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState<'payments' | 'fees' | 'expenses'>('payments');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({ type: 'Tuition', status: 'Paid' });

  useEffect(() => {
    fetchClasses();
    fetchFees();
    fetchExpenses();
  }, []);

  const fetchFees = async () => {
    const res = await fetch('/api/fees');
    setFees(await res.json());
  };

  const fetchExpenses = async () => {
    const res = await fetch('/api/expenses');
    setExpenses(await res.json());
  };

  const fetchClasses = async () => {
    const res = await fetch('/api/classes');
    setClasses(await res.json());
  };

  const handleClassChange = async (classId: string) => {
    setSelectedClassId(classId);
    setSelectedStudent(null);
    setPayments([]);
    if (classId) {
      const res = await fetch(`/api/classes/${classId}/students`);
      setStudents(await res.json());
    } else {
      setStudents([]);
    }
  };

  const handleStudentSelect = async (student: Student) => {
    setSelectedStudent(student);
    fetchPayments(student.id);
  };

  const fetchPayments = async (studentId: string) => {
    const res = await fetch(`/api/students/${studentId}/payments`);
    setPayments(await res.json());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, student_id: selectedStudent?.id }),
    });
    if (res.ok) {
      fetchPayments(selectedStudent!.id);
      setIsModalOpen(false);
    }
  };

  const handleDelete = async (id: string, type: 'payment' | 'fee' | 'expense') => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      const endpoint = type === 'payment' ? `/api/payments/${id}` : type === 'fee' ? `/api/fees/${id}` : `/api/expenses/${id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'payment') fetchPayments(selectedStudent!.id);
        if (type === 'fee') fetchFees();
        if (type === 'expense') fetchExpenses();
      }
    } catch (err) {
      console.error('Delete failed');
    }
  };

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpected = 5000; // Mock expected amount
  const balance = totalExpected - totalPaid;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Finance Overview</h1>
          <p className="text-slate-500">Track student payments, tuition fees and school expenses.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['payments', 'fees', 'expenses'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => { setIsModalOpen(true); }} className="btn-primary">
            <Plus size={20} />
            {activeTab === 'payments' ? 'Record Payment' : activeTab === 'fees' ? 'Add Fee' : 'Add Expense'}
          </button>
        </div>
      </div>

      {activeTab === 'payments' ? (
        <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Filters</h3>
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

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {!selectedStudent ? (
            <div className="card h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <Wallet size={40} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">No Student Selected</h2>
              <p className="text-slate-500 max-w-sm">Please select a class and then a student from the sidebar to view their detailed financial records.</p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="card p-6 bg-slate-900 text-white border-none">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Expected</p>
                  <p className="text-2xl font-black">${totalExpected.toLocaleString()}</p>
                </div>
                <div className="card p-6 bg-emerald-600 text-white border-none">
                  <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-2">Total Paid</p>
                  <p className="text-2xl font-black">${totalPaid.toLocaleString()}</p>
                </div>
                <div className="card p-6 bg-rose-600 text-white border-none">
                  <p className="text-xs font-bold text-rose-100 uppercase tracking-widest mb-2">Balance Due</p>
                  <p className="text-2xl font-black">${balance.toLocaleString()}</p>
                </div>
              </div>

              <div className="card overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-900">Payment History</h3>
                  <div className="flex gap-2">
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <Download size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <Filter size={18} />
                    </button>
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                      <th className="px-6 py-4">Receipt #</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic">
                          No payment records found for this student.
                        </td>
                      </tr>
                    ) : payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-xs font-mono text-slate-400 uppercase">#{payment.id.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900">{payment.type}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-black text-slate-900">${payment.amount.toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                            payment.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-500">{new Date(payment.date).toLocaleDateString()}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDelete(payment.id, 'payment')}
                            className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
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
    ) : activeTab === 'fees' ? (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                <th className="px-6 py-4">Fee Name</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Class</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fees.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">No fees defined.</td></tr>
              ) : fees.map((fee) => (
                <tr key={fee.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{fee.name}</td>
                  <td className="px-6 py-4 font-black text-slate-900">${fee.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-500">{fee.class_name || 'All Classes'}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(fee.id, 'fee')}
                      className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No expenses recorded.</td></tr>
              ) : expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-bold text-slate-900">{exp.description}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase">{exp.category}</span></td>
                  <td className="px-6 py-4 font-black text-slate-900">${exp.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-500">{new Date(exp.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(exp.id, 'expense')}
                      className="p-2 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Record Payment Modal */}
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
                <h2 className="text-xl font-black text-slate-900">Record Payment</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Type</label>
                  <select 
                    required className="input-field"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Tuition">Tuition Fee</option>
                    <option value="Library">Library Fee</option>
                    <option value="Exam">Exam Fee</option>
                    <option value="Uniform">Uniform Fee</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Amount ($)</label>
                  <input 
                    type="number" required min="0" className="input-field"
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select 
                    required className="input-field"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Paid">Fully Paid</option>
                    <option value="Partial">Partial Payment</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full mt-4">Record Transaction</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
