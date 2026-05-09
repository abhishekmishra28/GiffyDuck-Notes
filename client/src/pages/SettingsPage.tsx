import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { LogOut, Moon, Sun, Palette, User, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types/user';

const themes: { value: Theme; label: string; icon: typeof Moon; color: string }[] = [
  { value: 'dark', label: 'Dark', icon: Moon, color: 'bg-[#0a0a0f] border-[#8b5cf6]' },
  { value: 'tokyo-night', label: 'Tokyo Night', icon: Palette, color: 'bg-[#1a1b26] border-[#7aa2f7]' },
  { value: 'light', label: 'Light', icon: Sun, color: 'bg-white border-[#6366f1]' },
  { value: 'solarized', label: 'Solarized', icon: Palette, color: 'bg-[#002b36] border-[#b58900]' },
];

export default function SettingsPage() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const usagePercent = Math.min(
    100,
    ((user?.aiUsageCount || 0) / (user?.aiQuota || 50)) * 100
  );

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Profile */}
      <section className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">Profile</h2>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-base font-medium text-card-foreground">
              {user?.name}
            </h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
              {user?.role}
            </span>
          </div>
        </div>
      </section>

      {/* Theme */}
      <section className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">Theme</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {themes.map((t) => {
            return (
              <button
                key={t.value}
                onClick={() => setTheme(t.value)}
                className={cn(
                  'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all',
                  theme === t.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground'
                )}
              >
                <div
                  className={cn(
                    'h-8 w-8 rounded-full border-2',
                    t.color
                  )}
                />
                <span className="text-xs font-medium text-card-foreground">
                  {t.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* AI Usage */}
      <section className="rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-card-foreground">AI Usage</h2>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {user?.aiUsageCount || 0} / {user?.aiQuota || 50} messages used
            </span>
            <span className="font-medium text-card-foreground">
              {Math.round(usagePercent)}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-2xl border border-destructive/30 bg-card/60 p-6 backdrop-blur-xl">
        <h2 className="text-lg font-semibold text-destructive">Danger Zone</h2>
        <div className="mt-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-destructive/30 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </section>
    </div>
  );
}
