'use client';

import type { ComponentType, ReactElement, JSX } from 'react';
import { useEffect } from 'react';
import { useTokenExist } from '@/dal/hooks';
import { useRouter } from 'next/navigation';

export function withAuth<P extends JSX.IntrinsicAttributes>(WrappedComponent: ComponentType<P>) {
  return (props: P): ReactElement | null => {
    const token = useTokenExist();
    const router = useRouter();

    useEffect(() => {
      if (token === null) {
        router.replace('/auth');
      }
      if (token) {
        router.replace('/');
      }
    }, [token]);

    if (token === undefined) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };
}
