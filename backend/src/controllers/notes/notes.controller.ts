import { prisma } from '../../infra/prisma';
import { CreateNoteDtoType, DeleteNoteDtoType, GetNotesDtoType, UpdateNoteDtoType } from './notes.dto';
import { ORPCError } from '@orpc/server';

export const createNoteController = async (dto: CreateNoteDtoType) => {
  const { content, title, id_user } = dto;

  const startCurrentMinute = new Date();
  startCurrentMinute.setSeconds(0, 0); // начало текущей минуты

  const notes = await prisma.note.findMany({ where: { userId: id_user, createdAt: { gte: startCurrentMinute } } });
  if (notes.length >= 3) {
    throw new ORPCError('FORBIDDEN', { message: 'Не больше 3 заметок в минуту' });
  }

  await prisma.note.create({ data: { content, title, userId: id_user } });
};

export const updateNoteController = async (dto: UpdateNoteDtoType) => {
  const { content, title, id_note } = dto;
  await prisma.note.update({
    where: { id_note },
    data: { content, title },
  });
};
export const deleteNoteController = async (dto: DeleteNoteDtoType) => {
  const { id_note } = dto;
  await prisma.note.delete({
    where: { id_note },
  });
};

export const getNotesController = async (dto: GetNotesDtoType) => {
  const { id_user } = dto;
  return await prisma.note.findMany({ where: { userId: id_user }, orderBy: { createdAt: 'asc' } });
};
