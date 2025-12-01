// src/hooks/useAuth.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type AuthUser = {
  id: string;
  email: string;
  username?: string | null;
  name?: string | null;
  profile_picture?: string | null;
  phone?: string | null;
  bio?: string | null;
  created_at?: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from 'users' table
  const fetchUserProfile = async (id: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data;
  };

  // Fetch both auth + profile data together
  const loadUser = async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        setUser(null);
        return;
      }

      const profile = await fetchUserProfile(authUser.id);
      setUser({
        id: authUser.id,
        email: authUser.email!,
        ...profile,
      });
    } catch (err) {
      console.error("Error loading user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial load
    loadUser();

    // Subscribe to auth changes (without async deadlock)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Just reload in background, don't block render
        loadUser();
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth actions
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    await loadUser(); // refresh profile
    return data.user;
  };

  const register = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    await loadUser();
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Impersonation State
  const [impersonatedUserId, setImpersonatedUserId] = useState<string | null>(null);
  const [impersonatedUserEmail, setImpersonatedUserEmail] = useState<string | null>(null);

  // Computed property for effective user ID
  const effectiveUserId = impersonatedUserId || user?.id;
  const isImpersonating = !!impersonatedUserId;

  // Impersonation Actions
  const startImpersonation = (userId: string, email: string) => {
    setImpersonatedUserId(userId);
    setImpersonatedUserEmail(email);
  };

  const stopImpersonation = () => {
    setImpersonatedUserId(null);
    setImpersonatedUserEmail(null);
  };

  return { 
    user, 
    loading, 
    login, 
    register, 
    logout, 
    setUser,
    // Impersonation exports
    impersonatedUserId,
    impersonatedUserEmail,
    effectiveUserId,
    isImpersonating,
    startImpersonation,
    stopImpersonation
  };
}
