import { Suspense, lazy } from 'react';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedRoute, AdminRoute, PublicRoute } from './protectedRoutes';
import { PageLoader } from '@/components/common/PageLoader';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const VerifyOtpPage = lazy(() => import('@/pages/VerifyOtpPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteEditorPage = lazy(() => import('@/pages/NoteEditorPage'));
const AIChatPage = lazy(() => import('@/pages/AIChatPage'));
const ArchivedPage = lazy(() => import('@/pages/ArchivedPage'));
const PinnedPage = lazy(() => import('@/pages/PinnedPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'));
const AdminAnalyticsPage = lazy(() => import('@/pages/AdminAnalyticsPage'));

function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: withSuspense(LandingPage),
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: withSuspense(LoginPage) },
          { path: '/register', element: withSuspense(RegisterPage) },
          { path: '/verify-otp', element: withSuspense(VerifyOtpPage) },
          { path: '/forgot-password', element: withSuspense(ForgotPasswordPage) },
          { path: '/reset-password/:token', element: withSuspense(ResetPasswordPage) },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', element: withSuspense(DashboardPage) },
          { path: '/dashboard/notes', element: withSuspense(NotesPage) },
          { path: '/dashboard/notes/new', element: withSuspense(NoteEditorPage) },
          { path: '/dashboard/notes/:id', element: withSuspense(NoteEditorPage) },
          { path: '/dashboard/ai', element: withSuspense(AIChatPage) },
          { path: '/dashboard/archived', element: withSuspense(ArchivedPage) },
          { path: '/dashboard/pinned', element: withSuspense(PinnedPage) },
          { path: '/dashboard/settings', element: withSuspense(SettingsPage) },
        ],
      },
    ],
  },
  {
    element: <AdminRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin', element: withSuspense(AdminDashboardPage) },
          { path: '/admin/users', element: withSuspense(AdminUsersPage) },
          { path: '/admin/analytics', element: withSuspense(AdminAnalyticsPage) },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
