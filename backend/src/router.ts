import { LoginSchema, LoginSchemaOutput, RegisterSchema, RegisterSchemaOutput } from './controllers/auth/auth.dto';
import { loginController, registerController } from './controllers/auth/auth.controller';
import {
  CreateNoteSchema,
  DeleteNoteSchema,
  GetNotesSchemaOutput,
  UpdateNoteSchema,
} from './controllers/notes/notes.dto';
import {
  createNoteController,
  deleteNoteController,
  getNotesController,
  updateNoteController,
} from './controllers/notes/notes.controller';
import { prisma } from './infra/prisma';
import { verifyToken } from './utls/generate-token';
import { ORPCError, os } from '@orpc/server';

export type Context = Awaited<ReturnType<typeof createRPCContext>>;

const o = os.$context<Context>();

export async function createRPCContext(opts: { authorization?: string }) {
  const user = await (() => {
    if (typeof opts.authorization === 'string') {
      const splitString = opts.authorization.split(' ');
      const token = splitString[1];
      const user = verifyToken({ token });
      if (user) {
        return prisma.user.findUniqueOrThrow({ where: { id_user: user.id_user } });
      }
    }
    return null;
  })();

  return { user };
}

const publicProcedure = o;
const protectedProcedure = publicProcedure.use(({ context, next }) => {
  console.log({ context });
  if (!context.user) {
    throw new ORPCError('UNAUTHORIZED');
  }
  return next({ context: { ...context, user: context.user } });
});

const authRouter = o.router({
  register: publicProcedure
    .route({ method: 'POST', path: '/auth/register' })
    .input(RegisterSchema)
    .output(RegisterSchemaOutput)
    .handler(({ input }) => {
      return registerController(input);
    }),
  login: publicProcedure
    .route({ method: 'POST', path: '/auth/login' })
    .input(LoginSchema)
    .output(LoginSchemaOutput)
    .handler(({ input }) => {
      return loginController(input);
    }),
  check: protectedProcedure.route({ method: 'GET', path: '/auth/check' }).handler(() => true),
});

const notesRouter = o.router({
  createNote: protectedProcedure
    .route({ method: 'POST', path: '/notes' })
    .input(CreateNoteSchema)
    .handler(({ input, context }) => {
      const { user } = context;
      return createNoteController({ ...input, id_user: user.id_user });
    }),
  updateNote: protectedProcedure
    .route({ method: 'PUT', path: '/notes' })
    .input(UpdateNoteSchema)
    .handler(({ input }) => {
      return updateNoteController(input);
    }),
  deleteNote: protectedProcedure
    .route({ method: 'DELETE', path: '/notes' })
    .input(DeleteNoteSchema)
    .handler(({ input }) => {
      return deleteNoteController(input);
    }),
  getNotes: protectedProcedure
    .route({ method: 'GET', path: '/notes' })
    .output(GetNotesSchemaOutput)
    .handler(({ context }) => {
      const { user } = context;
      return getNotesController({ id_user: user.id_user });
    }),
});

export const appRouter = o.router({
  auth: authRouter,
  notes: notesRouter,
});

export type AppRouter = typeof appRouter;
