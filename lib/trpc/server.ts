import { cache } from 'react';
import { headers } from 'next/headers';
import { createTRPCContext } from '@/server/api/trpc';
import { createCallerFactory } from '@/server/api/trpc';
import { appRouter } from '@/server/api/routers/_app';

/**
 * Cette fonction permet d'utiliser tRPC côté serveur dans les Server Components
 * et les Server Actions de Next.js.
 *
 * @example
 * ```ts
 * const api = await getServerApi();
 * const companies = await api.companies.getAll();
 * ```
 */
export const getServerApi = cache(async () => {
  const heads = new Headers(await headers());
  heads.set('x-trpc-source', 'rsc');

  const createCaller = createCallerFactory(appRouter);
  return createCaller(
    await createTRPCContext({
      req: {
        headers: heads,
      } as any,
      res: undefined,
    })
  );
});

