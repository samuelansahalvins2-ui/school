import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  GraduationCap,
  Wallet,
  BookOpen,
  Bell,
  ShieldCheck,
  HelpCircle,
  RefreshCw,
  ChevronDown,
  Trash2
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const data = [
  { name: 'Jan', revenue: 4000, attendance: 95 },
  { name: 'Feb', revenue: 3000, attendance: 92 },
  { name: 'Mar', revenue: 2000, attendance: 98 },
  { name: 'Apr', revenue: 2780, attendance: 94 },
  { name: 'May', revenue: 1890, attendance: 96 },
  { name: 'Jun', revenue: 2390, attendance: 97 },
];

const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
  <div className="card p-6">
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-orange-50 rounded-xl text-primary">
        <Icon size={24} />
      </div>
      {change && (
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
          trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-semibold mb-1">{title}</h3>
    <p className="text-2xl font-black text-slate-900">{value}</p>
  </div>
);

export default function DashboardOverview() {
  const { user } = useAuth();
  const [wards, setWards] = useState<any[]>([]);
  const [selectedWard, setSelectedWard] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    fetchAnnouncements();
    if (user?.role === 'parent') {
      fetch('/api/my-wards')
        .then(res => res.json())
        .then(data => {
          setWards(data);
          if (data.length > 0) setSelectedWard(data[0]);
        });
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/announcements');
      setAnnouncements(await res.json());
    } catch (err) {
      console.error('Failed to fetch announcements');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAnnouncements();
    } catch (err) {
      console.error('Delete failed');
    }
  };

  const getRoleSpecificStats = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { title: 'Total Students', value: '842', change: '+12%', icon: Users, trend: 'up' },
          { title: 'Total Staff', value: '64', change: '+2%', icon: Users, trend: 'up' },
          { title: 'Total Revenue', value: '$124,500', change: '+8%', icon: Wallet, trend: 'up' },
          { title: 'Attendance Rate', value: '94.2%', change: '+1.5%', icon: CheckCircle2, trend: 'up' },
        ];
      case 'hr':
        return [
          { title: 'Total Staff', value: '64', change: '+2%', icon: Users, trend: 'up' },
          { title: 'Pending Leave', value: '5', change: '-2', icon: Clock, trend: 'down' },
          { title: 'Payroll Summary', value: '$45,000', change: 'Monthly', icon: Wallet, trend: 'up' },
          { title: 'New Hires', value: '3', change: 'This month', icon: Users, trend: 'up' },
        ];
      case 'accountant':
        return [
          { title: 'Total Revenue', value: '$124,500', change: '+8%', icon: Wallet, trend: 'up' },
          { title: 'Outstanding Fees', value: '$12,400', change: '-5%', icon: AlertCircle, trend: 'down' },
          { title: 'Monthly Income', value: '$18,200', change: '+12%', icon: TrendingUp, trend: 'up' },
          { title: 'Total Expenses', value: '$8,400', change: '+2%', icon: Wallet, trend: 'up' },
        ];
      case 'librarian':
        return [
          { title: 'Total Books', value: '4,280', change: '+120', icon: BookOpen, trend: 'up' },
          { title: 'Borrowed Books', value: '156', change: '+12', icon: RefreshCw, trend: 'up' },
          { title: 'Overdue Books', value: '14', change: '-3', icon: AlertCircle, trend: 'down' },
          { title: 'New Arrivals', value: '45', change: 'This month', icon: BookOpen, trend: 'up' },
        ];
      case 'student':
        return [
          { title: 'Current GPA', value: '3.8', change: '+0.2', icon: TrendingUp, trend: 'up' },
          { title: 'Attendance', value: '96%', change: '+1%', icon: CheckCircle2, trend: 'up' },
          { title: 'Assignments', value: '4', change: 'Due soon', icon: Clock, trend: 'up' },
          { title: 'Library Books', value: '2', change: 'Active', icon: BookOpen, trend: 'up' },
        ];
      case 'parent':
        return [
          { title: 'Child Performance', value: 'Excellent', change: 'Top 5%', icon: GraduationCap, trend: 'up' },
          { title: 'Fee Balance', value: '$0.00', change: 'Paid', icon: Wallet, trend: 'up' },
          { title: 'Attendance', value: '98%', change: 'Consistent', icon: CheckCircle2, trend: 'up' },
          { title: 'Notices', value: '3', change: 'Unread', icon: Bell, trend: 'up' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Welcome back, {user?.name}!</h1>
          <p className="text-slate-500">Here's what's happening in CampusSphere today.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {user?.role === 'parent' && wards.length > 1 && (
            <div className="relative">
              <select 
                value={selectedWard?.id}
                onChange={(e) => setSelectedWard(wards.find(w => w.id === e.target.value))}
                className="appearance-none pl-4 pr-10 py-2 bg-white rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                {wards.map(ward => (
                  <option key={ward.id} value={ward.id}>{ward.full_name}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          )}
          
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-600">
            <Clock size={16} className="text-primary" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {user?.role === 'parent' && selectedWard && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 bg-orange-50 border border-orange-100 rounded-2xl"
        >
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary font-black shadow-sm">
            {selectedWard.full_name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Viewing Data For</p>
            <p className="text-lg font-black text-slate-900">{selectedWard.full_name}</p>
            <p className="text-xs text-slate-500 font-medium">{selectedWard.class_name} • {selectedWard.relationship_type}</p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getRoleSpecificStats().map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-slate-900">Revenue & Attendance Trends</h2>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Revenue
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Attendance
                </span>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                  <Area type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={3} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">School Announcements</h2>
            <div className="space-y-6">
              {announcements.length === 0 ? (
                <p className="text-sm text-slate-400 italic text-center py-8">No active announcements.</p>
              ) : announcements.map((item: any, i: number) => (
                <div key={item.id} className="flex gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-orange-50 text-primary`}>
                    <Bell size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        {(user?.role === 'admin' || user?.role === 'hr') && (
                          <button 
                            onClick={() => handleDeleteAnnouncement(item.id)}
                            className="p-1 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Activities</h2>
            <div className="space-y-6">
              {[
                { title: 'New user registered', desc: 'Sarah Johnson joined as a Student', time: '2 hours ago', icon: Users, color: 'bg-blue-50 text-blue-600' },
                { title: 'Fee payment received', desc: 'Payment of $450 from Mark Davis', time: '4 hours ago', icon: Wallet, color: 'bg-emerald-50 text-emerald-600' },
                { title: 'Exam schedule updated', desc: 'Final exams moved to June 15th', time: 'Yesterday', icon: GraduationCap, color: 'bg-purple-50 text-purple-600' },
                { title: 'New book added', desc: 'Advanced Physics Vol. 2', time: '2 days ago', icon: BookOpen, color: 'bg-amber-50 text-amber-600' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="text-sm font-bold text-slate-900">{item.title}</p>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{item.time}</span>
                    </div>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="card p-6 bg-slate-900 text-white border-none relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-lg font-bold mb-2">System Status</h2>
              <p className="text-slate-400 text-sm mb-6">All systems are operational and running smoothly.</p>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2 uppercase tracking-wider text-slate-400">
                    <span>Database Engine</span>
                    <span className="text-emerald-400">99.9%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 w-[99.9%] h-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2 uppercase tracking-wider text-slate-400">
                    <span>Storage Capacity</span>
                    <span className="text-primary">42%</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-primary w-[42%] h-full" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-2 uppercase tracking-wider text-slate-400">
                    <span>Network Latency</span>
                    <span className="text-blue-400">12ms</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-400 w-[85%] h-full" />
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">System Alerts</h2>
            <div className="space-y-4">
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex gap-3">
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-rose-900 mb-0.5">Database Backup Failed</p>
                  <p className="text-[10px] text-rose-700">The scheduled backup for 03:00 AM failed due to storage limits.</p>
                </div>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                <AlertCircle size={18} className="text-amber-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-amber-900 mb-0.5">High CPU Usage</p>
                  <p className="text-[10px] text-amber-700">Server CPU usage exceeded 90% for more than 5 minutes.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Generate Report', icon: TrendingUp },
                { label: 'Send Notice', icon: Bell },
                { label: 'Manage Roles', icon: ShieldCheck },
                { label: 'Support', icon: HelpCircle },
              ].map((action, i) => (
                <button key={i} className="p-4 bg-slate-50 hover:bg-orange-50 hover:text-primary rounded-xl transition-all group">
                  <action.icon size={20} className="text-slate-400 group-hover:text-primary mb-2 mx-auto" />
                  <p className="text-[10px] font-bold text-slate-600 group-hover:text-primary uppercase tracking-wider text-center">{action.label}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
