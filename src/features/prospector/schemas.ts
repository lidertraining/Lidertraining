import { z } from 'zod';

export const LeadStatusValues = ['frio', 'morno', 'quente', 'fechado'] as const;

export const CreateLeadSchema = z.object({
  name: z.string().min(2, 'Nome muito curto').max(80, 'Nome muito longo'),
  phone: z
    .string()
    .trim()
    .max(30, 'Telefone muito longo')
    .optional()
    .or(z.literal('')),
  status: z.enum(LeadStatusValues).default('frio'),
  source: z.string().trim().max(40).default('Lista quente'),
});
export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

export const UpdateLeadSchema = z.object({
  status: z.enum(LeadStatusValues).optional(),
  step: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(500).optional(),
});
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
