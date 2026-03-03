import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Settings, 
  Globe, 
  Bell, 
  Shield, 
  Database, 
  Mail, 
  Smartphone, 
  Clock, 
  Save,
  RefreshCw,
  School,
  Calendar,
  Lock,
  Eye,
  CreditCard
} from 'lucide-react';

export default function SystemSettings() {
  const [settings, setSettings] = useState<any>({
    school_name: 'CampusSphere Academy',
    academic_year: '2025-2026',
    current_term: 'First Term',
    timezone: 'UTC+0',
    currency: 'USD',
    enable_notifications: 'true',
    maintenance_mode: 'false',
    backup_frequency: 'Daily'
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Mock save
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  const sections = [
    {
      title: 'General Information',
      icon: School,
      fields: [
        { key: 'school_name', label: 'School Name', type: 'text' },
        { key: 'academic_year', label: 'Academic Year', type: 'text' },
        { key: 'current_term', label: 'Current Term', type: 'select', options: ['First Term', 'Second Term', 'Third Term'] },
      ]
    },
    {
      title: 'Regional & Localization',
      icon: Globe,
      fields: [
        { key: 'timezone', label: 'Timezone', type: 'select', options: ['UTC-5', 'UTC+0', 'UTC+1', 'UTC+8'] },
        { key: 'currency', label: 'Currency', type: 'select', options: ['USD', 'EUR', 'GBP', 'GHS'] },
      ]
    },
    {
      title: 'System Security',
      icon: Shield,
      fields: [
        { key: 'maintenance_mode', label: 'Maintenance Mode', type: 'toggle' },
        { key: 'two_factor', label: 'Force 2FA for Admins', type: 'toggle' },
      ]
    },
    {
      title: 'Data & Backups',
      icon: Database,
      fields: [
        { key: 'backup_frequency', label: 'Auto-Backup Frequency', type: 'select', options: ['Hourly', 'Daily', 'Weekly'] },
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">System Settings</h1>
          <p className="text-slate-500">Configure global school parameters and system behavior.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="space-y-2">
          {sections.map((section, i) => (
            <button
              key={i}
              className={`w-full flex items-center gap-3 p-4 rounded-xl text-sm font-bold transition-all ${
                i === 0 ? 'bg-orange-50 text-primary border border-orange-100' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <section.icon size={18} />
              {section.title}
            </button>
          ))}
          <div className="pt-8 space-y-4">
            <div className="p-4 bg-slate-900 rounded-2xl text-white">
              <div className="flex items-center gap-2 mb-2">
                <Lock size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest">Security Status</span>
              </div>
              <p className="text-xs text-slate-400 mb-4">Your system is currently protected by enterprise-grade encryption.</p>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
                Run Security Audit
              </button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="md:col-span-2 space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card p-8 space-y-6"
            >
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400">
                  <section.icon size={20} />
                </div>
                <h2 className="text-lg font-black text-slate-900">{section.title}</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {section.fields.map((field, j) => (
                  <div key={j} className={field.type === 'toggle' ? 'flex items-center justify-between' : ''}>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{field.label}</label>
                    {field.type === 'text' && (
                      <input 
                        type="text" 
                        value={settings[field.key] || ''} 
                        onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                        className="input-field" 
                      />
                    )}
                    {field.type === 'select' && (
                      <select 
                        value={settings[field.key] || ''} 
                        onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })}
                        className="input-field"
                      >
                        {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    )}
                    {field.type === 'toggle' && (
                      <button 
                        onClick={() => setSettings({ ...settings, [field.key]: settings[field.key] === 'true' ? 'false' : 'true' })}
                        className={`w-12 h-6 rounded-full transition-all relative ${
                          settings[field.key] === 'true' ? 'bg-primary' : 'bg-slate-200'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                          settings[field.key] === 'true' ? 'left-7' : 'left-1'
                        }`} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
