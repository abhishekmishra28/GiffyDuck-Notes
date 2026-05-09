export interface Note {
  _id: string;
  user: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotesResponse {
  success: boolean;
  page: number;
  totalPages: number;
  total: number;
  count: number;
  notes: Note[];
}

export interface NoteResponse {
  success: boolean;
  note: Note;
}

export interface GetNotesParams {
  page?: number;
  limit?: number;
  search?: string;
  tag?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface CreateNoteInput {
  title: string;
  content: string;
  tags?: string[];
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  tags?: string[];
  isPinned?: boolean;
  isArchived?: boolean;
}

export interface NoteStatsResponse {
  success: boolean;
  stats: {
    totalNotes: number;
    totalWords: number;
    uniqueTagsCount: number;
    lastActivity: string | null;
  };
}

export interface NoteTagsResponse {
  success: boolean;
  tags: string[];
}
