import { NavLink, useLocation } from 'react-router-dom';
import {
  Feather,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Archive,
  Pin,
  Settings,
  Users,
  BarChart3,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
  Tag,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useQuery } from '@tanstack/react-query';
import { notesApi } from '@/api/notes';

interface SidebarProps {
  isAdmin?: boolean;
}

const dashboardLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/notes', label: 'All Notes', icon: FileText },
  { to: '/dashboard/ai', label: 'AI Chat', icon: MessageSquare },
  { to: '/dashboard/pinned', label: 'Pinned', icon: Pin },
  { to: '/dashboard/archived', label: 'Archived', icon: Archive },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: Shield },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const tagColors: Record<string, string> = {
  important: 'bg-blue-500',
  work: 'bg-emerald-500',
  ideas: 'bg-purple-500',
  personal: 'bg-amber-500',
  study: 'bg-rose-500',
  health: 'bg-cyan-500',
  finance: 'bg-lime-500',
  travel: 'bg-indigo-500',
};

function getTagColor(tag: string) {
  return tagColors[tag.toLowerCase()] || 'bg-muted-foreground';
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar, mobileMenuOpen, setMobileMenuOpen } =
    useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();

  const links = isAdmin ? adminLinks : dashboardLinks;

  const { data: tagsData } = useQuery({
    queryKey: ['noteTags'],
    queryFn: notesApi.getNoteTags,
    enabled: !isAdmin,
  });

  const tags = tagsData?.tags || [];

  return (
    <>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-card/95 backdrop-blur-md transition-all duration-300',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64',
          'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Feather className="h-5 w-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-card-foreground">
                GiffyDuck
              </span>
            )}
          </NavLink>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleSidebar}
              className="hidden rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:block"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Greeting */}
        {!sidebarCollapsed && !isAdmin && (
          <div className="px-4 pt-4">
            <p className="text-xs text-muted-foreground">Welcome back,</p>
            <p className="text-sm font-semibold text-card-foreground truncate">
              {user?.name || 'User'}
            </p>
          </div>
        )}

        {/* Links */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + '/');
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  sidebarCollapsed && 'justify-center'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!sidebarCollapsed && <span>{link.label}</span>}
              </NavLink>
            );
          })}

          {user?.role === 'admin' && !isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                location.pathname.startsWith('/admin')
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                sidebarCollapsed && 'justify-center'
              )}
            >
              <Shield className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>Admin</span>}
            </NavLink>
          )}

          {/* Tags Section */}
          {!isAdmin && !sidebarCollapsed && (
            <div className="mt-4">
              <div className="flex items-center gap-2 px-3 py-2">
                <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tags
                </span>
              </div>
              {tags.length === 0 ? (
                <p className="px-3 py-1 text-xs text-muted-foreground/60 italic">
                  No tags yet
                </p>
              ) : (
                <div className="space-y-0.5">
                  {tags.map((tag) => (
                    <NavLink
                      key={tag}
                      to={`/dashboard/notes?tag=${encodeURIComponent(tag)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className={cn('h-2 w-2 rounded-full', getTagColor(tag))} />
                      <span className="truncate">{tag}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-3">
          <div
            className={cn(
              'flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-2',
              sidebarCollapsed && 'justify-center px-2'
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-card-foreground">
                  {user?.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
