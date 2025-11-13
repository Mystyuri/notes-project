'use client';

import { createORPCClient, onError } from '@orpc/client';
import { RPCLink } from '@orpc/client/fetch';
import { RouterClient } from '@orpc/server';
import { createTanstackQueryUtils } from '@orpc/tanstack-query';
import { GET_TOKEN, REMOVE_TOKEN } from '@/dal/hooks';
import { toast } from 'sonner';
import { AppRouter } from '@backend/src/router';

type ORPCError = {
  code: string | number;
  [key: string]: unknown;
  message: string;
};

export const createOrpcClient = (url: string) => {
  const link = new RPCLink({
    url,
    headers: async () => {
      const token = GET_TOKEN();
      return token ? { authorization: 'Bearer ' + token } : {};
    },
    interceptors: [
      onError((data) => {
        const error = data as ORPCError;
        if (error.code === 'UNAUTHORIZED') {
          REMOVE_TOKEN();
        } else if (error.code === 20) {
        } else {
          toast.error(error.message);
        }
      }),
    ],
  });

  const client: RouterClient<AppRouter> = createORPCClient(link);
  return createTanstackQueryUtils(client);
};
