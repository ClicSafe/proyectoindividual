'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getMovieDetails, getMovieVideos } from '../../../services/movieApi';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useTheme } from '../../../context/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';

export default function MovieDetail() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { darkMode } = useTheme();
  const router = useRouter();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  const [videos, setVideos] = useState({ bestVideo: null, allVideos: [] });
  const [mounted, setMounted] = useState(false);

  // Set mounted for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch movie details
  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const movieData = await getMovieDetails(id);
        setMovie(movieData);
        
        // Also fetch videos
        const videosData = await getMovieVideos(id);
        setVideos(videosData);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  // Check if movie is in user's wishlist
  useEffect(() => {
    const checkWishlist = async () => {
      if (!user || !movie) return;
      
      try {
        const q = query(
          collection(db, 'wishlist'),
          where('userId', '==', user.uid),
          where('itemId', '==', id),
          where('type', '==', 'movie')
        );
        
        const querySnapshot = await getDocs(q);
        const isInList = !querySnapshot.empty;
        
        setIsInWishlist(isInList);
        
        if (isInList) {
          setWishlistId(querySnapshot.docs[0].id);
        }
      } catch (error) {
        console.error('Error checking wishlist:', error);
      }
    };

    checkWishlist();
  }, [user, id, movie]);

  // Toggle wishlist
  const toggleWishlist = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isInWishlist && wishlistId) {
        await deleteDoc(doc(db, 'wishlist', wishlistId));
        setIsInWishlist(false);
        setWishlistId(null);
      } else {
        const docRef = await addDoc(collection(db, 'wishlist'), {
          userId: user.uid,
          type: 'movie',
          itemId: id,
          title: movie.title,
          image: movie.poster,
          rating: movie.voteAverage || 0,
          genre: movie.genres,
          year: movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'Desconocido',
          addedAt: serverTimestamp()
        });
        setIsInWishlist(true);
        setWishlistId(docRef.id);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Error al actualizar la lista de deseos');
    }
  };

  // Format runtime to hours and minutes
  const formatRuntime = (minutes) => {
    if (!minutes) return 'Desconocido';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Calculate year from release date
  const getYear = (dateString) => {
    if (!dateString) return 'Desconocido';
    return new Date(dateString).getFullYear();
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Desconocido';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Display rating as stars
  const renderRating = (rating) => {
    // Ensure rating is a valid number before using toFixed
    const safeRating = typeof rating === 'number' ? rating : 0;
    
    return (
      <div className="flex items-center">
        <div className="flex items-center mr-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`h-5 w-5 ${
                safeRating / 2 >= star
                  ? 'text-yellow-500'
                  : safeRating / 2 >= star - 0.5
                  ? 'text-yellow-300'
                  : 'text-gray-300'
              }`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3.314l1.171 2.371 2.625.382-1.898 1.85.447 2.615L10 9.5l-2.345 1.032.447-2.615-1.898-1.85 2.625-.382L10 3.314z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>
        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          {safeRating.toFixed(1)} / 10
        </span>
      </div>
    );
  };

  // Show skeleton if not mounted yet to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 animate-pulse">
        <div className="h-16 bg-white/80 dark:bg-slate-900/80 shadow-sm mb-4"></div>
        <div className="container mx-auto px-4">
          <div className="h-96 w-full bg-gray-200 dark:bg-gray-700 rounded-lg mb-8"></div>
          <div className="h-10 w-2/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="h-32 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 flex justify-center items-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950">
        <header className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
          <div className="container mx-auto flex justify-between items-center p-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/next.svg"
                alt="Logo"
                width={40}
                height={40}
                className="dark:invert"
              />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                StoryRecs
              </span>
            </Link>
            
            <ThemeToggle />
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className={`p-8 rounded-lg ${darkMode ? 'bg-slate-800' : 'bg-white'} shadow-lg max-w-md w-full text-center`}>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Película no encontrada
            </h2>
            <p className={`mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Lo sentimos, no pudimos encontrar la película que estás buscando.
            </p>
            <Link 
              href="/"
              className={`inline-block px-6 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors`}
            >
              Volver al inicio
            </Link>
          </div>
        </main>
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
            {user && (
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
              >
                Panel
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Movie Header */}
      <div 
        className="h-80 md:h-96 relative bg-cover bg-center" 
        style={{
          backgroundImage: movie.backdrop 
            ? `url(${movie.backdrop})` 
            : 'linear-gradient(to right, rgb(135, 94, 245), rgb(79, 70, 229))'
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="container mx-auto px-4 h-full flex items-end pb-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-36 h-56 md:w-48 md:h-72 flex-shrink-0 rounded-lg overflow-hidden shadow-lg border-2 border-white/10">
              {movie.poster ? (
                <Image 
                  src={movie.poster} 
                  alt={movie.title}
                  width={192}
                  height={288}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center p-4">
                  <span className="text-white text-center font-bold">{movie.title}</span>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-white">{movie.title}</h1>
                <span className="text-gray-300">({getYear(movie.releaseDate)})</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-200 mb-4">
                <span>{formatDate(movie.releaseDate)}</span>
                <span>•</span>
                <span>{movie.genres}</span>
                <span>•</span>
                <span>{formatRuntime(movie.runtime)}</span>
              </div>
              
              {renderRating(movie.voteAverage)}
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={toggleWishlist}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors ${
                    isInWishlist
                      ? 'bg-pink-600 text-white hover:bg-pink-700'
                      : 'bg-white text-slate-900 hover:bg-gray-100'
                  }`}
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
                  {isInWishlist ? 'En tu lista' : 'Añadir a favoritos'}
                </button>
                
                {videos.bestVideo && (
                  <a
                    href={`https://www.youtube.com/watch?v=${videos.bestVideo.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-full font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                    Ver trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Movie Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-xl p-8 shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'} mb-8`}>
            <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Sinopsis
            </h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
              {movie.overview || 'No hay descripción disponible para esta película.'}
            </p>
          </div>

          {videos.allVideos.length > 1 && (
            <div className={`rounded-xl p-8 shadow-lg ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
              <h2 className={`text-2xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Vídeos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {videos.allVideos.slice(0, 4).map(video => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 rounded-lg ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors flex items-center gap-2`}
                  >
                    <div className="rounded-full bg-red-600 p-2 text-white flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-grow">
                      <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'} truncate`} title={video.name}>
                        {video.name}
                      </p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {video.type}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
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
