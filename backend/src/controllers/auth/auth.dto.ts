import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
  name: z.string().min(3),
});

const UserSchemaOutput = z.object({
  token: z.string(),
});

export const RegisterSchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
});

export type RegisterDtoType = z.infer<typeof RegisterSchema>;

export const RegisterSchemaOutput = UserSchemaOutput.pick({
  token: true,
});

export const LoginSchema = UserSchema.pick({
  email: true,
  password: true,
});

export const LoginSchemaOutput = UserSchemaOutput.pick({
  token: true,
});

export type LoginDtoType = z.infer<typeof LoginSchema>;
