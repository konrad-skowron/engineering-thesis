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
  deleteUser,
  sendPasswordResetEmail
} from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signingOut: boolean;
  logIn: (email : string, password : string) => Promise<void>;
  signUp: (email : string, password : string) => Promise<void>;
  logInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  resetPassword: (email : string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signingOut: false,
  logIn: (email : string, password : string) => Promise.resolve(),
  signUp: (email : string, password : string) => Promise.resolve(),
  logInWithGoogle: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  deleteAccount: () => Promise.resolve(),
  resetPassword: (email : string) => Promise.resolve()
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
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Error loging in" + error);
      throw error;
    }
  };

  const signUp = async (email : string, password : string) => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      alert("Error signing in" + error);
      throw error;
    }
  };

  const logInWithGoogle = async () => {
    setLoading(true);
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

  const deleteAccount = async () => {
    setLoading(true);
    try {
      if (user) {
        await deleteUser(user);
      }
    } catch (error) {
      console.error("Error deleting account", error);
    }
  }

  const resetPassword = async (email : string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error resetting password", error);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signingOut, logIn, signUp, logInWithGoogle, signOut, deleteAccount, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}