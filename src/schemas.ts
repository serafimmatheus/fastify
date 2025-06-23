import z from 'zod'

export const tasksSchemaResponse = z.object({
  id: z.string().cuid(),
  title: z.string().trim().min(1, { message: 'Title is required' }),
  description: z.string().optional(),
  isCompleted: z.boolean().default(false).optional(),
})
