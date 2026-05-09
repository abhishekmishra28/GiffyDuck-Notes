import { Users, FileText, MessageSquare, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

function KpiCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:bg-accent/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-2xl font-bold text-card-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link to={href}>{content}</Link>;
  }
  return content;
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-muted-foreground">Overview of your platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Users} label="Total Users" value="--" href="/admin/users" />
        <KpiCard icon={FileText} label="Total Notes" value="--" />
        <KpiCard icon={MessageSquare} label="Total Chats" value="--" />
        <KpiCard icon={Brain} label="Avg AI Usage" value="--" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground">Quick Links</h3>
          <div className="mt-4 space-y-2">
            <Link
              to="/admin/users"
              className="flex items-center gap-3 rounded-lg p-3 text-sm text-foreground hover:bg-accent"
            >
              <Users className="h-4 w-4 text-primary" />
              Manage Users
            </Link>
            <Link
              to="/admin/analytics"
              className="flex items-center gap-3 rounded-lg p-3 text-sm text-foreground hover:bg-accent"
            >
              <Brain className="h-4 w-4 text-primary" />
              View Analytics
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-card-foreground">
            System Status
          </h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">API Status</span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Operational
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">AI Service</span>
              <span className="flex items-center gap-1.5 text-emerald-500">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
