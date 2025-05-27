'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { getBookDetails } from '../../../services/bookApi';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export default function BookDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistId, setWishlistId] = useState(null);
  
  // Fetch book details
  useEffect(() => {
    const fetchBookData = async () => {
      setLoading(true);
      try {
        const bookData = await getBookDetails(id);
        
        if (!bookData) {
          throw new Error('Libro no encontrado');
        }
        
        setBook(bookData);
      } catch (err) {
        console.error('Error al cargar libro:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookData();
  }, [id]);
  
  // Check if book is in user's wishlist
  useEffect(() => {
    if (!user || !book) return;
    
    const checkWishlist = async () => {
      try {
        const q = query(
          collection(db, 'wishlist'),
          where('userId', '==', user.uid),
          where('type', '==', 'book'),
          where('itemId', '==', id)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          setIsInWishlist(true);
          setWishlistId(querySnapshot.docs[0].id);
        }
      } catch (err) {
        console.error('Error al verificar lista de deseos:', err);
      }
    };
    
    checkWishlist();
  }, [user, book, id]);
  
  // Add book to wishlist
  const addToWishlist = async () => {
    if (!user || !book) return;
    
    try {
      const docRef = await addDoc(collection(db, 'wishlist'), {
        userId: user.uid,
        type: 'book',
        itemId: book.id,
        title: book.title,
        image: book.image,
        rating: book.rating,
        genre: book.genre,
        year: book.year,
        author: book.author,
        addedAt: serverTimestamp()
      });
      
      setIsInWishlist(true);
      setWishlistId(docRef.id);
    } catch (err) {
      console.error('Error al añadir a la lista de deseos:', err);
      alert('Error al añadir a la lista de deseos');
    }
  };
  
  // Remove book from wishlist
  const removeFromWishlist = async () => {
    if (!user || !wishlistId) return;
    
    try {
      await deleteDoc(doc(db, 'wishlist', wishlistId));
      setIsInWishlist(false);
      setWishlistId(null);
    } catch (err) {
      console.error('Error al eliminar de la lista de deseos:', err);
      alert('Error al eliminar de la lista de deseos');
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300">Cargando detalles del libro...</p>
        </div>
      </div>
    );
  }
  
  if (error || !book) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 to-indigo-100 dark:from-slate-900 dark:to-indigo-950 flex justify-center items-center">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md mx-auto shadow-lg">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error</h1>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {error || 'Error al cargar detalles del libro. Es posible que el libro no exista o haya un problema de red.'}
          </p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }
  
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
          
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 transition-colors"
            >
              Panel
            </Link>
          </div>
        </div>
      </header>
      
      {/* Book Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          {/* Book Cover */}
          <div className="md:w-1/3 relative">
            {book.image ? (
              <div className="relative h-96 md:h-full flex justify-center items-center bg-gray-100 dark:bg-gray-800 p-8 md:p-12">
                <Image
                  src={book.image}
                  alt={book.title}
                  width={280}
                  height={400}
                  style={{ objectFit: "contain", maxHeight: "400px" }}
                  className="shadow-lg rounded"
                />
              </div>
            ) : (
              <div className="h-96 md:h-full bg-gradient-to-br from-indigo-500/80 via-purple-600/70 to-pink-500/60 flex items-center justify-center p-4">
                <h1 className="text-2xl text-white font-bold text-center">{book.title}</h1>
              </div>
            )}
          </div>
          
          {/* Book Info */}
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{book.title}</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">por {book.author}</p>
                <div className="flex items-center mb-4">
                  <div className="flex items-center bg-yellow-100 dark:bg-yellow-900/50 px-2 py-1 rounded text-sm mr-3">
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
                  <span className="text-gray-600 dark:text-gray-400 text-sm">{book.year}</span>
                </div>
              </div>
              
              {user && (
                <button
                  onClick={isInWishlist ? removeFromWishlist : addToWishlist}
                  className={`p-2 rounded-full ${
                    isInWishlist
                      ? 'bg-pink-500 text-white hover:bg-pink-600'
                      : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-500'
                  } transition-colors border border-gray-200 dark:border-gray-600`}
                  aria-label={isInWishlist ? 'Eliminar de la lista de deseos' : 'Añadir a la lista de deseos'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
              )}
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Géneros</h2>
              <div className="flex flex-wrap gap-2">
                {book.genre.split(',').map((genre, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm"
                  >
                    {genre.trim()}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Sobre este libro</h2>
              <div 
                className="text-gray-700 dark:text-gray-300 prose prose-sm dark:prose-invert max-h-48 overflow-y-auto mb-2"
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
              <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {book.pageCount !== 'Desconocido' ? `${book.pageCount} páginas` : 'Número de páginas desconocido'}
                </span>
                {book.publisher !== 'Desconocido' && (
                  <span className="flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {book.publisher}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-stretch gap-4 mt-6">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-center"
              >
                Volver
              </button>
              
              <div className="flex flex-col sm:flex-row gap-2">
                {book.previewLink && (
                  <Link
                    href={book.previewLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-center"
                  >
                    Vista previa
                  </Link>
                )}
                
                {book.readerLink && book.isPreviewAvailable && (
                  <Link
                    href={book.readerLink}
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    Leer muestra
                  </Link>
                )}
                
                <Link
                  href={`https://books.google.com/books?id=${book.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                >
                  Más información
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
