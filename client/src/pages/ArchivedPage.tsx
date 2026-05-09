import { useQuery } from '@tanstack/react-query';
import { notesApi } from '@/api/notes';
import { NoteCard } from '@/features/notes/components/NoteCard';
import { NoteGridSkeleton } from '@/components/common/Skeleton';
import { Archive } from 'lucide-react';

export default function ArchivedPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['notes', { isArchived: true }],
    queryFn: () => notesApi.getNotes({ isArchived: true }),
  });

  const notes = data?.notes || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Archive className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">
          Archived Notes ({data?.total || 0})
        </h2>
      </div>

      {isLoading ? (
        <NoteGridSkeleton />
      ) : notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/40 py-20 text-center backdrop-blur-sm">
          <Archive className="h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No archived notes
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Archive notes to keep them out of your main view
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
