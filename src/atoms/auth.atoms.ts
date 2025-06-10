/**
 * Authentication state management with Jotai
 * Global auth atoms for the application
 */

import type { User } from '@/types/auth.types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Base atoms
export const userAtom = atom<User | null>(null);
export const sessionAtom = atom<any | null>(null);
export const isLoadingAtom = atom<boolean>(true);
export const isAuthenticatedAtom = atomWithStorage<boolean>('isAuthenticated', false);

// Derived atoms
export const authStateAtom = atom((get) => ({
  user: get(userAtom),
  session: get(sessionAtom),
  isLoading: get(isLoadingAtom),
  isAuthenticated: get(isAuthenticatedAtom),
}));

// Action atoms
export const setUserAtom = atom(null, (_get, set, user: User | null) => {
  set(userAtom, user);
  set(isAuthenticatedAtom, !!user);
});

export const setSessionAtom = atom(null, (_get, set, session: any) => {
  set(sessionAtom, session);
});

export const setLoadingAtom = atom(null, (_get, set, loading: boolean) => {
  set(isLoadingAtom, loading);
});

export const updateUserAtom = atom(null, (get, set, userData: Partial<User>) => {
  const currentUser = get(userAtom);
  if (currentUser) {
    set(userAtom, { ...currentUser, ...userData });
  }
});

export const clearAuthAtom = atom(null, (_get, set) => {
  set(userAtom, null);
  set(sessionAtom, null);
  set(isAuthenticatedAtom, false);
  set(isLoadingAtom, false);
});
