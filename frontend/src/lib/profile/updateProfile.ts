/**
 * Profile update utilities
 */

import { supabase } from "@/lib/supabaseClient";
import type { ProfileFormData, ProfileUpdateResult, User } from "./types";

/**
 * Updates user profile information in the database
 */
export async function updateUserProfile(
  userId: string,
  formData: ProfileFormData
): Promise<ProfileUpdateResult> {
  try {
    const { data, error } = await supabase
      .from("users")
      .update(formData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error,
      };
    }

    return {
      data: data as User,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error("Unknown error occurred during update"),
    };
  }
}
