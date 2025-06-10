/**
 * Authentication type definitions
 * Aligned with Better Auth and our extended user model
 */

export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CREATOR = 'CREATOR',
  CLIENT = 'CLIENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  // Extended fields for our app (simplified to match Better Auth schema)
  role?: string;
  phone?: string;
  banned?: boolean;
  banReason?: string;
  banExpires?: Date;
  firstName?: string;
  lastName?: string;
}

export interface UserRates {
  hourly?: number;
  perPost?: number;
  perCampaign?: number;
  currency: string;
}

export interface UserAvailability {
  daysPerWeek: number;
  hoursPerDay: number;
  timezone: string;
  blockedDates?: Date[];
}

export interface Session {
  user: User;
  expires: Date;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role?: string;
}

export interface AuthResponse {
  user: User;
  session: Session;
  token?: string;
}
