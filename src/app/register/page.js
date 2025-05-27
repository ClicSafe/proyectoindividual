'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "firebase/auth";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const router = useRouter();
  const { signup, signInWithGoogle, signInWithFacebook } = useAuth();
  
  // Handle email-password registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate form
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    
    if (!agreeTerms) {
      return setError("You must agree to the Terms of Service and Privacy Policy.");
    }
    
    setLoading(true);
    
    try {
      // Create user with email and password
      const userCredential = await signup(email, password);
      
      // Update user profile with display name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      // Redirect to homepage after successful registration
      router.push("/");
    } catch (error) {
      let errorMessage;
      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Email already in use. Try logging in instead.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
        case "auth/weak-password":
          errorMessage = "Password is too weak. Use at least 6 characters.";
          break;
        default:
          errorMessage = "Failed to create account. Please try again.";
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950">
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
      <main className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 md:p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Crea una cuenta
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Únete a StoryRecs para descubrir recomendaciones personalizadas
              </p>
            </div>

            {error && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="name">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Ingresa tu nombre"
                  required
                />
              </div>

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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password">
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Crea una contraseña"
                  minLength={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" htmlFor="password-confirm">
                  Confirma tu contraseña
                </label>
                <input
                  type="password"
                  id="password-confirm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  placeholder="Confirma tu contraseña"
                  required
                />
              </div>

              <div className="flex items-start">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                  required
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                  Estoy de acuerdo con los{" "}
                  <Link href="/terms" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Términos de Servicio
                  </Link>{" "}
                  y{" "}
                  <Link href="/privacy" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Política de Privacidad
                  </Link>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors disabled:opacity-70"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>
            </form>

           

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ya tienes una cuenta?{" "}
                <Link
                  href="/login"
                  className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} StoryRecs. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
