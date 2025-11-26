/**
 * TypeScript interfaces for the User Profile module
 * 
 * Note: User type matches the AuthUser type from useAuth hook
 */

export interface ProfileFormData {
  name: string;
  username: string;
  phone: string;
  bio: string;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  username?: string | null;
  phone?: string | null;
  bio?: string | null;
  profile_picture?: string | null;
  created_at?: string | null;
}

export interface ProfileUpdateResult {
  data: User | null;
  error: Error | null;
}

export interface AvatarUploadResult {
  publicUrl: string | null;
  error: Error | null;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}
