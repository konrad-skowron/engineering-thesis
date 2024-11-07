'use client'
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword,
} from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logIn: (email : string, password : string) => Promise<void>;
  signUp: (email : string, password : string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signingOut: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logIn: (email : string, password : string) => Promise.resolve(),
  signUp: (email : string, password : string) => Promise.resolve(),
  logInWithGoogle: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  signingOut: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logIn = async (email : string, password : string) => {
    setLoading(true);
    setSigningOut(false);
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email : string, password : string) => {
    setLoading(true);
    setSigningOut(false);
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logInWithGoogle = async () => {
    setLoading(true);
    setSigningOut(false);
    const provider = new GoogleAuthProvider();
  
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  }

  const signOut = async () => {
    setLoading(true);
    setSigningOut(true);
    try {
      return auth.signOut();
    } catch (error) {
      console.error("Error signing out with Google", error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logIn, signUp, logInWithGoogle, signOut, signingOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}