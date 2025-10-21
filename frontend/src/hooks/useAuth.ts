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

  const fetchUserProfile = async (id: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error("Error fetching profile:", error);
    return data;
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const profile = await fetchUserProfile(user.id);
        setUser({
          id: user.id,
          email: user.email!,
          ...profile,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    };


    getUser();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email!});
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  };

  const register = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, login, register, logout, setUser };
}
