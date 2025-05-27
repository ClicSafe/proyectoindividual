'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getPopularBooks, searchBooks } from '../../services/bookApi';
import ThemeToggle from '../../components/ThemeToggle';

export default function AllBooks() {
  const { user, loading: authLoading } = useAuth();
  const { darkMode } = useTheme();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Set mounted for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset page when search changes
  useEffect(() => {
    if (isSearchActive) {
      setPage(1);
    }
  }, [searchQuery]);

  // Fetch books when page changes or search is performed
  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        let data;
        if (isSearchActive && searchQuery) {
          data = await searchBooks(searchQuery, page);
        } else {
          data = await getPopularBooks(page);
        }
        
        // Ensure data is always an array
        const booksArray = Array.isArray(data) ? data : [];
        setBooks(booksArray);
        
        // For Google Books API, we can estimate around 20 pages
        setTotalPages(20);
      } catch (err) {
        console.error("Error fetching books:", err);
        setError(err.message);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [page, isSearchActive, searchQuery]);

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setIsSearchActive(false);
      return;
    }

    setIsSearching(true);
    setIsSearchActive(true);
    setPage(1);
    
    try {
      const data = await searchBooks(searchQuery, 1);
      // Ensure data is always an array
      const booksArray = Array.isArray(data) ? data : [];
      setBooks(booksArray);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message);
      setBooks([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Show skeleton if not mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 animate-pulse">
        <div className="h-16 bg-white/80 dark:bg-slate-900/80 shadow-sm mb-4"></div>
        <div className="container mx-auto px-4">
          <div className="h-10 w-full bg-white dark:bg-slate-800 rounded mb-8"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="h-72 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Safety check for rendering books
  const renderBooks = Array.isArray(books) ? books : [];

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
            {user && (
              <div className="flex items-center gap-2">
                <Link 
                  href="/profile" 
                  className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-slate-800 px-3 py-1.5 rounded-full transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-medium">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm hidden sm:block text-gray-800 dark:text-gray-200">
                    {user.displayName || user.email.split('@')[0]}
                  </span>
                </Link>
                <Link 
                  href="/dashboard" 
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
                >
                  Panel
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {isSearchActive ? `Resultados para "${searchQuery}"` : 'Todos los Libros'}
            </h1>
            <Link 
              href="/dashboard"  
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              <span>Volver al Panel</span>
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-grow">
              <input
                type="text"
                className={`w-full px-4 py-2 pr-10 rounded-lg border transition-colors
                  ${darkMode 
                    ? 'border-gray-600 bg-slate-700 text-white focus:border-indigo-400' 
                    : 'border-gray-300 bg-white text-gray-900 focus:border-indigo-500'} 
                  focus:ring-2 focus:ring-indigo-500 focus:outline-none`}
                placeholder="Buscar libros..."
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
            {isSearchActive && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchActive(false);
                }}
                className={`cursor-pointer px-4 py-2 rounded-lg font-medium transition-colors
                  ${darkMode 
                    ? 'bg-slate-700 text-gray-200 hover:bg-slate-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              >
                Limpiar
              </button>
            )}
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className={`rounded-xl p-8 text-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Ha ocurrido un error al cargar los libros. Por favor, inténtalo de nuevo más tarde.
            </p>
          </div>
        ) : renderBooks.length === 0 ? (
          <div className={`rounded-xl p-8 text-center ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              No se encontraron libros que coincidan con tu búsqueda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {renderBooks.map((book) => (
              <div
                key={book.id}
                className={`rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all
                  ${darkMode ? 'bg-slate-800 hover:bg-slate-750' : 'bg-white hover:bg-gray-50'}`}
              >
                <Link href={`/book/${book.id}`} className="block h-64 relative">
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
                </Link>
                <div className="p-4">
                  <Link href={`/book/${book.id}`} className="block">
                    <div className="flex justify-between items-center mb-1">
                      <h3 
                        className={`font-medium truncate
                          ${darkMode ? 'text-white' : 'text-gray-900'}`} 
                        title={book.title}
                      >
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
                    <p className={`text-sm truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {book.author}
                    </p>
                    <p 
                      className={`text-sm truncate mt-1
                        ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} 
                      title={book.genre}
                    >
                      {book.genre || "Desconocido"}
                    </p>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-10 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-md ${
                darkMode 
                  ? 'bg-slate-700 text-white hover:bg-slate-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } border ${darkMode ? 'border-slate-600' : 'border-gray-300'} disabled:opacity-50`}
            >
              Anterior
            </button>

            {/* Page numbers */}
            <div className="flex space-x-1">
              {page > 3 && (
                <>
                  <button 
                    onClick={() => setPage(1)} 
                    className={`px-4 py-2 rounded-md ${
                      darkMode 
                        ? 'bg-slate-700 text-white hover:bg-slate-600' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    } border ${darkMode ? 'border-slate-600' : 'border-gray-300'}`}
                  >
                    1
                  </button>
                  {page > 4 && (
                    <span className="px-2 py-2 text-gray-500">...</span>
                  )}
                </>
              )}
              
              {/* Pages around current */}
              {[...Array(Math.min(totalPages, 5))].map((_, idx) => {
                let pageNumber;
                if (totalPages <= 5) {
                  pageNumber = idx + 1;
                } else if (page <= 3) {
                  pageNumber = idx + 1;
                } else if (page >= totalPages - 2) {
                  pageNumber = totalPages - 4 + idx;
                } else {
                  pageNumber = page - 2 + idx;
                }
                
                if (pageNumber <= totalPages && pageNumber > 0) {
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setPage(pageNumber)}
                      className={`px-4 py-2 rounded-md ${
                        page === pageNumber
                          ? darkMode
                            ? 'bg-indigo-700 text-white border-indigo-600'
                            : 'bg-indigo-600 text-white border-indigo-600'
                          : darkMode
                            ? 'bg-slate-700 text-white hover:bg-slate-600 border-slate-600'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
                      } border`}
                    >
                      {pageNumber}
                    </button>
                  );
                }
                return null;
              })}
              
              {/* Last pages */}
              {page < totalPages - 2 && (
                <>
                  {page < totalPages - 3 && (
                    <span className="px-2 py-2 text-gray-500">...</span>
                  )}
                  <button 
                    onClick={() => setPage(totalPages)} 
                    className={`px-4 py-2 rounded-md ${
                      darkMode 
                        ? 'bg-slate-700 text-white hover:bg-slate-600' 
                        : 'bg-white text-gray-700 hover:bg-gray-100'
                    } border ${darkMode ? 'border-slate-600' : 'border-gray-300'}`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-4 py-2 rounded-md ${
                darkMode 
                  ? 'bg-slate-700 text-white hover:bg-slate-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } border ${darkMode ? 'border-slate-600' : 'border-gray-300'} disabled:opacity-50`}
            >
              Siguiente
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} StoryRecs. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
