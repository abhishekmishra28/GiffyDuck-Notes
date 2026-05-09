export type UserRole = 'user' | 'admin';
export type Theme = 'dark' | 'tokyo-night' | 'light' | 'solarized';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string | null;
  theme: Theme;
  isActive: boolean;
  isBanned: boolean;
  aiUsageCount: number;
  aiQuota: number;
  lastActive: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
