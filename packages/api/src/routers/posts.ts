import { TRPCError } from '@trpc/server';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

/**
 * SECURITY RULE for every router in this package:
 * no input schema may contain userId / user_id / authorId / ownerId / role.
 * Identity comes from ctx.userId, which is derived from a signature-verified
 * JWT. Accepting it from the client is the most common hole in this stack.
 */
const postId = z.object({ id: z.uuid() });

export const postsRouter = createTRPCRouter({
  /** Published posts are readable by anyone; RLS enforces this too. */
  list: publicProcedure
    .input(z.object({ limit: z.number().int().min(1).max(100).default(20) }).optional())
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('posts')
        .select('id, title, body, published, created_at, user_id')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(input?.limit ?? 20);

      if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
      return data;
    }),

  /** Drafts + published, for the signed-in user only. RLS is the real gate. */
  mine: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('posts')
      .select('id, title, body, published, created_at')
      .eq('user_id', ctx.userId)
      .order('created_at', { ascending: false });

    if (error) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: error.message });
    return data;
  }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        body: z.string().max(10_000).optional(),
        published: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('posts')
        // user_id comes from the verified token, never from input.
        .insert({ ...input, user_id: ctx.userId })
        .select('id, title, body, published, created_at')
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
      return data;
    }),

  update: protectedProcedure
    .input(
      postId.extend({
        title: z.string().min(1).max(200).optional(),
        body: z.string().max(10_000).nullable().optional(),
        published: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...patch } = input;
      const { data, error } = await ctx.supabase
        .from('posts')
        .update(patch)
        // The .eq is belt-and-braces; the RLS UPDATE policy is the real gate.
        .eq('id', id)
        .eq('user_id', ctx.userId)
        .select('id, title, body, published, created_at')
        .single();

      if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
      if (!data) throw new TRPCError({ code: 'NOT_FOUND' });
      return data;
    }),

  delete: protectedProcedure.input(postId).mutation(async ({ ctx, input }) => {
    const { error } = await ctx.supabase
      .from('posts')
      .delete()
      .eq('id', input.id)
      .eq('user_id', ctx.userId);

    if (error) throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
    return { id: input.id };
  }),
});
