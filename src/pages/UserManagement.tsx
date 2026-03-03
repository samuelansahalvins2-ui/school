import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical, 
  Mail, 
  Shield, 
  CheckCircle2, 
  XCircle,
  RefreshCw,
  X,
  UserCircle
} from 'lucide-react';
import { User, UserRole, UserStatus } from '../types';
import { Link } from 'react-router-dom';

const RoleBadge = ({ role }: { role: UserRole }) => {
  const styles = {
    admin: 'bg-purple-50 text-purple-600 border-purple-100',
    hr: 'bg-blue-50 text-blue-600 border-blue-100',
    accountant: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    librarian: 'bg-amber-50 text-amber-600 border-amber-100',
    student: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    parent: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${styles[role]}`}>
      {role}
    </span>
  );
};

const StatusBadge = ({ status }: { status: UserStatus }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${
    status === 'active' 
      ? 'bg-orange-50 text-primary border-orange-100' 
      : 'bg-slate-50 text-slate-500 border-slate-200'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === 'active' ? 'bg-primary' : 'bg-slate-400'}`} />
    {status}
  </span>
);

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'student' as UserRole,
    status: 'active' as UserStatus,
    ward_id: '',
    relationship_type: 'father'
  });

  useEffect(() => {
    fetchUsers();
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setAllStudents(data);
    } catch (err) {
      console.error('Failed to fetch students');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
    const method = editingUser ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchUsers();
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ 
          full_name: '', 
          email: '', 
          role: 'student', 
          status: 'active',
          ward_id: '',
          relationship_type: 'father'
        });
      }
    } catch (err) {
      console.error('Failed to save user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage all system users and their access roles.</p>
        </div>
        <button 
          onClick={() => {
            setEditingUser(null);
            setFormData({ 
              full_name: '', 
              email: '', 
              role: 'student', 
              status: 'active',
              ward_id: '',
              relationship_type: 'father'
            });
            setIsModalOpen(true);
          }}
          className="btn-primary"
        >
          <Plus size={20} />
          Add New User
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">System ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">No users found.</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.full_name}</p>
                        <p className="text-sm text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">
                      {user.system_id || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setEditingUser(user);
                          setFormData({ 
                            full_name: user.full_name, 
                            email: user.email, 
                            role: user.role, 
                            status: user.status,
                            ward_id: '',
                            relationship_type: 'father'
                          });
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
                        title="Edit User"
                      >
                        <Edit2 size={18} />
                      </button>
                      {user.role === 'student' && (
                        <Link
                          to={`/dashboard/students/${user.id}`}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
                          title="View Student Profile"
                        >
                          <UserCircle size={18} />
                        </Link>
                      )}
                      <button 
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Resend Login Details"
                      >
                        <RefreshCw size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-field"
                      placeholder="john@school.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                      className="input-field"
                    >
                      <option value="admin">Administrator</option>
                      <option value="hr">HR Staff</option>
                      <option value="accountant">Accountant</option>
                      <option value="librarian">Librarian</option>
                      <option value="student">Student</option>
                      <option value="parent">Parent</option>
                    </select>
                  </div>

                  {formData.role === 'parent' && !editingUser && (
                    <div className="col-span-2 space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parent-Child Link</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Select Ward</label>
                          <select
                            value={formData.ward_id}
                            onChange={(e) => setFormData({ ...formData, ward_id: e.target.value })}
                            className="input-field"
                          >
                            <option value="">Choose a student...</option>
                            {allStudents.map((s: any) => (
                              <option key={s.id} value={s.id}>{s.full_name} ({s.admission_number})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Relationship</label>
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
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as UserStatus })}
                      className="input-field"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                  <div className="flex gap-3">
                    <RefreshCw size={18} className="text-primary shrink-0" />
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Auto-Password:</strong> A default password (<code>password123</code>) will be generated. The user will be prompted to change it on their first login.
                    </p>
                  </div>
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
                    {editingUser ? 'Save Changes' : 'Create User'}
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
