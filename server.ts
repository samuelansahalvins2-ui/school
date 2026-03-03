import express from 'express';
import { createServer as createViteServer } from 'vite';
import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new sqlite3('campus_sphere.db');
const JWT_SECRET = process.env.JWT_SECRET || 'campus-sphere-secret-key';

// Initialize Database with all required tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS departments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    department_id TEXT,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS fees (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    amount REAL NOT NULL,
    class_id TEXT,
    FOREIGN KEY(class_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'available'
  );

  CREATE TABLE IF NOT EXISTS borrow_records (
    id TEXT PRIMARY KEY,
    book_id TEXT,
    user_id TEXT,
    borrow_date DATE DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    return_date DATE,
    FOREIGN KEY(book_id) REFERENCES books(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS leave_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    type TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    target_role TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE,
    admission_number TEXT UNIQUE,
    class_id TEXT,
    date_of_birth DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(class_id) REFERENCES classes(id)
  );

  CREATE TABLE IF NOT EXISTS parent_student (
    id TEXT PRIMARY KEY,
    parent_id TEXT,
    student_id TEXT,
    relationship_type TEXT NOT NULL, -- father, mother, guardian
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(parent_id) REFERENCES users(id),
    FOREIGN KEY(student_id) REFERENCES students(id),
    UNIQUE(parent_id, student_id)
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    department_id TEXT,
    FOREIGN KEY(department_id) REFERENCES departments(id)
  );

  CREATE TABLE IF NOT EXISTS class_subjects (
    id TEXT PRIMARY KEY,
    class_id TEXT,
    subject_id TEXT,
    teacher_id TEXT,
    FOREIGN KEY(class_id) REFERENCES classes(id),
    FOREIGN KEY(subject_id) REFERENCES subjects(id),
    FOREIGN KEY(teacher_id) REFERENCES users(id),
    UNIQUE(class_id, subject_id)
  );

  CREATE TABLE IF NOT EXISTS exams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    term TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS results (
    id TEXT PRIMARY KEY,
    exam_id TEXT,
    student_id TEXT,
    subject_id TEXT,
    score NUMBER,
    grade TEXT,
    remarks TEXT,
    FOREIGN KEY(exam_id) REFERENCES exams(id),
    FOREIGN KEY(student_id) REFERENCES students(id),
    FOREIGN KEY(subject_id) REFERENCES subjects(id)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    student_id TEXT,
    amount NUMBER NOT NULL,
    type TEXT NOT NULL, -- Tuition, Library, etc.
    status TEXT NOT NULL, -- Paid, Partial
    date DATE DEFAULT CURRENT_DATE,
    FOREIGN KEY(student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS staff (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE,
    category TEXT NOT NULL, -- Teacher, Cook, Security, Admin, etc.
    employee_id TEXT UNIQUE,
    joining_date DATE,
    salary NUMBER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS leave_requests (
    id TEXT PRIMARY KEY,
    staff_id TEXT,
    type TEXT NOT NULL, -- Sick, Vacation, Personal, etc.
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    approved_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(staff_id) REFERENCES staff(id),
    FOREIGN KEY(approved_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS payroll (
    id TEXT PRIMARY KEY,
    staff_id TEXT,
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    basic_salary NUMBER NOT NULL,
    allowances NUMBER DEFAULT 0,
    deductions NUMBER DEFAULT 0,
    net_salary NUMBER NOT NULL,
    status TEXT DEFAULT 'Pending', -- Pending, Paid
    payment_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(staff_id) REFERENCES staff(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- Policy, Contract, ID, Certificate, etc.
    file_url TEXT,
    uploaded_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(uploaded_by) REFERENCES users(id)
  );
`);

// Ensure created_at exists in tables that might have been created without it
const tablesToFix = ['users', 'exams', 'students', 'announcements', 'leave_requests', 'payroll', 'documents', 'departments', 'classes', 'subjects'];
tablesToFix.forEach(table => {
  try {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP`).run();
  } catch (e) {
    // Column already exists or table doesn't exist yet
  }
});

// Seed initial data
const seed = () => {
  const adminExists = db.prepare('SELECT * FROM users WHERE role = ?').get('admin');
  if (!adminExists) {
    db.prepare('INSERT INTO users (id, full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(crypto.randomUUID(), 'System Admin', 'admin@campussphere.com', 'admin123', 'admin', 'active');
  }

  const parentExists = db.prepare('SELECT * FROM users WHERE email = ?').get('parent@example.com');
  if (!parentExists) {
    const parentId = crypto.randomUUID();
    db.prepare('INSERT INTO users (id, full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(parentId, 'John Doe', 'parent@example.com', 'password123', 'parent', 'active');

    const studentUserId = crypto.randomUUID();
    db.prepare('INSERT INTO users (id, full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)')
      .run(studentUserId, 'Jane Doe', 'student@example.com', 'password123', 'student', 'active');

    const studentId = crypto.randomUUID();
    db.prepare('INSERT INTO students (id, user_id, admission_number) VALUES (?, ?, ?)')
      .run(studentId, studentUserId, 'ADM-001');

    db.prepare('INSERT INTO parent_student (id, parent_id, student_id, relationship_type) VALUES (?, ?, ?, ?)')
      .run(crypto.randomUUID(), parentId, studentId, 'father');
  }

  // Seed some departments if empty
  const deptCount = db.prepare('SELECT count(*) as count FROM departments').get() as any;
  if (deptCount.count === 0) {
    const depts = ['Science', 'Arts', 'Commerce', 'Mathematics'];
    depts.forEach(d => db.prepare('INSERT INTO departments (id, name) VALUES (?, ?)').run(crypto.randomUUID(), d));
  }
};
seed();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const authorize = (roles: string[]) => (req: any, res: any, next: any) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };

  // API Routes
  app.post('/api/auth/login', (req, res) => {
    const { email, password, role } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE email = ? AND role = ?').get(email, role);
    
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.full_name }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.full_name } });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Not logged in' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      res.json({ user: decoded });
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // User Management API
  app.get('/api/users', authenticate, (req, res) => {
    const users = db.prepare(`
      SELECT 
        u.id, u.full_name, u.email, u.role, u.status, u.created_at,
        COALESCE(s.admission_number, st.employee_id) as system_id
      FROM users u
      LEFT JOIN students s ON u.id = s.user_id
      LEFT JOIN staff st ON u.id = st.user_id
    `).all();
    res.json(users);
  });

  // Academic Management
  app.get('/api/departments', authenticate, (req, res) => {
    res.json(db.prepare('SELECT * FROM departments').all());
  });

  app.delete('/api/departments/:id', authenticate, authorize(['admin']), (req, res) => {
    db.prepare('DELETE FROM departments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/classes', authenticate, (req, res) => {
    res.json(db.prepare('SELECT c.*, d.name as department_name FROM classes c LEFT JOIN departments d ON c.department_id = d.id').all());
  });

  app.post('/api/classes', authenticate, authorize(['admin']), (req, res) => {
    const { name, department_id } = req.body;
    db.prepare('INSERT INTO classes (id, name, department_id) VALUES (?, ?, ?)').run(crypto.randomUUID(), name, department_id);
    res.json({ success: true });
  });

  app.delete('/api/classes/:id', authenticate, authorize(['admin']), (req, res) => {
    db.prepare('DELETE FROM classes WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Finance
  app.get('/api/finance/stats', authenticate, authorize(['admin', 'accountant']), (req, res) => {
    const totalRevenue = db.prepare('SELECT SUM(amount) as total FROM payments').get() as any;
    const totalExpenses = db.prepare('SELECT SUM(amount) as total FROM expenses').get() as any;
    res.json({
      revenue: totalRevenue.total || 0,
      expenses: totalExpenses.total || 0,
      balance: (totalRevenue.total || 0) - (totalExpenses.total || 0)
    });
  });

  app.get('/api/payments', authenticate, (req, res) => {
    res.json(db.prepare('SELECT p.*, u.full_name as student_name, f.name as fee_name FROM payments p JOIN users u ON p.student_id = u.id JOIN fees f ON p.fee_id = f.id').all());
  });

  // Library
  app.get('/api/books', authenticate, (req, res) => {
    res.json(db.prepare('SELECT * FROM books').all());
  });

  app.post('/api/books', authenticate, authorize(['admin', 'librarian']), (req, res) => {
    const { title, author, category } = req.body;
    db.prepare('INSERT INTO books (id, title, author, category) VALUES (?, ?, ?, ?)').run(crypto.randomUUID(), title, author, category);
    res.json({ success: true });
  });

  app.delete('/api/books/:id', authenticate, authorize(['admin', 'librarian']), (req, res) => {
    db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Announcements
  app.get('/api/announcements', authenticate, (req, res) => {
    res.json(db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all());
  });

  // Student & Parent Linking API
  app.get('/api/students', authenticate, (req, res) => {
    const students = db.prepare(`
      SELECT s.*, u.full_name, u.email, c.name as class_name 
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      LEFT JOIN classes c ON s.class_id = c.id
    `).all();
    res.json(students);
  });

  app.get('/api/students/:id/parents', authenticate, (req, res) => {
    const parents = db.prepare(`
      SELECT ps.id as link_id, ps.relationship_type, u.id as user_id, u.full_name, u.email 
      FROM parent_student ps 
      JOIN users u ON ps.parent_id = u.id 
      WHERE ps.student_id = ?
    `).all(req.params.id);
    res.json(parents);
  });

  app.post('/api/students/:id/parents', authenticate, authorize(['admin']), (req, res) => {
    const { parent_id, relationship_type } = req.body;
    const student_id = req.params.id;
    try {
      db.prepare('INSERT INTO parent_student (id, parent_id, student_id, relationship_type) VALUES (?, ?, ?, ?)')
        .run(crypto.randomUUID(), parent_id, student_id, relationship_type);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/parent-student/:id', authenticate, authorize(['admin']), (req, res) => {
    db.prepare('DELETE FROM parent_student WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.get('/api/parents', authenticate, (req, res) => {
    const parents = db.prepare("SELECT id, full_name, email FROM users WHERE role = 'parent'").all();
    res.json(parents);
  });

  app.get('/api/my-wards', authenticate, authorize(['parent']), (req: any, res) => {
    const wards = db.prepare(`
      SELECT s.id, u.full_name, c.name as class_name, ps.relationship_type
      FROM parent_student ps
      JOIN students s ON ps.student_id = s.id
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE ps.parent_id = ?
    `).all(req.user.id);
    res.json(wards);
  });

  // Staff API
  app.get('/api/staff', authenticate, (req, res) => {
    const staff = db.prepare(`
      SELECT s.*, u.full_name, u.email 
      FROM staff s 
      JOIN users u ON s.user_id = u.id
    `).all();
    res.json(staff);
  });

  app.put('/api/staff/:id', authenticate, authorize(['admin', 'hr']), (req, res) => {
    const { category, salary, joining_date } = req.body;
    db.prepare('UPDATE staff SET category = ?, salary = ?, joining_date = ? WHERE id = ?')
      .run(category, salary, joining_date, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/staff/:id', authenticate, authorize(['admin', 'hr']), (req, res) => {
    db.prepare('DELETE FROM staff WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Subjects API
  app.get('/api/subjects', authenticate, (req, res) => {
    res.json(db.prepare('SELECT * FROM subjects').all());
  });

  app.post('/api/subjects', authenticate, authorize(['admin']), (req, res) => {
    const { name, code, department_id } = req.body;
    db.prepare('INSERT INTO subjects (id, name, code, department_id) VALUES (?, ?, ?, ?)')
      .run(crypto.randomUUID(), name, code, department_id);
    res.json({ success: true });
  });

  app.delete('/api/subjects/:id', authenticate, authorize(['admin']), (req, res) => {
    db.prepare('DELETE FROM subjects WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Exams API
  app.get('/api/exams', authenticate, (req, res) => {
    res.json(db.prepare('SELECT * FROM exams ORDER BY created_at DESC').all());
  });

  app.post('/api/exams', authenticate, authorize(['admin']), (req, res) => {
    const { name, term, academic_year } = req.body;
    db.prepare('INSERT INTO exams (id, name, term, academic_year) VALUES (?, ?, ?, ?)')
      .run(crypto.randomUUID(), name, term, academic_year);
    res.json({ success: true });
  });

  app.delete('/api/exams/:id', authenticate, authorize(['admin']), (req, res) => {
    db.prepare('DELETE FROM exams WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Results API
  app.get('/api/students/:id/results', authenticate, (req, res) => {
    const { exam_id } = req.query;
    const results = db.prepare(`
      SELECT r.*, s.name as subject_name 
      FROM results r 
      JOIN subjects s ON r.subject_id = s.id 
      WHERE r.student_id = ? AND r.exam_id = ?
    `).all(req.params.id, exam_id);
    res.json(results);
  });

  app.post('/api/results', authenticate, authorize(['admin']), (req, res) => {
    const { exam_id, student_id, subject_id, score, remarks } = req.body;
    const grade = score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';
    db.prepare('INSERT INTO results (id, exam_id, student_id, subject_id, score, grade, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(crypto.randomUUID(), exam_id, student_id, subject_id, score, grade, remarks);
    res.json({ success: true });
  });

  app.delete('/api/results/:id', authenticate, authorize(['admin']), (req, res) => {
    db.prepare('DELETE FROM results WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Payments API
  app.get('/api/students/:id/payments', authenticate, (req, res) => {
    res.json(db.prepare('SELECT * FROM payments WHERE student_id = ? ORDER BY date DESC').all(req.params.id));
  });

  app.post('/api/payments', authenticate, authorize(['admin', 'accountant']), (req, res) => {
    const { student_id, amount, type, status } = req.body;
    db.prepare('INSERT INTO payments (id, student_id, amount, type, status) VALUES (?, ?, ?, ?, ?)')
      .run(crypto.randomUUID(), student_id, amount, type, status);
    res.json({ success: true });
  });

  app.delete('/api/payments/:id', authenticate, authorize(['admin', 'accountant']), (req, res) => {
    db.prepare('DELETE FROM payments WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Class Students API
  app.get('/api/classes/:id/students', authenticate, (req, res) => {
    const students = db.prepare(`
      SELECT s.id, u.full_name, s.admission_number 
      FROM students s 
      JOIN users u ON s.user_id = u.id 
      WHERE s.class_id = ?
    `).all(req.params.id);
    res.json(students);
  });

  // Class Subjects API
  app.get('/api/classes/:id/subjects', authenticate, (req, res) => {
    const subjects = db.prepare(`
      SELECT cs.id, s.name as subject_name, u.full_name as teacher_name 
      FROM class_subjects cs 
      JOIN subjects s ON cs.subject_id = s.id 
      JOIN users u ON cs.teacher_id = u.id 
      WHERE cs.class_id = ?
    `).all(req.params.id);
    res.json(subjects);
  });

  app.post('/api/classes/:id/subjects', authenticate, authorize(['admin']), (req, res) => {
    const { subject_id, teacher_id } = req.body;
    db.prepare('INSERT INTO class_subjects (id, class_id, subject_id, teacher_id) VALUES (?, ?, ?, ?)')
      .run(crypto.randomUUID(), req.params.id, subject_id, teacher_id);
    res.json({ success: true });
  });

  app.delete('/api/class-subjects/:id', authenticate, authorize(['admin']), (req, res) => {
    db.prepare('DELETE FROM class_subjects WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Leave Management API
  app.get('/api/leave-requests', authenticate, authorize(['admin', 'hr']), (req, res) => {
    const requests = db.prepare(`
      SELECT lr.*, u.full_name as staff_name, s.category
      FROM leave_requests lr
      JOIN staff s ON lr.staff_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY lr.created_at DESC
    `).all();
    res.json(requests);
  });

  app.post('/api/leave-requests', authenticate, (req: any, res) => {
    const { type, start_date, end_date, reason } = req.body;
    const staff = db.prepare('SELECT id FROM staff WHERE user_id = ?').get(req.user.id) as any;
    if (!staff) return res.status(400).json({ error: 'Only staff can apply for leave' });
    
    db.prepare('INSERT INTO leave_requests (id, staff_id, type, start_date, end_date, reason) VALUES (?, ?, ?, ?, ?, ?)')
      .run(crypto.randomUUID(), staff.id, type, start_date, end_date, reason);
    res.json({ success: true });
  });

  app.put('/api/leave-requests/:id', authenticate, authorize(['admin', 'hr']), (req: any, res) => {
    const { status } = req.body;
    db.prepare('UPDATE leave_requests SET status = ?, approved_by = ? WHERE id = ?')
      .run(status, req.user.id, req.params.id);
    res.json({ success: true });
  });

  app.delete('/api/leave-requests/:id', authenticate, authorize(['admin', 'hr']), (req, res) => {
    db.prepare('DELETE FROM leave_requests WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Payroll API
  app.get('/api/payroll', authenticate, authorize(['admin', 'hr', 'accountant']), (req, res) => {
    const payroll = db.prepare(`
      SELECT p.*, u.full_name as staff_name, s.category, s.employee_id
      FROM payroll p
      JOIN staff s ON p.staff_id = s.id
      JOIN users u ON s.user_id = u.id
      ORDER BY p.year DESC, p.month DESC
    `).all();
    res.json(payroll);
  });

  app.post('/api/payroll', authenticate, authorize(['admin', 'hr', 'accountant']), (req, res) => {
    const { staff_id, month, year, basic_salary, allowances, deductions } = req.body;
    const net_salary = basic_salary + (allowances || 0) - (deductions || 0);
    db.prepare('INSERT INTO payroll (id, staff_id, month, year, basic_salary, allowances, deductions, net_salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(crypto.randomUUID(), staff_id, month, year, basic_salary, allowances, deductions, net_salary);
    res.json({ success: true });
  });

  app.delete('/api/payroll/:id', authenticate, authorize(['admin', 'hr', 'accountant']), (req, res) => {
    db.prepare('DELETE FROM payroll WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Documents API
  app.get('/api/documents', authenticate, (req, res) => {
    const docs = db.prepare(`
      SELECT d.*, u.full_name as uploader_name
      FROM documents d
      JOIN users u ON d.uploaded_by = u.id
      ORDER BY d.created_at DESC
    `).all();
    res.json(docs);
  });

  app.post('/api/documents', authenticate, (req: any, res) => {
    const { title, category, file_url } = req.body;
    db.prepare('INSERT INTO documents (id, title, category, file_url, uploaded_by) VALUES (?, ?, ?, ?, ?)')
      .run(crypto.randomUUID(), title, category, file_url, req.user.id);
    res.json({ success: true });
  });

  app.delete('/api/documents/:id', authenticate, authorize(['admin', 'hr']), (req, res) => {
    db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/announcements', authenticate, authorize(['admin', 'hr']), (req, res) => {
    const { title, content, target_role } = req.body;
    db.prepare('INSERT INTO announcements (id, title, content, target_role) VALUES (?, ?, ?, ?)').run(crypto.randomUUID(), title, content, target_role);
    res.json({ success: true });
  });

  app.delete('/api/announcements/:id', authenticate, authorize(['admin', 'hr']), (req, res) => {
    db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  app.post('/api/users', authenticate, authorize(['admin', 'hr']), (req, res) => {
    const { full_name, email, role, status, ward_id, relationship_type } = req.body;
    const id = crypto.randomUUID();
    const password = 'password123'; // Default password
    try {
      db.prepare('INSERT INTO users (id, full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)')
        .run(id, full_name, email, password, role, status);
      
      // If role is student, create a student record
      if (role === 'student') {
        db.prepare('INSERT INTO students (id, user_id, admission_number) VALUES (?, ?, ?)')
          .run(crypto.randomUUID(), id, 'STU-' + Date.now().toString().slice(-6));
      }

      // If role is parent and ward_id is provided, link them
      if (role === 'parent' && ward_id) {
        db.prepare('INSERT INTO parent_student (id, parent_id, student_id, relationship_type) VALUES (?, ?, ?, ?)')
          .run(crypto.randomUUID(), id, ward_id, relationship_type || 'guardian');
      }

      // If role is staff (or other non-student/parent roles that are staff-like)
      const staffRoles = ['admin', 'hr', 'accountant', 'librarian'];
      if (staffRoles.includes(role)) {
        db.prepare('INSERT INTO staff (id, user_id, category, employee_id) VALUES (?, ?, ?, ?)')
          .run(crypto.randomUUID(), id, role.toUpperCase(), 'EMP-' + Date.now().toString().slice(-6));
      }
      
      res.json({ id, full_name, email, role, status });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/users/:id', authenticate, authorize(['admin', 'hr']), (req, res) => {
    const { full_name, email, role, status } = req.body;
    const { id } = req.params;
    db.prepare('UPDATE users SET full_name = ?, email = ?, role = ?, status = ? WHERE id = ?')
      .run(full_name, email, role, status, id);
    res.json({ success: true });
  });

  app.delete('/api/users/:id', authenticate, authorize(['admin', 'hr']), (req, res) => {
    const { id } = req.params;
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
