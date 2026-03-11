import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getMe } from "../api/client";
import { firebaseAuth } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("abr_token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("abr_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [initializing, setInitializing] = useState(true);

  const syncProfile = async (idToken) => {
    const data = await getMe(idToken);
    setUser(data.user);
    localStorage.setItem("abr_user", JSON.stringify(data.user));
    return data.user;
  };

  const completeFirebaseSession = async () => {
    const currentUser = firebaseAuth.currentUser;
    if (!currentUser) {
      return null;
    }

    const idToken = await currentUser.getIdToken();
    setToken(idToken);
    localStorage.setItem("abr_token", idToken);

    try {
      const profile = await syncProfile(idToken);
      return { token: idToken, user: profile };
    } catch (_error) {
      const fallbackUser = {
        id: currentUser.uid,
        name: currentUser.displayName || currentUser.email || "User",
        email: currentUser.email,
        role: "employee",
      };
      setUser(fallbackUser);
      localStorage.setItem("abr_user", JSON.stringify(fallbackUser));
      return { token: idToken, user: fallbackUser };
    }
  };

  const logout = async () => {
    await signOut(firebaseAuth);
    setToken(null);
    setUser(null);
    localStorage.removeItem("abr_token");
    localStorage.removeItem("abr_user");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (!firebaseUser) {
        setToken(null);
        setUser(null);
        localStorage.removeItem("abr_token");
        localStorage.removeItem("abr_user");
        setInitializing(false);
        return;
      }

      try {
        await completeFirebaseSession();
      } finally {
        setInitializing(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      initializing,
      completeFirebaseSession,
      logout,
    }),
    [token, user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
