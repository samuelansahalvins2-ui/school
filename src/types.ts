export type UserRole = 'admin' | 'hr' | 'accountant' | 'librarian' | 'student' | 'parent';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  system_id?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}
