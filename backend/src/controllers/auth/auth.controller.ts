import { LoginDtoType, RegisterDtoType } from './auth.dto';
import bcrypt from 'bcrypt';
import { prisma } from '../../infra/prisma';
import { generateToken } from '../../utls/generate-token';
import { ORPCError } from '@orpc/server';

export const registerController = async (dto: RegisterDtoType) => {
  const { email, password, name } = dto;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hashedPassword, name } });

  return generateToken({ name, email, id_user: user.id_user });
};
export const loginController = async (dto: LoginDtoType) => {
  const { email, password } = dto;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ORPCError('FORBIDDEN', { message: 'Нет такого пользователя' });
  }

  const comparePassword = bcrypt.compareSync(password, user.password);
  if (!comparePassword) {
    throw new ORPCError('FORBIDDEN', { message: 'Неверный пароль' });
  }

  return generateToken({ name: user.name, email, id_user: user.id_user });
};
