import { useEffect, useState } from "react";
import type { AuthError, Session, User } from "@supabase/supabase-js";

import { supabase } from "../utils/supabase";

type SignUpData = {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const { data, error } = await supabase.auth.getSession();

      if (!mounted) return;

      if (error) {
        setError(error);
      } else {
        setSession(data.session);
        setUser(data.session?.user ?? null);
      }

      setIsLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      setError(null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signUp({
    firstname,
    lastname,
    username,
    email,
    password,
  }: SignUpData) {
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          username: username.trim().toLowerCase(),
        },
      },
    });

    if (error) {
      setError(error);
      throw error;
    }

    return data;
  }

  async function signIn(email: string, password: string) {
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error);
      throw error;
    }

    return data;
  }

  async function signOut() {
    setError(null);

    const { error } = await supabase.auth.signOut();

    if (error) {
      setError(error);
      throw error;
    }
  }

  return {
    user,
    session,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
  };
}
