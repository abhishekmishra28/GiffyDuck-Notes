import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  LayoutGrid,
  List,
  FileText,
  PenLine,
  Tags,
  Clock,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { notesApi } from '@/api/notes';
import { NoteGridSkeleton } from '@/components/common/Skeleton';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDate } from '@/lib/utils';
import type { GetNotesParams } from '@/types/note';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
}

function StatCard({ icon: Icon, label, value, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-all hover:border-border hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xl font-bold text-card-foreground">{value}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
        </div>
        <div className={iconBg}>
          <Icon className={iconColor} />
        </div>
      </div>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl transition-opacity group-hover:opacity-70" />
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const debouncedSearch = useDebounce(search, 300);

  const { data: statsData } = useQuery({
    queryKey: ['noteStats'],
    queryFn: notesApi.getNoteStats,
  });

  const params: GetNotesParams = {
    page: 1,
    limit: 6,
    search: debouncedSearch || undefined,
    isArchived: false,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['notes', params],
    queryFn: () => notesApi.getNotes(params),
  });

  const notes = data?.notes || [];
  const stats = statsData?.stats;

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome to your Notes hub.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={FileText}
          label="Total Notes"
          value={stats?.totalNotes?.toString() || '0'}
          iconBg="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
          iconColor="h-5 w-5 text-primary"
        />
        <StatCard
          icon={PenLine}
          label="Words Written"
          value={stats?.totalWords?.toLocaleString() || '0'}
          iconBg="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10"
          iconColor="h-5 w-5 text-purple-500"
        />
        <StatCard
          icon={Tags}
          label="Study Topics"
          value={stats?.uniqueTagsCount?.toString() || '0'}
          iconBg="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10"
          iconColor="h-5 w-5 text-emerald-500"
        />
        <StatCard
          icon={Clock}
          label="Last Activity"
          value={
            stats?.lastActivity
              ? formatDate(stats.lastActivity)
              : 'No activity'
          }
          iconBg="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10"
          iconColor="h-5 w-5 text-amber-500"
        />
      </div>

      {/* Notes Section */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold text-foreground">Your Notes</h2>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search notes by title, content, or tags..."
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full rounded-xl border border-input bg-background/60 py-2 pl-10 pr-4 text-sm text-foreground outline-none ring-ring transition-all placeholder:text-muted-foreground backdrop-blur-sm focus:ring-2"
              />
            </div>

            {/* View Toggle */}
            <div className="flex rounded-xl border border-border overflow-hidden bg-background/60 backdrop-blur-sm">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* New Note */}
            <Link
              to="/dashboard/notes/new"
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-md hover:shadow-primary/30"
            >
              <Plus className="h-4 w-4" />
              New Note
            </Link>
          </div>
        </div>

        {/* Notes Grid */}
        {isLoading ? (
          <NoteGridSkeleton />
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 py-20 text-center backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-foreground">
              No notes found
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? 'Try a different search term'
                : 'Create your first note to get started'}
            </p>
            {!search && (
              <Link
                to="/dashboard/notes/new"
                className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Create Note
              </Link>
            )}
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3'
                : 'flex flex-col gap-3'
            }
          >
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* View All */}
        {!isLoading && notes.length > 0 && (
          <div className="flex justify-center pt-2">
            <button
              onClick={() => navigate('/dashboard/notes')}
              className="rounded-xl border border-border/60 bg-card/40 px-5 py-2 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-border hover:bg-card hover:text-foreground"
            >
              View All Notes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
