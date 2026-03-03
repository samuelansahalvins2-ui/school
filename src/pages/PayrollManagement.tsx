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
  DollarSign,
  Calendar,
  User,
  MoreVertical,
  Trash2
} from 'lucide-react';

interface PayrollRecord {
  id: string;
  staff_id: string;
  staff_name: string;
  category: string;
  employee_id: string;
  month: string;
  year: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  net_salary: number;
  status: 'Pending' | 'Paid';
  payment_date: string;
}

export default function PayrollManagement() {
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: new Date().getFullYear().toString(),
    allowances: 0,
    deductions: 0
  });

  useEffect(() => {
    fetchPayroll();
    fetchStaff();
  }, []);

  const fetchPayroll = async () => {
    try {
      const res = await fetch('/api/payroll');
      setPayroll(await res.json());
    } catch (err) {
      console.error('Failed to fetch payroll');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      setStaffList(await res.json());
    } catch (err) {
      console.error('Failed to fetch staff');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/payroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchPayroll();
        setIsModalOpen(false);
        setFormData({
          month: new Date().toLocaleString('default', { month: 'long' }),
          year: new Date().getFullYear().toString(),
          allowances: 0,
          deductions: 0
        });
      }
    } catch (err) {
      console.error('Failed to save payroll');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payroll record?')) return;
    try {
      const res = await fetch(`/api/payroll/${id}`, { method: 'DELETE' });
      if (res.ok) fetchPayroll();
    } catch (err) {
      console.error('Delete failed');
    }
  };

  const totalPayroll = payroll.reduce((acc, p) => acc + p.net_salary, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Payroll Management</h1>
          <p className="text-slate-500">Manage staff salaries, allowances, and deductions.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsModalOpen(true)} className="btn-primary">
            <Plus size={20} />
            Generate Payroll
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="card p-6 bg-slate-900 text-white border-none">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl text-primary">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Monthly Payout</p>
              <p className="text-2xl font-black">${totalPayroll.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Processed</p>
              <p className="text-2xl font-black text-slate-900">
                {payroll.filter(p => p.status === 'Paid').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-black text-slate-900">
                {payroll.filter(p => p.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-900">Payroll Records</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary transition-colors">
              <Download size={18} />
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Period</th>
              <th className="px-6 py-4">Basic</th>
              <th className="px-6 py-4">Net Salary</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading payroll...</td></tr>
            ) : payroll.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No payroll records found.</td></tr>
            ) : payroll.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
                      {p.staff_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{p.staff_name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{p.employee_id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span className="text-xs font-medium">{p.month} {p.year}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-semibold text-slate-700">${p.basic_salary.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-black text-slate-900">${p.net_salary.toLocaleString()}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                    p.status === 'Paid' 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleDelete(p.id)}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                      <Receipt size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Generate Payroll Modal */}
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
                <h2 className="text-xl font-black text-slate-900">Generate Payroll</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Staff Member</label>
                  <select 
                    required 
                    className="input-field"
                    onChange={(e) => {
                      const staff = staffList.find(s => s.id === e.target.value);
                      setFormData({ ...formData, staff_id: e.target.value, basic_salary: staff?.salary || 0 });
                    }}
                  >
                    <option value="">Select Staff...</option>
                    {staffList.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.category})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Month</label>
                    <select 
                      className="input-field"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    >
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Year</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Allowances ($)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={formData.allowances}
                      onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Deductions ($)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={formData.deductions}
                      onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Net Salary:</span>
                    <span className="text-lg font-black text-primary">
                      ${((formData.basic_salary || 0) + (formData.allowances || 0) - (formData.deductions || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-4">Generate Payslip</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
