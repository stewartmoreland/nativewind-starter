import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '../trpc';

export const profileRouter = createTRPCRouter({
  me: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, updated_at')
      .eq('id', ctx.userId)
      .single();

    if (error) throw new TRPCError({ code: 'NOT_FOUND', message: error.message });
    return data;
  }),

  update: protectedProcedure
    .input(
      z.object({
        username: z.string().min(3).max(32).nullable().optional(),
        full_name: z.string().max(120).nullable().optional(),
        avatar_url: z.url().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('profiles')
        .update(input)
        .eq('id', ctx.userId)
        .select('id, username, full_name, avatar_url, updated_at')
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
      return data;
    }),
});
