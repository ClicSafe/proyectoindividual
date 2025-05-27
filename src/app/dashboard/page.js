'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Import useTheme hook
import LogoutButton from "../../components/LogoutButton";
import ThemeToggle from "../../components/ThemeToggle";
import { db } from '../../firebase/config';
import { 
  collection, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { getPopularMovies, searchMovies } from '../../services/movieApi';
import { getPopularBooks, searchBooks } from '../../services/bookApi';
import { getMovieRecommendations, getBookRecommendations } from '../../services/recommendationService';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const { darkMode } = useTheme(); // Get darkMode state from context
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('discover');
  const [wishlist, setWishlist] = useState({ movies: [], books: [] });
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false); // Add mounted state for hydration

  // New states for API data
  const [movies, setMovies] = useState([]);
  const [books, setBooks] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [movieRecommendations, setMovieRecommendations] = useState([]);
  const [bookRecommendations, setBookRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Set mounted to true after hydration
  useEffect(() => {
    setMounted(true);
    
    // Check localStorage for tab selection
    if (typeof window !== 'undefined') {
      const savedTab = localStorage.getItem('dashboardTab');
      if (savedTab) {
        setActiveTab(savedTab);
        // Clear the value after using it
        localStorage.removeItem('dashboardTab');
      }
    }
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch user's wishlist from Firestore
  useEffect(() => {
    if (!user) return;

    // Set up real-time listeners for both movies and books wishlists
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
      const moviesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishlist(prev => ({ ...prev, movies: moviesData }));
    });

    const unsubscribeBooks = onSnapshot(booksQuery, (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWishlist(prev => ({ ...prev, books: booksData }));
      setLoadingWishlist(false);
    });

    return () => {
      unsubscribeMovies();
      unsubscribeBooks();
    };
  }, [user]);

  // Fetch movies from TMDB API
  useEffect(() => {
    const fetchMovies = async () => {
      setLoadingMovies(true);
      try {
        const data = await getPopularMovies();
        setMovies(data);
      } catch (error) {
        console.error("Failed to fetch movies:", error);
      } finally {
        setLoadingMovies(false);
      }
    };

    fetchMovies();
  }, []);

  // Fetch books from Google Books API
  useEffect(() => {
    const fetchBooks = async () => {
      setLoadingBooks(true);
      try {
        const data = await getPopularBooks();
        setBooks(data);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  // Generar recomendaciones cuando la wishlist cambia
  useEffect(() => {
    const generateRecommendations = async () => {
      if (loadingWishlist) return;
      
      setLoadingRecommendations(true);
      try {
        // Obtener recomendaciones basadas en la wishlist
        const movieRecs = await getMovieRecommendations(wishlist.movies);
        const bookRecs = await getBookRecommendations(wishlist.books);
        
        setMovieRecommendations(movieRecs);
        setBookRecommendations(bookRecs);
      } catch (error) {
        console.error("Error al generar recomendaciones:", error);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    generateRecommendations();
  }, [wishlist, loadingWishlist]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const movieResults = await searchMovies(searchQuery);
      const bookResults = await searchBooks(searchQuery);
      
      setMovies(movieResults);
      setBooks(bookResults);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Add item to wishlist
  const addToWishlist = async (item, type) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      const existingItems = type === 'movie' 
        ? wishlist.movies.filter(m => m.itemId === item.id)
        : wishlist.books.filter(b => b.itemId === item.id);

      if (existingItems.length === 0) {
        await addDoc(collection(db, 'wishlist'), {
          userId: user.uid,
          type,
          itemId: item.id,
          title: item.title,
          image: item.image,
          rating: item.rating,
          genre: item.genre,
          year: item.year,
          author: type === 'book' ? item.author : null,
          addedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      alert('Failed to add item to wishlist');
    }
  };

  // Remove item from wishlist
  const removeFromWishlist = async (wishlistItemId) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'wishlist', wishlistItemId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('Failed to remove item from wishlist');
    }
  };

  // Check if an item is in the wishlist
  const isInWishlist = (id, type) => {
    if (type === 'movie') {
      return wishlist.movies.some(m => m.itemId === id);
    } else {
      return wishlist.books.some(b => b.itemId === id);
    }
  };

  // If loading or not authenticated yet
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Cargando...</p>
        </div>
      </div>
    );
  }

  // Show skeleton if not mounted yet to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 animate-pulse">
        <div className="h-16 bg-white/80 dark:bg-slate-900/80 shadow-sm mb-4"></div>
        <div className="container mx-auto px-4">
          <div className="h-10 bg-white dark:bg-slate-800 rounded mb-8"></div>
          <div className="space-y-8">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
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
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-sm hidden sm:block">
                  {user.displayName || user.email.split('@')[0]}
                </span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <Link 
                    href="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Perfil
                  </Link>
                  <Link 
                    href="/" 
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Inicio
                  </Link>
                  <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                  <LogoutButton 
                    className="w-full justify-start text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Navigation */}
      <div className="bg-white dark:bg-slate-800 shadow-sm">
        <div className="container mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'discover'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Descubrir
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'wishlist'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Mi Wishlist
            </button>
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`py-4 px-6 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'recommendations'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Recomendaciones
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div>
            {/* Search Bar */}
            <div className="mb-8">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    className={`w-full px-4 py-2 pr-10 rounded-lg border transition-colors
                      ${darkMode 
                        ? 'border-gray-600 bg-slate-700 text-white focus:border-indigo-400' 
                        : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'} 
                      focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                    placeholder="Busca películas o libros..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className={`h-5 w-5 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  type="submit"
                  className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors
                    ${isSearching 
                      ? 'bg-indigo-400 text-white' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'} 
                    disabled:opacity-70`}
                  disabled={isSearching}
                >
                  {isSearching ? 'Buscando...' : 'Buscar'}
                </button>
              </form>
            </div>

            {/* Movies Section */}
            <section className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {searchQuery ? `Películas para "${searchQuery}"` : 'Películas Populares'}
                </h2>
                <Link href="/movies" className={`text-sm hover:underline transition-colors
                  ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}>
                  Ver todas
                </Link>
              </div>

              {loadingMovies ? (
                <div className="flex justify-center items-center h-48">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : movies.length === 0 ? (
                <div className={`rounded-xl p-8 text-center transition-colors
                  ${darkMode ? 'bg-slate-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  <p>
                    {searchQuery ? "No se encontraron películas para tu búsqueda." : "Error al cargar películas. Inténtalo de nuevo más tarde."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {movies.slice(0, 12).map((movie) => (
                    <div
                      key={movie.id}
                      className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all
                        ${darkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <Link href={`/movie/${movie.id}`} className="block h-48 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        {movie.image ? (
                          <Image
                            src={movie.image}
                            alt={movie.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div 
                            className={`absolute inset-0 bg-gradient-to-br from-purple-${
                              (parseInt(movie.id.slice(-1)) * 100) % 900 || 500
                            }/80 via-indigo-${(parseInt(movie.id.slice(-1)) * 200) % 900 || 600}/70 to-blue-${
                              (parseInt(movie.id.slice(-1)) * 300) % 900 || 700
                            }/60 flex items-center justify-center`}
                          >
                            <div className="text-white text-xl font-medium p-4 text-center">
                              {movie.title}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToWishlist(movie, 'movie');
                          }}
                          className={`absolute top-2 right-2 z-20 p-1.5 rounded-full transition-colors
                            ${isInWishlist(movie.id, 'movie')
                              ? 'bg-pink-500 text-white'
                              : darkMode 
                                ? 'bg-white/80 text-gray-700 hover:bg-pink-500 hover:text-white' 
                                : 'bg-white/80 text-gray-700 hover:bg-pink-500 hover:text-white'}`}
                          disabled={isInWishlist(movie.id, 'movie')}
                          aria-label={isInWishlist(movie.id, 'movie') ? "Quitar de la lista de deseos" : "Añadir a la lista de deseos"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </Link>
                      <div className="p-3">
                        <Link href={`/movie/${movie.id}`} className="block">
                          <div className="flex justify-between items-center">
                            <h3 
                              className={`font-medium text-sm truncate
                                ${darkMode ? 'text-white' : 'text-gray-900'}`} 
                              title={movie.title}
                            >
                              {movie.title}
                            </h3>
                            <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded text-xs">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 text-yellow-500 mr-0.5"
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
                          <p 
                            className={`text-xs mt-1 truncate
                              ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} 
                            title={movie.genre}
                          >
                            {movie.genre || "Desconocido"}
                          </p>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Books Section */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {searchQuery ? `Libros para "${searchQuery}"` : 'Libros Populares'}
                </h2>
                <Link href="/books" className={`text-sm hover:underline transition-colors
                  ${darkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}>
                  Ver todos
                </Link>
              </div>

              {loadingBooks ? (
                <div className="flex justify-center items-center h-48">
                  <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : books.length === 0 ? (
                <div className={`rounded-xl p-8 text-center transition-colors
                  ${darkMode ? 'bg-slate-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                  <p>
                    {searchQuery ? "No se encontraron libros para tu búsqueda." : "Error al cargar libros. Inténtalo de nuevo más tarde."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {books.slice(0, 12).map((book) => (
                    <div
                      key={book.id}
                      className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all
                        ${darkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white hover:bg-gray-50'}`}
                    >
                      <Link href={`/book/${book.id}`} className="block h-48 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                        {book.image ? (
                          <Image
                            src={book.image}
                            alt={book.title}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        ) : (
                          <div 
                            className={`absolute inset-0 bg-gradient-to-br from-indigo-${
                              (parseInt(book.id.slice(-1)) * 200) % 900 || 500
                            }/80 via-purple-${(parseInt(book.id.slice(-1)) * 100) % 900 || 600}/70 to-pink-${
                              (parseInt(book.id.slice(-1)) * 300) % 900 || 500
                            }/60 flex items-center justify-center`}
                          >
                            <div className="text-white text-xl font-medium p-4 text-center">
                              {book.title}
                            </div>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addToWishlist(book, 'book');
                          }}
                          className={`absolute top-2 right-2 z-20 p-1.5 rounded-full transition-colors
                            ${isInWishlist(book.id, 'book')
                              ? 'bg-pink-500 text-white'
                              : darkMode 
                                ? 'bg-white/80 text-gray-700 hover:bg-pink-500 hover:text-white' 
                                : 'bg-white/80 text-gray-700 hover:bg-pink-500 hover:text-white'}`}
                          disabled={isInWishlist(book.id, 'book')}
                          aria-label={isInWishlist(book.id, 'book') ? "Quitar de la lista de deseos" : "Añadir a la lista de deseos"}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </Link>
                      <div className="p-3">
                        <Link href={`/book/${book.id}`} className="block">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate" title={book.title}>
                              {book.title}
                            </h3>
                            <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded text-xs">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 text-yellow-500 mr-0.5"
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
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={book.author}>
                            {book.author}
                          </p>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* Wishlist Tab */}
        {activeTab === 'wishlist' && (
          <div>
            {loadingWishlist ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {/* Movies Wishlist */}
                <section className="mb-12">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                    Lista de Películas
                  </h2>

                  {wishlist.movies.length === 0 ? (
                    <div className={`rounded-xl p-8 text-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                      <div className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Aún no has añadido películas a tu lista de deseos.
                      </div>
                      <button
                        onClick={() => setActiveTab('discover')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors
                          ${darkMode 
                            ? 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/30' 
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                      >
                        Descubrir Películas
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.movies.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex
                            ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                        >
                          {/* Imagen clickeable */}
                          <Link href={`/movie/${item.itemId}`} className="w-1/3 relative">
                            {item.image ? (
                              <div className="relative h-full">
                                <Image 
                                  src={item.image} 
                                  alt={item.title}
                                  fill
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                            ) : (
                              <div 
                                className={`absolute inset-0 bg-gradient-to-br from-purple-${
                                  (parseInt(item.id.slice(-1)) * 100) % 900 || 500
                                }/80 via-indigo-${(parseInt(item.id.slice(-1)) * 200) % 900 || 600}/70 to-blue-${
                                  (parseInt(item.id.slice(-1)) * 300) % 900 || 700
                                }/60 flex items-center justify-center`}
                              >
                                <div className="text-white text-lg font-medium p-2 text-center">
                                  {item.title}
                                </div>
                              </div>
                            )}
                          </Link>
                          <div className="w-2/3 p-4">
                            <Link href={`/movie/${item.itemId}`} className="block">
                              <div className="flex justify-between">
                                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {item.title}
                                </h3>
                                <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded text-xs">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 text-yellow-500 mr-0.5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-yellow-800 dark:text-yellow-200">
                                    {item.rating}
                                  </span>
                                </div>
                              </div>
                              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {item.genre}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {item.year}
                              </p>
                            </Link>
                            
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => removeFromWishlist(item.id)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors
                                  ${darkMode 
                                    ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' 
                                    : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Books Wishlist */}
                <section>
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
                    Lista de Libros
                  </h2>

                  {wishlist.books.length === 0 ? (
                    <div className={`rounded-xl p-8 text-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
                      <div className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Aún no has añadido libros a tu lista de deseos.
                      </div>
                      <button
                        onClick={() => setActiveTab('discover')}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors
                          ${darkMode 
                            ? 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-800/30' 
                            : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                      >
                        Descubrir Libros
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.books.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow flex
                            ${darkMode ? 'bg-slate-800' : 'bg-white'}`}
                        >
                          {/* Imagen clickeable */}
                          <Link href={`/book/${item.itemId}`} className="w-1/3 relative">
                            {item.image ? (
                              <div className="relative h-full">
                                <Image 
                                  src={item.image} 
                                  alt={item.title}
                                  fill
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                            ) : (
                              <div 
                                className={`absolute inset-0 bg-gradient-to-br from-indigo-${
                                  (parseInt(item.id.slice(-1)) * 200) % 900 || 500
                                }/80 via-purple-${(parseInt(item.id.slice(-1)) * 100) % 900 || 600}/70 to-pink-${
                                  (parseInt(item.id.slice(-1)) * 300) % 900 || 500
                                }/60 flex items-center justify-center`}
                              >
                                <div className="text-white text-lg font-medium p-2 text-center">
                                  {item.title}
                                </div>
                              </div>
                            )}
                          </Link>
                          <div className="w-2/3 p-4">
                            <Link href={`/book/${item.itemId}`} className="block">
                              <div className="flex justify-between">
                                <h3 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                  {item.title}
                                </h3>
                                <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded text-xs">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-3 w-3 text-yellow-500 mr-0.5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-yellow-800 dark:text-yellow-200">
                                    {item.rating}
                                  </span>
                                </div>
                              </div>
                              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {item.author}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {item.genre}
                              </p>
                            </Link>
                            
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={() => removeFromWishlist(item.id)}
                                className={`px-3 py-1 text-xs rounded-full transition-colors
                                  ${darkMode 
                                    ? 'bg-red-900/20 text-red-400 hover:bg-red-900/40' 
                                    : 'bg-red-100 text-red-600 hover:bg-red-200'}`}
                              >
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div className={`rounded-xl p-8 ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              Recomendaciones personalizadas
            </h2>
            
            {loadingRecommendations ? (
              <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Recomendaciones de Películas */}
                <section>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Películas que podrían gustarte
                  </h3>
                  
                  {movieRecommendations.length === 0 ? (
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'} text-center`}>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Añade más películas a tu lista de deseos para obtener recomendaciones personalizadas.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {movieRecommendations.map((movie) => (
                        <div
                          key={movie.id}
                          className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all
                            ${darkMode ? 'bg-slate-700 hover:bg-slate-650' : 'bg-white hover:bg-gray-50'}`}
                        >
                          <Link href={`/movie/${movie.id}`} className="block h-48 relative">
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
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToWishlist(movie, 'movie');
                              }}
                              className={`absolute top-2 right-2 z-20 p-1.5 rounded-full transition-colors
                                ${isInWishlist(movie.id, 'movie')
                                  ? 'bg-pink-500 text-white'
                                  : darkMode 
                                    ? 'bg-white/80 text-gray-700 hover:bg-pink-500 hover:text-white' 
                                    : 'bg-white/80 text-gray-700 hover:bg-pink-500 hover:text-white'}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </Link>
                          <div className="p-3">
                            <div className="flex justify-between items-center">
                              <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={movie.title}>
                                {movie.title}
                              </h4>
                              <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded text-xs">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 text-yellow-500 mr-0.5"
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
                            <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} title={movie.genre}>
                              {movie.genre || "Desconocido"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Recomendaciones de Libros */}
                <section>
                  <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                    Libros que podrían gustarte
                  </h3>
                  
                  {bookRecommendations.length === 0 ? (
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-slate-700/50' : 'bg-gray-100'} text-center`}>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Añade más libros a tu lista de deseos para obtener recomendaciones personalizadas.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {bookRecommendations.map((book) => (
                        <div
                          key={book.id}
                          className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all
                            ${darkMode ? 'bg-slate-700 hover:bg-slate-650' : 'bg-white hover:bg-gray-50'}`}
                        >
                          <Link href={`/book/${book.id}`} className="block h-48 relative">
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
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addToWishlist(book, 'book');
                              }}
                              className={`absolute top-2 right-2 z-20 p-1.5 rounded-full transition-colors
                                ${isInWishlist(book.id, 'book')
                                  ? 'bg-pink-500 text-white'
                                  : darkMode 
                                    ? 'bg-white/80 text-gray-700 hover:bg-pink-500 hover:text-white' 
                                    : 'bg-white/80 text-gray-700 hover:bg-pink-500 hover:text-white'}`}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </Link>
                          <div className="p-3">
                            <div className="flex justify-between items-center">
                              <h4 className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-900'}`} title={book.title}>
                                {book.title}
                              </h4>
                              <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-1.5 py-0.5 rounded text-xs">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-3 w-3 text-yellow-500 mr-0.5"
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
                            <p className={`text-xs mt-1 truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} title={book.author}>
                              {book.author}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Las recomendaciones se basan en los géneros y autores más frecuentes en tu lista de deseos.
                    Cuanto más items añadas a tu wishlist, más precisas serán las recomendaciones.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
