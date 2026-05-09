import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export function DashboardLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className={cn(
        'flex flex-1 flex-col transition-all duration-300',
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      )}>
        <Header />
        <main className="flex-1 p-4 pt-20 lg:p-8 lg:pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
