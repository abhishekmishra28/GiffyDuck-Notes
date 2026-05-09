import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, LayoutGrid, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { notesApi } from '@/api/notes';
import { NoteGridSkeleton } from '@/components/common/Skeleton';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { useDebounce } from '@/hooks/useDebounce';
import type { GetNotesParams } from '@/types/note';

export default function NotesPage() {
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 300);

  const params: GetNotesParams = {
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    isArchived: false,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['notes', params],
    queryFn: () => notesApi.getNotes(params),
  });

  const notes = data?.notes || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm text-foreground outline-none ring-ring transition-all placeholder:text-muted-foreground focus:ring-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <Link
            to="/dashboard/notes/new"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            New Note
          </Link>
        </div>
      </div>

      {/* Notes */}
      {isLoading ? (
        <NoteGridSkeleton />
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 py-20 text-center backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-foreground">No notes found</h3>
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
        <>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground hover:bg-accent disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
