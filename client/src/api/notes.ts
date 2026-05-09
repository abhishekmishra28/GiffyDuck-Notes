import { api } from './axios';
import type {
  NotesResponse,
  NoteResponse,
  GetNotesParams,
  CreateNoteInput,
  UpdateNoteInput,
  NoteStatsResponse,
  NoteTagsResponse,
} from '@/types/note';

export const notesApi = {
  getNotes: (params?: GetNotesParams) =>
    api
      .get<NotesResponse>('/notes', { params })
      .then((res) => res.data),

  getNote: (id: string) =>
    api.get<NoteResponse>(`/notes/${id}`).then((res) => res.data),

  createNote: (data: CreateNoteInput) =>
    api.post<NoteResponse>('/notes', data).then((res) => res.data),

  updateNote: (id: string, data: UpdateNoteInput) =>
    api.put<NoteResponse>(`/notes/${id}`, data).then((res) => res.data),

  deleteNote: (id: string) =>
    api
      .delete<{ success: boolean; message: string }>(`/notes/${id}`)
      .then((res) => res.data),

  getNoteStats: () =>
    api.get<NoteStatsResponse>('/notes/stats').then((res) => res.data),

  getNoteTags: () =>
    api.get<NoteTagsResponse>('/notes/tags').then((res) => res.data),
};
