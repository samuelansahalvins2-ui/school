import React from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Wallet, 
  BookOpen, 
  GraduationCap, 
  Users2,
  Settings,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, path, active }: any) => (
  <Link
    to={path}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
        : 'text-slate-500 hover:bg-orange-50 hover:text-primary'
    }`}
  >
    <Icon size={20} />
    <span className="font-semibold">{label}</span>
  </Link>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getMenuItems = () => {
    const common = [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...common,
          { icon: Users, label: 'User Management', path: '/dashboard/users' },
          { icon: BookOpen, label: 'Academic Management', path: '/dashboard/academics' },
          { icon: GraduationCap, label: 'Exams & Results', path: '/dashboard/exams' },
          { icon: Wallet, label: 'Finance Overview', path: '/dashboard/finance' },
          { icon: UserCog, label: 'Staff Management', path: '/dashboard/staff' },
          { icon: Settings, label: 'System Settings', path: '/dashboard/settings' },
        ];
      case 'hr':
        return [
          ...common,
          { icon: Users, label: 'Staff Directory', path: '/dashboard/staff' },
          { icon: Clock, label: 'Leave Management', path: '/dashboard/leave' },
          { icon: Wallet, label: 'Payroll', path: '/dashboard/payroll' },
          { icon: BookOpen, label: 'Documents', path: '/dashboard/documents' },
        ];
      case 'accountant':
        return [
          ...common,
          { icon: Wallet, label: 'Fees Management', path: '/dashboard/fees' },
          { icon: Wallet, label: 'Payment Records', path: '/dashboard/payments' },
          { icon: Wallet, label: 'Expenses', path: '/dashboard/expenses' },
          { icon: LayoutDashboard, label: 'Financial Reports', path: '/dashboard/reports' },
        ];
      case 'librarian':
        return [
          ...common,
          { icon: BookOpen, label: 'Book Management', path: '/dashboard/books' },
          { icon: RefreshCw, label: 'Borrow & Return', path: '/dashboard/borrowing' },
          { icon: AlertCircle, label: 'Fines', path: '/dashboard/fines' },
          { icon: LayoutDashboard, label: 'Library Reports', path: '/dashboard/library-reports' },
        ];
      case 'student':
        return [
          ...common,
          { icon: BookOpen, label: 'Academics', path: '/dashboard/student-academics' },
          { icon: GraduationCap, label: 'Exams & Results', path: '/dashboard/student-results' },
          { icon: CheckCircle2, label: 'Attendance', path: '/dashboard/student-attendance' },
          { icon: Wallet, label: 'Fees', path: '/dashboard/student-fees' },
          { icon: Bell, label: 'Communication', path: '/dashboard/notices' },
        ];
      case 'parent':
        return [
          ...common,
          { icon: Users2, label: 'Child Profile', path: '/dashboard/child-profile' },
          { icon: BookOpen, label: 'Academics', path: '/dashboard/child-academics' },
          { icon: CheckCircle2, label: 'Attendance', path: '/dashboard/child-attendance' },
          { icon: Wallet, label: 'Fees', path: '/dashboard/child-fees' },
          { icon: Bell, label: 'Communication', path: '/dashboard/notices' },
        ];
      default:
        return common;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 lg:static ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-black text-xl">
              C
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">CampusSphere</span>
          </div>

          <nav className="flex-1 space-y-2">
            {getMenuItems().map((item) => (
              <SidebarItem
                key={item.path}
                {...item}
                active={location.pathname === item.path}
              />
            ))}
          </nav>

          <div className="pt-6 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 group"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-96">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-transparent border-none focus:outline-none text-sm w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-primary transition-colors">
              <Bell size={22} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-white" />
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-900">{user?.name}</p>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-primary font-bold">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
