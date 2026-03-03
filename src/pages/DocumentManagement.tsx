import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  X,
  Filter,
  MoreVertical,
  Folder,
  File,
  Shield,
  Eye,
  UploadCloud
} from 'lucide-react';

interface Document {
  id: string;
  title: string;
  category: string;
  file_url: string;
  uploader_name: string;
  created_at: string;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Policy',
    file_url: '#'
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      setDocuments(await res.json());
    } catch (err) {
      console.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchDocuments();
        setIsModalOpen(false);
        setFormData({ title: '', category: 'Policy', file_url: '#' });
      }
    } catch (err) {
      console.error('Failed to save document');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) fetchDocuments();
    } catch (err) {
      console.error('Delete failed');
    }
  };

  const categories = ['Policy', 'Contract', 'ID', 'Certificate', 'Report', 'Other'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Document Management</h1>
          <p className="text-slate-500">Securely store and manage school policies, contracts, and staff records.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary">
          <Plus size={20} />
          Upload Document
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {['All Files', 'Policies', 'Contracts', 'Staff Records'].map((folder, i) => (
          <div key={i} className="card p-6 hover:border-primary transition-all cursor-pointer group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${
                i === 0 ? 'bg-orange-50 text-primary' : 'bg-slate-50 text-slate-400 group-hover:bg-orange-50 group-hover:text-primary'
              }`}>
                <Folder size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400">
                {i === 0 ? documents.length : Math.floor(Math.random() * 10)} files
              </span>
            </div>
            <h3 className="font-bold text-slate-900">{folder}</h3>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-black text-slate-900">Recent Uploads</h3>
          <div className="flex gap-2">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search documents..." 
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-primary transition-colors">
              <Filter size={18} />
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 p-6 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-slate-400">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">No documents found.</div>
          ) : documents.map((doc) => (
            <motion.div
              key={doc.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 border border-slate-100 rounded-2xl hover:border-primary/30 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-orange-50 group-hover:text-primary transition-colors">
                  <FileText size={24} />
                </div>
                <div className="flex gap-1">
                  <button className="p-2 text-slate-300 hover:text-primary transition-colors"><Eye size={16} /></button>
                  <button className="p-2 text-slate-300 hover:text-primary transition-colors"><Download size={16} /></button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 truncate">{doc.title}</h4>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-primary tracking-wider">{doc.category}</span>
                  <span className="text-[10px] text-slate-400">{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                <div className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-[8px] font-bold text-slate-500 uppercase">
                  {doc.uploader_name.charAt(0)}
                </div>
                <span className="text-[10px] text-slate-500">Uploaded by {doc.uploader_name}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
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
                <h2 className="text-xl font-black text-slate-900">Upload Document</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Document Title</label>
                  <input 
                    type="text" 
                    required 
                    className="input-field" 
                    placeholder="e.g. 2025 Leave Policy"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                  <select 
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary transition-colors cursor-pointer">
                  <UploadCloud size={32} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOCX, JPG up to 10MB</p>
                </div>
                <button type="submit" className="btn-primary w-full mt-4">Save Document</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
