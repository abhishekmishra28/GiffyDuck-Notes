import { api } from './axios';
import type { AuthResponse, User, Theme } from '@/types/user';

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface VerifyOtpInput {
  email: string;
  otp: string;
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

export const authApi = {
  login: (data: LoginInput) =>
    api.post<AuthResponse>('/auth/login', data).then((res) => res.data),

  register: (data: RegisterInput) =>
    api.post<AuthResponse>('/auth/register', data).then((res) => res.data),

  verifyOtp: (data: VerifyOtpInput) =>
    api.post<AuthResponse>('/auth/verify-otp', data).then((res) => res.data),

  resendOtp: (email: string) =>
    api.post<AuthResponse>('/auth/resend-otp', { email }).then((res) => res.data),

  forgotPassword: (email: string) =>
    api.post<AuthResponse>('/auth/forgot-password', { email }).then((res) => res.data),

  resetPassword: (data: ResetPasswordInput) =>
    api.put<AuthResponse>(`/auth/reset-password/${data.token}`, {
      password: data.password,
    }).then((res) => res.data),

  fetchMe: () =>
    api.get<{ success: boolean; user: User }>('/auth/me').then((res) => res.data),

  updateTheme: (theme: Theme) =>
    api.put<{ success: boolean; theme: Theme }>('/auth/update-theme', { theme }).then((res) => res.data),
};
