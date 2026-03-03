import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, Lock, Mail, ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { UserRole } from '../types';

export default function LoginPage() {
  const { role } = useParams<{ role: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleTitle = role ? role.charAt(0).toUpperCase() + role.slice(1) : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password, role as UserRole);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary mb-8 transition-colors group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back to role selection
        </button>

        <div className="card p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-900 mb-2">
              School {roleTitle} Login
            </h1>
            <p className="text-slate-500">Enter your credentials to access your account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-3"
            >
              <ShieldAlert size={18} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="name@school.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <button type="button" className="text-sm font-semibold text-primary hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-lg"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex gap-3">
              <ShieldAlert size={18} className="text-slate-400 shrink-0" />
              <p className="text-xs text-slate-500 leading-relaxed">
                <strong>Security Notice:</strong> This is a secure system. Unauthorized access attempts are logged and monitored. Please ensure you are using a private connection.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
