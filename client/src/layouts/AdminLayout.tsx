import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar isAdmin />
      <div className="flex flex-1 flex-col lg:ml-64">
        <Header isAdmin />
        <main className="flex-1 p-4 pt-20 lg:p-8 lg:pt-24">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
