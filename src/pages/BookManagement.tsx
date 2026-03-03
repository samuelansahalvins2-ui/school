import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, BookOpen, User, Calendar, Trash2, Edit2 } from 'lucide-react';

export default function BookManagement() {
  const [books, setBooks] = useState([]);
  const [borrowRecords, setBorrowRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'books' | 'borrow'>('books');

  useEffect(() => {
    fetchBooks();
    fetchBorrowRecords();
  }, []);

  const fetchBooks = () => {
    fetch('/api/books').then(res => res.json()).then(setBooks).finally(() => setLoading(false));
  };

  const fetchBorrowRecords = () => {
    fetch('/api/borrow-records').then(res => res.json()).then(setBorrowRecords);
  };

  const handleDelete = async (id: string, type: 'book' | 'borrow') => {
    if (!confirm(`Delete this ${type}?`)) return;
    try {
      const endpoint = type === 'book' ? `/api/books/${id}` : `/api/borrow-records/${id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (res.ok) {
        if (type === 'book') fetchBooks();
        if (type === 'borrow') fetchBorrowRecords();
      }
    } catch (err) {
      console.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Library Management</h1>
          <p className="text-slate-500">Manage book inventory and borrowing records.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'books' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Books
            </button>
            <button
              onClick={() => setActiveTab('borrow')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'borrow' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Borrow Records
            </button>
          </div>
          <button className="btn-primary">
            <Plus size={20} />
            {activeTab === 'books' ? 'Add New Book' : 'Issue Book'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Books</p>
              <p className="text-2xl font-black text-slate-900">{books.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <User size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Borrowed</p>
              <p className="text-2xl font-black text-slate-900">12</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-black text-slate-900">3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {activeTab === 'books' ? (
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Search books by title or author..." className="input-field pl-10 bg-white" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">Loading books...</td></tr>
                  ) : books.length === 0 ? (
                    <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No books in inventory.</td></tr>
                  ) : books.map((book: any) => (
                    <tr key={book.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{book.title}</p>
                        <p className="text-xs text-slate-500">by {book.author}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          book.status === 'available' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {book.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-slate-400 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors">
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(book.id, 'book')}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {borrowRecords.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-400">No active borrow records.</td></tr>
                ) : borrowRecords.map((record: any) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-900">{record.student_name}</td>
                    <td className="px-6 py-4 text-slate-600">{record.book_title}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(record.issue_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(record.due_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(record.id, 'borrow')}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
