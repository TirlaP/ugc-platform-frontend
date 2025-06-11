/**
 * Authentication types
 */

export type Role = 'ADMIN' | 'STAFF' | 'CLIENT' | 'CREATOR';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: Role | null;
  phone?: string | null;
  bio?: string | null;
  image?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  banned?: boolean;
  banReason?: string | null;
  banExpires?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: Role;
  organizationName?: string;
}

export interface UpdateProfileData {
  name?: string;
  phone?: string;
  bio?: string;
  firstName?: string;
  lastName?: string;
}