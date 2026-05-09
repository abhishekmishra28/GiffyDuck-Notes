import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, Moon, Sun, Palette, User, Shield } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types/user';
import { authApi } from '@/api/auth';
import { toast } from 'sonner';

interface HeaderProps {
  isAdmin?: boolean;
}

const themes: { value: Theme; label: string; icon: typeof Moon }[] = [
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'tokyo-night', label: 'Tokyo Night', icon: Palette },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'solarized', label: 'Solarized', icon: Palette },
];

export function Header({ isAdmin: _isAdmin }: HeaderProps) {
  const { setMobileMenuOpen, sidebarCollapsed } = useUIStore();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
        setThemeMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    setThemeMenuOpen(false);
    try {
      await authApi.updateTheme(newTheme);
      useAuthStore.getState().updateUserTheme(newTheme);
    } catch {
      // local theme still updated
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const pageTitle = (() => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/dashboard/notes') return 'All Notes';
    if (path === '/dashboard/notes/new') return 'New Note';
    if (path.startsWith('/dashboard/notes/')) return 'Edit Note';
    if (path === '/dashboard/ai') return 'AI Chat';
    if (path === '/dashboard/archived') return 'Archived Notes';
    if (path === '/dashboard/pinned') return 'Pinned Notes';
    if (path === '/dashboard/settings') return 'Settings';
    if (path === '/admin') return 'Admin Dashboard';
    if (path === '/admin/users') return 'User Management';
    if (path === '/admin/analytics') return 'Analytics';
    return 'Dashboard';
  })();

  return (
    <header className={cn(
      'fixed right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md transition-all duration-300 lg:px-8',
      sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'
    )}>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2" ref={menuRef}>
        {/* Theme Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setThemeMenuOpen(!themeMenuOpen);
              setUserMenuOpen(false);
            }}
            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            title="Change theme"
          >
            <Palette className="h-5 w-5" />
          </button>

          {themeMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-popover p-1 shadow-lg">
              {themes.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.value}
                    onClick={() => handleThemeChange(t.value)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                      theme === t.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-popover-foreground hover:bg-accent'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setUserMenuOpen(!userMenuOpen);
              setThemeMenuOpen(false);
            }}
            className="flex items-center gap-2 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border border-border bg-popover p-1 shadow-lg">
              <div className="border-b border-border px-3 py-2">
                <p className="text-sm font-medium text-popover-foreground">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setUserMenuOpen(false);
                  navigate('/dashboard/settings');
                }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-accent"
              >
                <User className="h-4 w-4" />
                Settings
              </button>
              {user?.role === 'admin' && (
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/admin');
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-accent"
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


