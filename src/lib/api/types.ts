// lib/api/types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PLAYER' | 'PRO' | 'CADDY' | 'ADMIN';
  isActive: boolean;
  wallet?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success?: boolean;
  data?: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'PLAYER' | 'PRO' | 'CADDY';
}