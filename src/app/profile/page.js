'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import ThemeToggle from '../../components/ThemeToggle';
import LogoutButton from '../../components/LogoutButton';

export default function Profile() {
  const { user, loading: authLoading } = useAuth();
  const { darkMode } = useTheme();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [wishlistCounts, setWishlistCounts] = useState({ movies: 0, books: 0 });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: '', text: '' });

  // Set mounted for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user, authLoading, router]);

  // Fetch wishlist statistics
  useEffect(() => {
    if (!user) return;

    const moviesQuery = query(
      collection(db, 'wishlist'),
      where('userId', '==', user.uid),
      where('type', '==', 'movie')
    );

    const booksQuery = query(
      collection(db, 'wishlist'),
      where('userId', '==', user.uid),
      where('type', '==', 'book')
    );

    const unsubscribeMovies = onSnapshot(moviesQuery, (snapshot) => {
      setWishlistCounts(prev => ({ ...prev, movies: snapshot.docs.length }));
    });

    const unsubscribeBooks = onSnapshot(booksQuery, (snapshot) => {
      setWishlistCounts(prev => ({ ...prev, books: snapshot.docs.length }));
    });

    return () => {
      unsubscribeMovies();
      unsubscribeBooks();
    };
  }, [user]);

  // Handle form submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsUpdating(true);
    try {
      if (displayName.trim() !== (user.displayName || '')) {
        // Update Firebase Auth
        await updateProfile(user, { displayName: displayName.trim() });
        
        // Optional: Update in Firestore if you store user profiles there
        // const userRef = doc(db, 'users', user.uid);
        // await updateDoc(userRef, { displayName: displayName.trim() });
        
        setUpdateMessage({
          type: 'success',
          text: 'Perfil actualizado correctamente'
        });
        
        setTimeout(() => {
          setUpdateMessage({ type: '', text: '' });
        }, 3000);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateMessage({
        type: 'error',
        text: 'Error al actualizar el perfil'
      });
      
      setTimeout(() => {
        setUpdateMessage({ type: '', text: '' });
      }, 3000);
    } finally {
      setIsUpdating(false);
    }
  };

  // Show skeleton if not mounted
  if (!mounted || authLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 animate-pulse">
        <div className="h-16 bg-white/80 dark:bg-slate-900/80 shadow-sm mb-4"></div>
        <div className="container mx-auto px-4 max-w-3xl py-8">
          <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
          <div className="h-16 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link href="/" className="flex items-center gap-2">
   
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              StoryRecs
            </span>
          </Link>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/dashboard" 
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
            >
              Panel
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 max-w-3xl py-8">
        {/* Profile Header */}
        <div className={`rounded-xl overflow-hidden mb-8 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
          <div className="h-32 bg-gradient-to-r from-purple-500 to-indigo-600 relative">
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 rounded-full border-4 border-white dark:border-slate-800 bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-5xl font-medium">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="pt-20 pb-6 px-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {user.displayName || user.email.split('@')[0]}
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  darkMode 
                    ? 'bg-slate-700 text-white hover:bg-slate-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isEditing ? 'Cancelar' : 'Editar perfil'}
              </button>
            </div>

            {updateMessage.text && (
              <div className={`mb-4 p-2 rounded text-sm ${
                updateMessage.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {updateMessage.text}
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="mt-6">
                <div className="mb-4">
                  <label 
                    htmlFor="displayName" 
                    className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  >
                    Nombre de visualización
                  </label>
                  <input 
                    id="displayName"
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border transition-colors
                      ${darkMode 
                        ? 'border-gray-600 bg-slate-700 text-white focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'} 
                      focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    placeholder="Tu nombre"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors
                      ${isUpdating 
                        ? 'bg-indigo-400 text-white' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'} 
                      disabled:opacity-70`}
                  >
                    {isUpdating ? 'Actualizando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        </div>

        {/* User Statistics */}
        <div className="mb-8">
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Tu actividad
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Películas guardadas</h3>
                <span className={`text-2xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {wishlistCounts.movies}
                </span>
              </div>
              <div className="mt-2">
                <Link
                  href="/dashboard"
                  onClick={() => {
                    // Almacenar en localStorage que debe abrir la pestaña wishlist
                    localStorage.setItem('dashboardTab', 'wishlist');
                  }}
                  className={`inline-block text-sm ${
                    darkMode 
                      ? 'text-indigo-400 hover:text-indigo-300' 
                      : 'text-indigo-600 hover:text-indigo-800'
                  } hover:underline transition-colors`}
                >
                  Ver lista de películas
                </Link>
              </div>
            </div>
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Libros guardados</h3>
                <span className={`text-2xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {wishlistCounts.books}
                </span>
              </div>
              <div className="mt-2">
                <Link
                  href="/dashboard"
                  onClick={() => {
                    // Almacenar en localStorage que debe abrir la pestaña wishlist
                    localStorage.setItem('dashboardTab', 'wishlist');
                  }}
                  className={`inline-block text-sm ${
                    darkMode 
                      ? 'text-indigo-400 hover:text-indigo-300' 
                      : 'text-indigo-600 hover:text-indigo-800'
                  } hover:underline transition-colors`}
                >
                  Ver lista de libros
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="mb-8">
          <h2 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Configuración de la cuenta
          </h2>
          <div className={`rounded-xl p-6 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
            <div className="space-y-6">
              <div>
                <h3 className={`text-base font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tema</h3>
                <div className="flex items-center">
                  <span className={`mr-4 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {darkMode ? 'Modo oscuro' : 'Modo claro'}
                  </span>
                  <ThemeToggle />
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className={`text-base font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Cerrar sesión</h3>
                <LogoutButton className="w-full sm:w-auto justify-center" />
              </div>
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
