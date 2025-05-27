const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes';

// Fetch popular books
export const getPopularBooks = async (page = 1) => {
  try {
    const startIndex = (page - 1) * 20;
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=subject:fiction&orderBy=relevance&langRestrict=es&startIndex=${startIndex}&maxResults=20`);
    
    if (!response.ok) {
      throw new Error('Error al obtener libros populares');
    }
    
    const data = await response.json();
    
    if (!data.items) return [];
    
    return data.items.map(book => {
      const volumeInfo = book.volumeInfo;
      return {
        id: book.id,
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconocido',
        genre: volumeInfo.categories ? volumeInfo.categories.join(', ') : 'Ficción',
        rating: volumeInfo.averageRating || Math.floor(Math.random() * 2) + 3,
        year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : 'Desconocido',
        image: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : null,
        description: volumeInfo.description || 'No hay descripción disponible',
      };
    });
  } catch (error) {
    console.error('Error al obtener libros populares:', error);
    return [];
  }
};

// Get book details
export const getBookDetails = async (id) => {
  try {
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener detalles del libro');
    }
    
    const book = await response.json();
    const volumeInfo = book.volumeInfo;
    
    return {
      id: book.id,
      title: volumeInfo.title,
      authors: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconocido',
      description: volumeInfo.description || 'No hay descripción disponible',
      image: volumeInfo.imageLinks ? 
             (volumeInfo.imageLinks.large || volumeInfo.imageLinks.medium || volumeInfo.imageLinks.small || volumeInfo.imageLinks.thumbnail) : 
             null,
      publishedDate: volumeInfo.publishedDate,
      publisher: volumeInfo.publisher || 'Desconocido',
      pageCount: volumeInfo.pageCount || 'Desconocido',
      categories: volumeInfo.categories ? volumeInfo.categories.join(', ') : 'Ficción',
      language: volumeInfo.language || 'Desconocido',
      previewLink: volumeInfo.previewLink,
      averageRating: volumeInfo.averageRating || Math.floor(Math.random() * 2) + 3,
    };
  } catch (error) {
    console.error('Error al obtener detalles del libro:', error);
    return null;
  }
};

// Search books
export const searchBooks = async (query, page = 1) => {
  try {
    const startIndex = (page - 1) * 20;
    const response = await fetch(`${GOOGLE_BOOKS_API_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=20&langRestrict=es`);
    
    if (!response.ok) {
      throw new Error('Error al buscar libros');
    }
    
    const data = await response.json();
    
    if (!data.items) return [];
    
    return data.items.map(book => {
      const volumeInfo = book.volumeInfo;
      return {
        id: book.id,
        title: volumeInfo.title,
        author: volumeInfo.authors ? volumeInfo.authors.join(', ') : 'Autor desconocido',
        genre: volumeInfo.categories ? volumeInfo.categories.join(', ') : 'Desconocido',
        rating: volumeInfo.averageRating || Math.floor(Math.random() * 2) + 3,
        year: volumeInfo.publishedDate ? new Date(volumeInfo.publishedDate).getFullYear() : 'Desconocido',
        image: volumeInfo.imageLinks ? volumeInfo.imageLinks.thumbnail : null,
        description: volumeInfo.description || 'No hay descripción disponible',
      };
    });
  } catch (error) {
    console.error('Error al buscar libros:', error);
    return [];
  }
};
