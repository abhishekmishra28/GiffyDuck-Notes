import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Save,
  Trash2,
  Pin,
  Archive,
  Loader2,
  Sparkles,
  Eye,
  Pencil,
  FileDown,
  Check,
} from 'lucide-react';
import { marked } from 'marked';
import TurndownService from 'turndown';
import { notesApi } from '@/api/notes';
import { aiApi } from '@/api/ai';
import { TipTapEditor } from '@/features/notes/components/TipTapEditor';
import { TagInput } from '@/features/notes/components/TagInput';
import { toast } from 'sonner';
import { stripHtml } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { CreateNoteInput, UpdateNoteInput } from '@/types/note';

const turndownService = new TurndownService({ headingStyle: 'atx' });

function htmlToMarkdown(html: string) {
  try {
    return turndownService.turndown(html);
  } catch {
    return stripHtml(html);
  }
}

function markdownToHtml(md: string) {
  try {
    return marked.parse(md, { breaks: true, gfm: true }) as string;
  } catch {
    return md;
  }
}

export default function NoteEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [markdownSource, setMarkdownSource] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [isEditing, setIsEditing] = useState(isNew);
  const [editorMode, setEditorMode] = useState<'visual' | 'markdown'>('visual');

  const { data, isLoading } = useQuery({
    queryKey: ['note', id],
    queryFn: () => notesApi.getNote(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.note) {
      setTitle(data.note.title);
      setContent(data.note.content);
      setMarkdownSource(htmlToMarkdown(data.note.content));
      setTags(data.note.tags);
      setIsPinned(data.note.isPinned);
      setIsArchived(data.note.isArchived);
      setIsEditing(false);
    }
  }, [data]);

  const viewContent = useMemo(() => {
    if (editorMode === 'markdown') {
      return markdownToHtml(markdownSource);
    }
    return content;
  }, [editorMode, markdownSource, content]);

  const createMutation = useMutation({
    mutationFn: (data: CreateNoteInput) => notesApi.createNote(data),
    onSuccess: (res) => {
      toast.success('Note created');
      navigate(`/dashboard/notes/${res.note._id}`);
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to create note');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateNoteInput) => notesApi.updateNote(id!, data),
    onSuccess: () => {
      toast.success('Note saved');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to save note');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => notesApi.deleteNote(id!),
    onSuccess: () => {
      toast.success('Note deleted');
      navigate('/dashboard/notes');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    },
  });

  const suggestMutation = useMutation({
    mutationFn: () =>
      aiApi.suggestForNote({
        noteId: id!,
        action: 'improve',
        text: editorMode === 'markdown' ? markdownSource : content,
      }),
    onSuccess: (data) => {
      if (editorMode === 'markdown') {
        setMarkdownSource(data.suggestion);
      } else {
        setContent(data.suggestion);
      }
      toast.success('AI suggestion applied');
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || 'AI suggestion failed');
    },
  });

  const handleSave = useCallback(() => {
    const finalContent = editorMode === 'markdown'
      ? markdownToHtml(markdownSource)
      : content;

    if (!title.trim() || !finalContent.trim()) {
      toast.error('Title and content are required');
      return;
    }
    const payload = { title, content: finalContent, tags };
    if (isNew) {
      createMutation.mutate(payload);
    } else {
      updateMutation.mutate({ ...payload, isPinned, isArchived });
    }
  }, [title, content, markdownSource, tags, isPinned, isArchived, isNew, editorMode]);

  const handleTogglePin = useCallback(() => {
    if (!isNew) {
      updateMutation.mutate({ isPinned: !isPinned });
      setIsPinned(!isPinned);
    }
  }, [isNew, isPinned]);

  const handleToggleArchive = useCallback(() => {
    if (!isNew) {
      updateMutation.mutate({ isArchived: !isArchived });
      setIsArchived(!isArchived);
    }
  }, [isNew, isArchived]);

  const handleExportTxt = useCallback(() => {
    const text = stripHtml(viewContent);
    const blob = new Blob([`${title}\n\n${text}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported as TXT');
  }, [title, viewContent]);

  const handleModeSwitch = (mode: 'visual' | 'markdown') => {
    if (mode === editorMode) return;
    if (mode === 'markdown') {
      setMarkdownSource(htmlToMarkdown(content));
    } else {
      setContent(markdownToHtml(markdownSource));
    }
    setEditorMode(mode);
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate('/dashboard/notes')}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Pin / Archive / Export — always available */}
          {!isNew && (
            <>
              <button
                onClick={handleTogglePin}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  isPinned
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
                title="Pin note"
              >
                <Pin className="h-4 w-4" />
              </button>
              <button
                onClick={handleToggleArchive}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  isArchived
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
                title="Archive note"
              >
                <Archive className="h-4 w-4" />
              </button>
            </>
          )}

          <button
            onClick={handleExportTxt}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
            title="Export as TXT"
          >
            <FileDown className="h-4 w-4" />
            Export
          </button>

          {/* Edit / Done toggle */}
          {!isNew && (
            <button
              onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                isEditing
                  ? 'border-border text-foreground hover:bg-accent'
                  : 'border-primary bg-primary text-primary-foreground hover:bg-primary/90'
              )}
            >
              {isEditing ? (
                <>
                  <Eye className="h-4 w-4" /> Read
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4" /> Edit
                </>
              )}
            </button>
          )}

          {/* Edit-mode only actions */}
          {isEditing && (
            <>
              {!isNew && (
                <button
                  onClick={() => suggestMutation.mutate()}
                  disabled={suggestMutation.isPending}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-foreground hover:bg-accent disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  AI Suggest
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save
              </button>
            </>
          )}

          {!isNew && (
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this note?')) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              className="rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Title */}
      {!isEditing ? (
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
      ) : (
        <input
          type="text"
          placeholder="Note title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent text-3xl font-bold tracking-tight text-foreground outline-none placeholder:text-muted-foreground"
        />
      )}

      {/* Tags */}
      {!isEditing ? (
        tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/50 bg-background/50 px-2.5 py-0.5 text-xs text-muted-foreground backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        )
      ) : (
        <TagInput tags={tags} onChange={setTags} />
      )}

      {/* Content */}
      {!isEditing ? (
        <div className="prose prose-sm max-w-none rounded-2xl border border-border/60 bg-card/60 p-6 backdrop-blur-xl dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: viewContent }} />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Editor mode switch — subtle, contextually placed */}
          <div className="flex items-center justify-between">
            <div className="flex rounded-lg border border-border overflow-hidden bg-background/60">
              <button
                onClick={() => handleModeSwitch('visual')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                  editorMode === 'visual'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <Pencil className="h-3 w-3" />
                Visual
              </button>
              <button
                onClick={() => handleModeSwitch('markdown')}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                  editorMode === 'markdown'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                )}
              >
                <Check className="h-3 w-3" />
                Markdown
              </button>
            </div>
            {editorMode === 'markdown' && (
              <span className="text-xs text-muted-foreground">
                {markdownSource.length} chars
              </span>
            )}
          </div>

          {editorMode === 'markdown' ? (
            <textarea
              value={markdownSource}
              onChange={(e) => setMarkdownSource(e.target.value)}
              placeholder="Write in markdown..."
              className="min-h-[400px] w-full rounded-2xl border border-border/60 bg-card/60 p-5 font-mono text-sm text-foreground outline-none ring-ring transition-all placeholder:text-muted-foreground backdrop-blur-xl focus:ring-2 resize-y"
              spellCheck={false}
            />
          ) : (
            <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl">
              <TipTapEditor content={content} onChange={setContent} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
