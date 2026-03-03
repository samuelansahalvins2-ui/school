import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  UserCircle, 
  Mail, 
  Phone, 
  Calendar, 
  DollarSign, 
  Trash2, 
  Edit2, 
  X,
  ChefHat,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Users
} from 'lucide-react';

interface Staff {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  category: string;
  employee_id: string;
  joining_date: string;
  salary: number;
}

export default function StaffManagement() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [formData, setFormData] = useState<any>({ category: 'TEACHER', full_name: '', email: '', salary: 0, joining_date: new Date().toISOString().split('T')[0] });

  const categories = [
    { id: 'ALL', label: 'All Staff', icon: Users },
    { id: 'TEACHER', label: 'Teachers', icon: GraduationCap },
    { id: 'COOK', label: 'Kitchen Staff', icon: ChefHat },
    { id: 'SECURITY', label: 'Security', icon: ShieldCheck },
    { id: 'ADMIN', label: 'Administration', icon: Briefcase },
  ];

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await fetch('/api/staff');
      setStaffList(await res.json());
    } catch (err) {
      console.error('Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        // Update existing staff
        await fetch(`/api/staff/${editingStaff.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: formData.category,
            salary: formData.salary,
            joining_date: formData.joining_date
          }),
        });
        // Also update user info if needed, but for simplicity we focus on staff record
      } else {
        // Create new staff via users endpoint
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: formData.full_name,
            email: formData.email,
            role: 'hr', // Default to hr or something appropriate, or add a role selector
            status: 'active',
            // The backend handles staff record creation based on role
          }),
        });
      }
      fetchStaff();
      setIsModalOpen(false);
      setEditingStaff(null);
      setFormData({ category: 'TEACHER', full_name: '', email: '', salary: 0, joining_date: new Date().toISOString().split('T')[0] });
    } catch (err) {
      console.error('Failed to save staff');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchStaff();
    } catch (err) {
      console.error('Failed to delete staff');
    }
  };

  const filteredStaff = activeCategory === 'ALL' 
    ? staffList 
    : staffList.filter(s => s.category === activeCategory);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Staff Management</h1>
          <p className="text-slate-500">Manage all school employees and their roles.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={20} />
          Add Staff Member
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all border ${
              activeCategory === cat.id 
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-primary hover:text-primary'
            }`}
          >
            <cat.icon size={18} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Staff Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStaff.map((staff) => (
          <motion.div
            key={staff.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-6 group hover:shadow-xl transition-all"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-primary transition-colors">
                <UserCircle size={32} />
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={() => {
                    setEditingStaff(staff);
                    setFormData({
                      category: staff.category,
                      full_name: staff.full_name,
                      email: staff.email,
                      salary: staff.salary,
                      joining_date: staff.joining_date
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-slate-300 hover:text-primary transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(staff.user_id)}
                  className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1 mb-6">
              <h3 className="font-black text-slate-900 truncate">{staff.full_name}</h3>
              <p className="text-xs font-bold text-primary uppercase tracking-wider">{staff.category}</p>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{staff.employee_id}</p>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-slate-500">
                <Mail size={14} />
                <span className="text-xs truncate">{staff.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={14} />
                <span className="text-xs">Joined {new Date(staff.joining_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-900 font-bold">
                <DollarSign size={14} className="text-emerald-500" />
                <span className="text-xs">${staff.salary?.toLocaleString()}/mo</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Staff Modal */}
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
                <h2 className="text-xl font-black text-slate-900">
                  {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
                </h2>
                <button onClick={() => {
                  setIsModalOpen(false);
                  setEditingStaff(null);
                }} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select 
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="TEACHER">Teacher</option>
                    <option value="COOK">Cook</option>
                    <option value="SECURITY">Security</option>
                    <option value="ADMIN">Administration</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                {!editingStaff && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                      <input 
                        type="text" 
                        required 
                        className="input-field" 
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                      <input 
                        type="email" 
                        required 
                        className="input-field" 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Salary ($)</label>
                    <input 
                      type="number" 
                      className="input-field" 
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Joining Date</label>
                    <input 
                      type="date" 
                      className="input-field" 
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-4">
                  {editingStaff ? 'Update Employee' : 'Save Employee'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
