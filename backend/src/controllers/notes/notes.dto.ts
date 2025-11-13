import { z } from 'zod';

type UserId = {
  id_user: string;
};

const NoteSchema = z.object({
  id_note: z.string(),
  title: z.string().min(1).nullable(),
  content: z.string().min(1),
});

const NoteSchemaOutput = z.object({
  id_note: z.string(),
  title: z.string().min(1).nullable(),
  content: z.string().min(1),
});

export const CreateNoteSchema = NoteSchema.pick({
  title: true,
  content: true,
});

export type CreateNoteDtoType = z.infer<typeof CreateNoteSchema> & UserId;

export const UpdateNoteSchema = NoteSchema.pick({
  id_note: true,
  title: true,
  content: true,
});

export type UpdateNoteDtoType = z.infer<typeof UpdateNoteSchema>;

export const DeleteNoteSchema = NoteSchema.pick({
  id_note: true,
});

export type DeleteNoteDtoType = z.infer<typeof DeleteNoteSchema>;

export type GetNotesDtoType = UserId;

export const GetNotesSchemaOutput = z.array(NoteSchemaOutput);
