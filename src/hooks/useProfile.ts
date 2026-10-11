import { useCallback, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

export type Profile = {
  id: string;
  username: string | null;
  firstname: string;
  lastname: string;
  avatar_url: string | null;
  bio: string;
};

type UpdateProfileData = {
  username: string | null;
  firstname: string;
  lastname: string;
  avatar_url: string | null;
  bio: string;
};

export function useProfile(userId?: string) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setIsLoading(false);
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, firstname, lastname, avatar_url, bio")
        .eq("id", userId)
        .maybeSingle();

      if (error) throw error;

      setProfile(data as Profile | null);
    } catch (err) {
      setProfile(null);
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить профиль",
      );
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: UpdateProfileData) => {
    if (!userId) {
      throw new Error("Пользователь не авторизован");
    }

    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select("id, username, firstname, lastname, avatar_url, bio")
      .single();

    if (error) throw error;

    setProfile(data as Profile);
    return data as Profile;
  };

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}
