'use client';

import { createContext, useContext, useState, useEffect } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
  sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "../firebase/config";
import { useRouter } from "next/navigation";

// Create the authentication context
const AuthContext = createContext({});

// Custom provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    
    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);
  
  // Sign up with email and password
  const signup = async (email, password) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };
  
  // Sign in with email and password
  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      throw error;
    }
  };
  
  // Sign out
  const logout = async () => {
    try {
      await signOut(auth);
      router.push("/"); // Redirect to home page after logout
      return true;
    } catch (error) {
      console.error("Error signing out: ", error);
      throw error;
    }
  };
  
  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error) {
      throw error;
    }
  };
  
  // Sign in with Facebook
  const signInWithFacebook = async () => {
    try {
      const provider = new FacebookAuthProvider();
      return await signInWithPopup(auth, provider);
    } catch (error) {
      throw error;
    }
  };
  
  // Reset password
  const resetPassword = async (email) => {
    try {
      return await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  };
  
  // Context value
  const value = {
    user,
    loading,
    signup,
    login,
    logout,
    signInWithGoogle,
    signInWithFacebook,
    resetPassword
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
