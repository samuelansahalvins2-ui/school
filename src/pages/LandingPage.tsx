import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  UserCircle, 
  ShieldCheck, 
  UserCog, 
  Wallet, 
  BookOpen, 
  GraduationCap, 
  Users2,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RoleCard = ({ icon: Icon, title, description, onClick }: any) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="card p-6 cursor-pointer group hover:border-primary/50 transition-colors"
  >
    <div className="flex items-start justify-between mb-4">
      <div className="p-3 bg-orange-50 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
        <Icon size={24} />
      </div>
      <ArrowRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
  </motion.div>
);

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-primary rounded-full text-sm font-semibold mb-6"
          >
            <ShieldCheck size={16} />
            Welcome to CampusSphere
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-4"
          >
            Select Your <span className="text-primary">Role</span> to Continue
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-lg max-w-2xl mx-auto"
          >
            Access your personalized dashboard and manage school activities with ease.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Students & Families */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h2 className="text-xl font-bold text-slate-800">Students & Families</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <RoleCard
                icon={GraduationCap}
                title="Student"
                description="View grades, assignments, and school announcements."
                onClick={() => navigate('/login/student')}
              />
              <RoleCard
                icon={Users2}
                title="Parent"
                description="Track child performance, attendance, and fees."
                onClick={() => navigate('/login/parent')}
              />
            </div>
          </section>

          {/* Staff & Administration */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-primary rounded-full" />
              <h2 className="text-xl font-bold text-slate-800">Staff & Administration</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <RoleCard
                icon={ShieldCheck}
                title="Administrator"
                description="Full system control, user management, and analytics."
                onClick={() => navigate('/login/admin')}
              />
              <RoleCard
                icon={UserCog}
                title="HR Staff"
                description="Manage staff records, payroll, and leave approvals."
                onClick={() => navigate('/login/hr')}
              />
              <RoleCard
                icon={Wallet}
                title="Accountant"
                description="Track fees, payment records, and expenses."
                onClick={() => navigate('/login/accountant')}
              />
              <RoleCard
                icon={BookOpen}
                title="Librarian"
                description="Inventory management and book tracking."
                onClick={() => navigate('/login/librarian')}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
