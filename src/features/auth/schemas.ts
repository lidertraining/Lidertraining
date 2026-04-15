import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Email inv\u00e1lido'),
  password: z.string().min(6, 'M\u00ednimo 6 caracteres'),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z
  .object({
    name: z.string().min(2, 'Nome muito curto'),
    email: z.string().email('Email inv\u00e1lido'),
    password: z.string().min(6, 'M\u00ednimo 6 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Senhas n\u00e3o coincidem',
    path: ['confirm'],
  });
export type SignupInput = z.infer<typeof SignupSchema>;
