import { createTRPCRouter } from './trpc';
import { postsRouter } from './routers/posts';
import { profileRouter } from './routers/profile';

export const appRouter = createTRPCRouter({
  posts: postsRouter,
  profile: profileRouter,
});

export type AppRouter = typeof appRouter;
