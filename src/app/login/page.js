'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  const router = useRouter();
  const { login, signInWithGoogle, signInWithFacebook, resetPassword } = useAuth();
  
  // Handle email-password login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await login(email, password);
      router.push("/"); // Redirect to home page after successful login
    } catch (error) {
      let errorMessage;
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        default:
          errorMessage = "Failed to sign in. Please try again.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    
    try {
      await signInWithGoogle();
      router.push("/"); // Redirect to home page after successful login
    } catch (error) {
      setError("Failed to sign in with Google. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Facebook sign-in
  const handleFacebookSignIn = async () => {
    setError("");
    setLoading(true);
    
    try {
      await signInWithFacebook();
      router.push("/"); // Redirect to home page after successful login
    } catch (error) {
      setError("Failed to sign in with Facebook. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      await resetPassword(resetEmail);
      setResetEmailSent(true);
    } catch (error) {
      let errorMessage;
      switch (error.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/user-not-found":
          errorMessage = "No account found with this email.";
          break;
        default:
          errorMessage = "Failed to send reset email. Please try again.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 flex flex-col">
        {/* Header */}
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
            <div className="container mx-auto flex justify-between items-center p-4">
                <Link href="/" className="flex items-center gap-2">
        
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                        StoryRecs
                    </span>
                </Link>
            </div>
        </header>

        {/* Main content */}
        <main className="container mx-auto px-4 py-12 flex justify-center flex-grow">
            <div className="w-full max-w-md">
                {showResetForm ? (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Reset Password
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Enter your email to receive a reset link
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {resetEmailSent && (
                            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg mb-6">
                                Password reset email sent. Please check your inbox.
                            </div>
                        )}

                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="reset-email">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="reset-email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-70"
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowResetForm(false)}
                                    className="flex-1 px-6 py-3 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Bienvenido de nuevo
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Inicia sesión para continuar en StoryRecs
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="email">
                                    Correo electrónico
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">
                                        Contraseña
                                    </label>
                                    <button 
                                        type="button"
                                        onClick={() => setShowResetForm(true)}
                                        className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                                    >
                                        Olvidaste tu contraseña?
                                    </button>
                                </div>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                    placeholder="Ingresa tu contraseña"
                                    required
                                />
                            </div>



                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-70"
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                          

                            <div className="mt-2 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    No tienes cuenta?{" "}
                                    <Link
                                        href="/register"
                                        className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
                                    >
                                        Regístrate aquí
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>

        {/* Footer */}
        <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-6 mt-auto">
            <div className="container mx-auto px-4 text-center">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} StoryRecs. Todos los derechos reservados   .
                </div>
            </div>
        </footer>
    </div>
);
}
