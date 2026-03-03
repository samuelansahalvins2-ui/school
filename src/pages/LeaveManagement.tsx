import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Filter,
  MoreVertical,
  X,
  User,
  FileText,
  Trash2
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  staff_id: string;
  staff_name: string;
  category: string;
  type: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
}

export default function LeaveManagement() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Vacation',
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/leave-requests');
      setRequests(await res.json());
    } catch (err) {
      console.error('Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/leave-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leave request?')) return;
    try {
      const res = await fetch(`/api/leave-requests/${id}`, { method: 'DELETE' });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error('Delete failed');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Leave Management</h1>
          <p className="text-slate-500">Track and manage staff leave applications and attendance.</p>
        </div>
        {/* HR can also apply for leave themselves or record for others */}
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={20} />
          New Leave Request
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-amber-400">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-black text-slate-900">
                {requests.filter(r => r.status === 'Pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-emerald-400">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approved</p>
              <p className="text-2xl font-black text-slate-900">
                {requests.filter(r => r.status === 'Approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-rose-400">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <XCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rejected</p>
              <p className="text-2xl font-black text-slate-900">
                {requests.filter(r => r.status === 'Rejected').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-900">Recent Applications</h3>
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
              <Filter size={18} />
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
              <th className="px-6 py-4">Staff Member</th>
              <th className="px-6 py-4">Leave Type</th>
              <th className="px-6 py-4">Duration</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">Loading requests...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No leave requests found.</td></tr>
            ) : requests.map((req) => (
              <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-xs font-bold text-slate-500">
                      {req.staff_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{req.staff_name}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{req.category}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-700">{req.type}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Calendar size={14} />
                    <span className="text-xs font-medium">
                      {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(req.status)}`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {req.status === 'Pending' ? (
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleStatusUpdate(req.id, 'Approved')}
                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleStatusUpdate(req.id, 'Rejected')}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleDelete(req.id)}
                        className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Request Modal */}
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
                <h2 className="text-xl font-black text-slate-900">New Leave Request</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Leave Type</label>
                  <select className="input-field">
                    <option value="Vacation">Vacation</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Personal">Personal Leave</option>
                    <option value="Maternity">Maternity/Paternity</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Start Date</label>
                    <input type="date" className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">End Date</label>
                    <input type="date" className="input-field" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
                  <textarea className="input-field h-24" placeholder="Briefly explain the reason for leave..."></textarea>
                </div>
                <button type="submit" className="btn-primary w-full mt-4">Submit Application</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
