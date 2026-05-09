import { useQuery } from '@tanstack/react-query';
import { notesApi } from '@/api/notes';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { NoteGridSkeleton } from '@/components/common/Skeleton';
import { Pin } from 'lucide-react';

export default function PinnedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['notes', { isPinned: true }],
    queryFn: () => notesApi.getNotes({ isPinned: true }),
  });

  const notes = data?.notes || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Pin className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Pinned Notes ({data?.total || 0})
        </h2>
      </div>

      {isLoading ? (
        <NoteGridSkeleton />
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 py-20 text-center backdrop-blur-sm">
          <Pin className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No pinned notes
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Pin important notes to access them quickly
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
