/**
 * Avatar upload and validation utilities
 */

import { supabase } from "@/lib/supabaseClient";
import type { AvatarUploadResult, FileValidationResult } from "./types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

/**
 * Validates an avatar file for type and size
 */
export function validateAvatarFile(file: File): FileValidationResult {
  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.",
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds 5MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Uploads a user avatar to Supabase storage and updates the user record
 */
export async function uploadUserAvatar(userId: string, file: File): Promise<AvatarUploadResult> {
  try {
    // Validate file first
    const validation = validateAvatarFile(file);
    if (!validation.valid) {
      return {
        publicUrl: null,
        error: new Error(validation.error),
      };
    }

    // Generate unique file path
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${timestamp}.${fileExt}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from("profile_pictures")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      return {
        publicUrl: null,
        error: uploadError,
      };
    }

    // Get public URL
    const { data } = supabase.storage.from("profile_pictures").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    // Update user record with new avatar URL
    const { error: updateError } = await supabase
      .from("users")
      .update({ profile_picture: publicUrl })
      .eq("id", userId);

    if (updateError) {
      return {
        publicUrl: null,
        error: updateError,
      };
    }

    return {
      publicUrl,
      error: null,
    };
  } catch (err) {
    return {
      publicUrl: null,
      error: err instanceof Error ? err : new Error("Unknown error occurred during upload"),
    };
  }
}
