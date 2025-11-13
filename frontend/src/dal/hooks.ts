import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { useOrpc } from '@/app/providers';

type UserInfo = { id_user: string; email: string; name: string };

type AuthState = {
  token: string | null;
  userInfo: { id_user: string; email: string; name: string } | null;
  hasHydrated: boolean;
  setToken: (token: string) => void;
  removeToken: () => void;
  setHydrated: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userInfo: null,
      hasHydrated: false,
      setToken: (token) => {
        const userInfo = jwtDecode<UserInfo>(token);
        set({ token, userInfo });
      },
      removeToken: () => {
        set({ token: null, userInfo: null });
      },
      setHydrated: () => {
        set({ hasHydrated: true });
      },
    }),
    {
      name: 'auth-token-storage', // имя ключа в localStorage
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

export const SET_TOKEN = useAuthStore.getInitialState().setToken;
export const REMOVE_TOKEN = useAuthStore.getInitialState().removeToken;
export const GET_TOKEN = () => useAuthStore.getState().token;
export const useTokenExist = () => {
  return useAuthStore((state) => (state.hasHydrated ? state.token : undefined));
};
export const useUserInfo = () => {
  return useAuthStore((state) => state.userInfo);
};

export const useLoginMutation = () => {
  const orpc = useOrpc();
  const login = orpc.auth.login.mutationOptions({
    onSuccess: (data) => {
      const { token } = data;
      SET_TOKEN(token);
    },
  });
  return useMutation(login);
};
export const useRegistrationMutation = () => {
  const orpc = useOrpc();
  const registration = orpc.auth.register.mutationOptions({
    onSuccess: (data) => {
      const { token } = data;
      SET_TOKEN(token);
    },
  });
  return useMutation(registration);
};
export const useCheckAuth = () => {
  const orpc = useOrpc();
  return useQuery(orpc.auth.check.queryOptions());
};

export const useCreateNoteMutation = () => {
  const orpc = useOrpc();
  const queryClient = useQueryClient();
  const param = orpc.notes.createNote.mutationOptions({
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.notes.getNotes.key(),
      });
    },
  });
  return useMutation(param);
};

export const useUpdateNoteMutation = () => {
  const orpc = useOrpc();
  const queryClient = useQueryClient();
  const param = orpc.notes.updateNote.mutationOptions({
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.notes.getNotes.key(),
      });
    },
  });
  return useMutation(param);
};

export const useDeleteNoteMutation = () => {
  const orpc = useOrpc();
  const queryClient = useQueryClient();

  const param = orpc.notes.deleteNote.mutationOptions({
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.notes.getNotes.key(),
      });
    },
  });
  return useMutation(param);
};

export const useGetNotesQuery = () => {
  const orpc = useOrpc();
  const param = orpc.notes.getNotes.queryOptions();
  return useQuery(param);
};
