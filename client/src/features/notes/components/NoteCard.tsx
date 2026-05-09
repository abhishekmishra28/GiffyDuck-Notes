import { Link, useNavigate } from 'react-router-dom';
import { Pin, Archive, Clock, Pencil, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/api/notes';
import { formatRelativeDate, stripHtml, truncateText } from '@/lib/utils';
import { toast } from 'sonner';
import type { Note } from '@/types/note';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  viewMode?: 'grid' | 'list';
}

function getWordCount(content: string) {
  const text = stripHtml(content);
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function NoteCard({ note, viewMode = 'grid' }: NoteCardProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const togglePin = useMutation({
    mutationFn: () => notesApi.updateNote(note._id, { isPinned: !note.isPinned }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned');
    },
  });

  const toggleArchive = useMutation({
    mutationFn: () =>
      notesApi.updateNote(note._id, { isArchived: !note.isArchived }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success(note.isArchived ? 'Note unarchived' : 'Note archived');
    },
  });

  const deleteNote = useMutation({
    mutationFn: () => notesApi.deleteNote(note._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Note deleted');
    },
  });

  const plainContent = stripHtml(note.content);
  const wordCount = getWordCount(note.content);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-primary/5',
        viewMode === 'list' && 'flex items-start gap-4'
      )}
    >
      {/* Hover glow */}
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />

      {/* Pinned indicator */}
      {note.isPinned && (
        <div className={cn(
          'absolute right-3 top-3 z-10 rounded-lg bg-primary/10 p-1.5 text-primary transition-opacity',
          viewMode === 'grid' ? 'opacity-100 group-hover:opacity-0' : ''
        )}>
          <Pin className="h-3.5 w-3.5" />
        </div>
      )}

      <div className="relative flex-1 min-w-0">
        <Link to={`/dashboard/notes/${note._id}`}>
          <h3 className="text-base font-semibold text-card-foreground transition-colors group-hover:text-primary">
            {note.title}
          </h3>
        </Link>
        <p className="mt-2 text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {truncateText(plainContent, 140)}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/50 bg-background/50 px-2.5 py-0.5 text-xs text-muted-foreground backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatRelativeDate(note.createdAt)}
          </span>
          <span className="text-xs text-muted-foreground/70">
            {wordCount} {wordCount === 1 ? 'word' : 'words'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className={cn(
        'flex items-center gap-0.5',
        viewMode === 'grid' ? 'absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity' : 'ml-auto shrink-0'
      )}>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            togglePin.mutate();
          }}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            note.isPinned
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
          )}
          title={note.isPinned ? 'Unpin' : 'Pin'}
        >
          <Pin className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleArchive.mutate();
          }}
          className={cn(
            'rounded-lg p-1.5 transition-colors',
            note.isArchived
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
          )}
          title={note.isArchived ? 'Unarchive' : 'Archive'}
        >
          <Archive className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/dashboard/notes/${note._id}`);
          }}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
          title="Edit"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this note?')) {
              deleteNote.mutate();
            }
          }}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
