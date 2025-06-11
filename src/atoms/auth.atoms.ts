/**
 * Authentication state management with Jotai
 * Global auth atoms for the application
 */

import type { User } from '@/types/auth.types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Base atoms
export const userAtom = atomWithStorage<User | null>('ugc-auth-user', null);
export const sessionAtom = atom<any | null>(null);
export const isLoadingAtom = atom<boolean>(true);

// Derived atoms - isAuthenticated is computed from user existence
export const authStateAtom = atom((get) => {
  const user = get(userAtom);
  const session = get(sessionAtom);
  const isLoading = get(isLoadingAtom);
  const isAuthenticated = !!user;
  
  return {
    user,
    session,
    isLoading,
    isAuthenticated,
  };
});

// Action atoms
export const setUserAtom = atom(null, (_get, set, user: User | null) => {
  set(userAtom, user);
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
  set(isLoadingAtom, false);
  // Clear localStorage token as well
  localStorage.removeItem('ugc-auth-token');
});
