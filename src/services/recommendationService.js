import { getPopularMovies, searchMovies } from './movieApi';
import { getPopularBooks, searchBooks } from './bookApi';

/**
 * Genera recomendaciones basadas en películas de la wishlist
 * @param {Array} moviesWishlist - Lista de películas en la wishlist
 * @returns {Promise<Array>} - Películas recomendadas
 */
export const getMovieRecommendations = async (moviesWishlist) => {
  try {
    // Si no hay películas en la wishlist, devolver películas populares
    if (!moviesWishlist || moviesWishlist.length === 0) {
      const popular = await getPopularMovies();
      return popular.slice(0, 6); // Devolver 6 películas populares
    }

    // Extraer géneros de las películas en la wishlist
    const genres = extractGenres(moviesWishlist);
    
    // Obtener películas basadas en géneros populares del usuario
    const recommendations = await Promise.all(
      genres.slice(0, 2).map(async (genre) => {
        const results = await searchMovies(genre);
        return results.slice(0, 4); // Tomar 4 películas de cada género
      })
    );

    // Aplanar el array y eliminar duplicados
    const flattenedResults = recommendations.flat();
    const uniqueRecommendations = removeDuplicates(flattenedResults);
    
    // Filtrar películas que ya están en la wishlist
    const wishlistIds = new Set(moviesWishlist.map(item => item.itemId));
    const filteredRecommendations = uniqueRecommendations.filter(movie => !wishlistIds.has(movie.id));
    
    return filteredRecommendations.slice(0, 6); // Limitar a 6 recomendaciones
  } catch (error) {
    console.error('Error obteniendo recomendaciones de películas:', error);
    return [];
  }
};

/**
 * Genera recomendaciones basadas en libros de la wishlist
 * @param {Array} booksWishlist - Lista de libros en la wishlist
 * @returns {Promise<Array>} - Libros recomendados
 */
export const getBookRecommendations = async (booksWishlist) => {
  try {
    // Si no hay libros en la wishlist, devolver libros populares
    if (!booksWishlist || booksWishlist.length === 0) {
      const popular = await getPopularBooks();
      return popular.slice(0, 6); // Devolver 6 libros populares
    }

    // Extraer géneros y autores de los libros en la wishlist
    const genres = extractGenres(booksWishlist);
    const authors = extractAuthors(booksWishlist);
    
    // Obtener libros basados en géneros y autores populares del usuario
    const genreRecommendations = await Promise.all(
      genres.slice(0, 2).map(async (genre) => {
        const results = await searchBooks(genre);
        return results.slice(0, 3); // Tomar 3 libros de cada género
      })
    );
    
    const authorRecommendations = await Promise.all(
      authors.slice(0, 2).map(async (author) => {
        const results = await searchBooks(author);
        return results.slice(0, 2); // Tomar 2 libros de cada autor
      })
    );

    // Combinar recomendaciones, aplanar el array y eliminar duplicados
    const allRecommendations = [...genreRecommendations.flat(), ...authorRecommendations.flat()];
    const uniqueRecommendations = removeDuplicates(allRecommendations);
    
    // Filtrar libros que ya están en la wishlist
    const wishlistIds = new Set(booksWishlist.map(item => item.itemId));
    const filteredRecommendations = uniqueRecommendations.filter(book => !wishlistIds.has(book.id));
    
    return filteredRecommendations.slice(0, 6); // Limitar a 6 recomendaciones
  } catch (error) {
    console.error('Error obteniendo recomendaciones de libros:', error);
    return [];
  }
};

/**
 * Extrae los géneros más comunes de una lista de items
 */
const extractGenres = (items) => {
  // Contar frecuencia de géneros
  const genreCount = {};
  
  items.forEach(item => {
    if (item.genre) {
      // Dividir por comas si hay múltiples géneros
      const genres = item.genre.split(',').map(g => g.trim());
      genres.forEach(genre => {
        genreCount[genre] = (genreCount[genre] || 0) + 1;
      });
    }
  });
  
  // Convertir a array y ordenar por frecuencia
  return Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
};

/**
 * Extrae los autores más comunes de una lista de libros
 */
const extractAuthors = (books) => {
  // Contar frecuencia de autores
  const authorCount = {};
  
  books.forEach(book => {
    if (book.author) {
      // Dividir por comas si hay múltiples autores
      const authors = book.author.split(',').map(a => a.trim());
      authors.forEach(author => {
        if (author && author !== 'Autor desconocido') {
          authorCount[author] = (authorCount[author] || 0) + 1;
        }
      });
    }
  });
  
  // Convertir a array y ordenar por frecuencia
  return Object.entries(authorCount)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
};

/**
 * Elimina duplicados de un array de items basado en sus IDs
 */
const removeDuplicates = (items) => {
  const uniqueIds = new Set();
  return items.filter(item => {
    if (uniqueIds.has(item.id)) {
      return false;
    }
    uniqueIds.add(item.id);
    return true;
  });
};
