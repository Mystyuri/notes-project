import { CONFIGS } from '../configs';
import jwt from 'jsonwebtoken';
import { ORPCError } from '@orpc/server';

const jwtSecret = CONFIGS.SECRET_KEY;

export const generateToken = ({ id_user, email, name }: { id_user: string; email: string; name: string }) => {
  return { token: jwt.sign({ id_user, email, name }, jwtSecret) };
};

export const verifyToken = ({ token }: { token: string }) => {
  try {
    return jwt.verify(token, jwtSecret) as Parameters<typeof generateToken>[0];
  } catch (e) {
    return null;
  }
};
