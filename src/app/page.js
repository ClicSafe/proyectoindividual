'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LogoutButton from "../components/LogoutButton";
import ThemeToggle from "../components/ThemeToggle";
import { getPopularMovies, getTopRatedMovies, getNowPlayingMovies } from "../services/movieApi";
import { getPopularBooks } from "../services/bookApi";

export default function Home() {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Set mounted state for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Fetch data from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [popular, topRated, nowPlaying, books] = await Promise.all([
          getPopularMovies(),
          getTopRatedMovies(),
          getNowPlayingMovies(),
          getPopularBooks()
        ]);

        setPopularMovies(popular.slice(0, 4));
        setTopRatedMovies(topRated.slice(0, 4));
        setNewMovies(nowPlaying.slice(0, 4));
        setPopularBooks(books.slice(0, 4));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show skeleton if not mounted yet (hydration)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 animate-pulse">
        <div className="h-16 bg-white/80 dark:bg-slate-900/80 shadow-sm mb-4"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
            <div className="md:w-1/2 h-64"></div>
            <div className="md:w-1/2 h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          </div>
          <div className="space-y-16">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, j) => (
                    <div key={j} className="h-80 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950">
      {/* Header with login/register */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex justify-between items-center p-4">
          <Link href="/" className="flex items-center gap-2">
       
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              StoryRecs
            </span>
          </Link>

          <div className="flex items-center gap-4">
       
            
            {!user ? (
              // Show login/register buttons for non-authenticated users
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
                >
                  Registrarse
                </Link>
              </>
            ) : (
              // Show user profile and dashboard link for authenticated users
              <>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
                >
                  Panel
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                      {user.displayName
                        ? user.displayName.charAt(0).toUpperCase()
                        : user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-sm hidden sm:block">
                      {user.displayName || user.email.split("@")[0]}
                    </span>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <Link
                        href="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Panel
                      </Link>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Perfil  
                      </Link>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <LogoutButton
                        className="w-full justify-start text-sm"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        {/* Hero section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16">
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
              Descubre Tu Próxima Historia Favorita
            </h1>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6">
              Recomendaciones personalizadas de las mejores películas y libros basadas en
              tus gustos y preferencias únicas.
            </p>
            <div className="flex gap-4">
              <Link
                href={user ? "/dashboard" : "/register"}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
              >
                {user ? "Ver Mi Panel" : "Comenzar"}
              </Link>
              <Link
                href="#features"
                className="px-6 py-3 rounded-full border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
              >
                Saber Más
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="relative h-72 md:h-96 w-full rounded-2xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/40 via-indigo-600/30 to-blue-500/20 z-10"></div>
              {/* Background grid pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="h-full w-full" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                }}></div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="text-center px-8">
                  <div className="text-white text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">StoryRecs</div>
                  <p className="text-white/90 text-lg md:text-xl drop-shadow-lg">Tu portal a mundos de historias infinitas</p>
                </div>
              </div>
              
              {/* Floating movie and book covers */}
              <div className="absolute -bottom-6 -left-6 w-32 h-48 rounded-lg shadow-xl transform rotate-12 z-10 bg-gradient-to-br from-indigo-500/90 to-purple-600/90"></div>
              <div className="absolute -top-6 -right-6 w-32 h-48 rounded-lg shadow-xl transform -rotate-12 z-10 bg-gradient-to-br from-blue-500/90 to-indigo-600/90"></div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Nuevos estrenos section */}
            <section className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Nuevos Estrenos
                </h2>
                
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {newMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Link href={`/movie/${movie.id}`} className="block">
                      <div className="h-56 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        {movie.image ? (
                          <Image
                            src={movie.image}
                            alt={movie.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/80 via-indigo-600/70 to-blue-700/60 flex items-center justify-center">
                            <div className="text-white text-xl font-medium p-4 text-center">
                              {movie.title}
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded z-20">
                          NUEVO
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate" title={movie.title}>
                            {movie.title}
                          </h3>
                          <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded text-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-yellow-500 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-yellow-800 dark:text-yellow-200">
                              {movie.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate" title={movie.genre}>
                          {movie.genre}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Películas populares section */}
            <section className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Películas Populares
                </h2>
            
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {popularMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Link href={`/movie/${movie.id}`} className="block">
                      <div className="h-56 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        {movie.image ? (
                          <Image
                            src={movie.image}
                            alt={movie.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/80 via-indigo-600/70 to-blue-700/60 flex items-center justify-center">
                            <div className="text-white text-xl font-medium p-4 text-center">
                              {movie.title}
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-indigo-600/80 text-white text-xs font-bold px-2 py-1 rounded z-20">
                          POPULAR
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate" title={movie.title}>
                            {movie.title}
                          </h3>
                          <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded text-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-yellow-500 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-yellow-800 dark:text-yellow-200">
                              {movie.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate" title={movie.genre}>
                          {movie.genre}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Películas mejor valoradas section */}
            <section className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Películas Mejor Valoradas
                </h2>
          
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {topRatedMovies.map((movie) => (
                  <div
                    key={movie.id}
                    className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Link href={`/movie/${movie.id}`} className="block">
                      <div className="h-56 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        {movie.image ? (
                          <Image
                            src={movie.image}
                            alt={movie.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/80 via-indigo-600/70 to-blue-700/60 flex items-center justify-center">
                            <div className="text-white text-xl font-medium p-4 text-center">
                              {movie.title}
                            </div>
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-green-600/80 text-white text-xs font-bold px-2 py-1 rounded z-20">
                          TOP
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate" title={movie.title}>
                            {movie.title}
                          </h3>
                          <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded text-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-yellow-500 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-yellow-800 dark:text-yellow-200">
                              {movie.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate" title={movie.genre}>
                          {movie.genre}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Libros populares section */}
            <section className="mb-16">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Libros Populares
                </h2>
           
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {popularBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <Link href={`/book/${book.id}`} className="block">
                      <div className="h-56 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        {book.image ? (
                          <Image
                            src={book.image}
                            alt={book.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/80 via-purple-600/70 to-pink-500/60 flex items-center justify-center">
                            <div className="text-white text-xl font-medium p-4 text-center">
                              {book.title}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate" title={book.title}>
                            {book.title}
                          </h3>
                          <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded text-sm">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 text-yellow-500 mr-1"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-yellow-800 dark:text-yellow-200">
                              {typeof book.rating === 'number' ? book.rating.toFixed(1) : book.rating}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate" title={book.author}>
                          {book.author}
                        </p>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Features section */}
            <section id="features" className="py-8 mb-16">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                Características principales de StoryRecs
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className={`rounded-xl p-6 text-center ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-shadow`}>
                  <div className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Recomendaciones Personalizadas</h3>
                  <p className={`text-${darkMode ? 'gray-400' : 'gray-600'}`}>
                    Algoritmos avanzados que aprenden de tus preferencias para recomendarte el contenido perfecto.
                  </p>
                </div>
                
                <div className={`rounded-xl p-6 text-center ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-shadow`}>
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/30 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Biblioteca Completa</h3>
                  <p className={`text-${darkMode ? 'gray-400' : 'gray-600'}`}>
                    Miles de películas y libros catalogados con detalles completos para ayudarte a decidir qué ver o leer.
                  </p>
                </div>
                
                <div className={`rounded-xl p-6 text-center ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg hover:shadow-xl transition-shadow`}>
                  <div className="rounded-full bg-pink-100 dark:bg-pink-900/30 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-600 dark:text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Lista de Deseos</h3>
                  <p className={`text-${darkMode ? 'gray-400' : 'gray-600'}`}>
                    Guarda tus películas y libros favoritos para verlos después y compártelos con amigos.
                  </p>
                </div>
              </div>
            </section>

            {/* CTA section */}
            <section className="mb-16">
              <div className={`rounded-2xl p-8 md:p-12 ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-xl relative overflow-hidden`}>
                {/* Background decoration */}
                <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10"></div>
                <div className="absolute -top-12 -left-12 w-56 h-56 rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10"></div>
                
                <div className="relative z-10 max-w-3xl mx-auto text-center">
                  <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                    Comienza a descubrir historias hoy mismo
                  </h2>
                  <p className={`text-${darkMode ? 'gray-300' : 'gray-600'} text-lg mb-8 mx-auto max-w-2xl`}>
                    Únete a StoryRecs y recibe recomendaciones personalizadas de películas y libros adaptadas a tus gustos. Crea tu cuenta gratuita en menos de un minuto.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                      href="/register"
                      className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors"
                    >
                      Regístrate gratis
                    </Link>
                    <Link
                      href="/login"
                      className="px-8 py-3 rounded-full bg-transparent border border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center gap-2">
            <Image
              src="/next.svg"
              alt="Logo"
              width={30}
              height={30}
              className="dark:invert"
            />
            <span className="font-medium">StoryRecs</span>
          </div>

          <div className="flex gap-6">
            <Link
              href="/about"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Sobre Nosotros
            </Link>
            <Link
              href="/privacy"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Términos
            </Link>
            <Link
              href="/contact"
              className="text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              Contacto
            </Link>
          </div>

          <div className="mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} StoryRecs. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
