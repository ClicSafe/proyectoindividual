const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Género de películas
const genres = {
  28: 'Acción',
  12: 'Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familiar',
  14: 'Fantasía',
  36: 'Historia',
  27: 'Terror',
  10402: 'Música',
  9648: 'Misterio',
  10749: 'Romance',
  878: 'Ciencia ficción',
  10770: 'Película de TV',
  53: 'Thriller',
  10752: 'Guerra',
  37: 'Western'
};

// Función para obtener nombres de géneros
const getGenreNames = (genreIds) => {
  if (!genreIds || !genreIds.length) return 'Desconocido';
  return genreIds.map(id => genres[id] || 'Otro').join(', ');
};

// Fetch popular movies
export const getPopularMovies = async (page = 1) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener películas populares');
    }
    
    const data = await response.json();
    
    return data.results.map(movie => ({
      id: movie.id.toString(),
      title: movie.title,
      genre: getGenreNames(movie.genre_ids),
      rating: movie.vote_average,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Desconocido',
      image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      overview: movie.overview,
    }));
  } catch (error) {
    console.error('Error al obtener películas populares:', error);
    return [];
  }
};

// Fetch top rated movies
export const getTopRatedMovies = async (page = 1) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener películas mejor valoradas');
    }
    
    const data = await response.json();
    
    return data.results.map(movie => ({
      id: movie.id.toString(),
      title: movie.title,
      genre: getGenreNames(movie.genre_ids),
      rating: movie.vote_average,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Desconocido',
      image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      overview: movie.overview,
    }));
  } catch (error) {
    console.error('Error al obtener películas mejor valoradas:', error);
    return [];
  }
};

// Fetch now playing movies
export const getNowPlayingMovies = async (page = 1) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&language=es-ES&page=${page}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener películas en cartelera');
    }
    
    const data = await response.json();
    
    return data.results.map(movie => ({
      id: movie.id.toString(),
      title: movie.title,
      genre: getGenreNames(movie.genre_ids),
      rating: movie.vote_average,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Desconocido',
      image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      overview: movie.overview,
    }));
  } catch (error) {
    console.error('Error al obtener películas en cartelera:', error);
    return [];
  }
};

// Get movie details
export const getMovieDetails = async (id) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&language=es-ES`);
    
    if (!response.ok) {
      throw new Error('Error al obtener detalles de la película');
    }
    
    const movie = await response.json();
    
    return {
      id: movie.id.toString(),
      title: movie.title,
      overview: movie.overview,
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : null,
      releaseDate: movie.release_date,
      runtime: movie.runtime,
      voteAverage: movie.vote_average,
      genres: movie.genres.map(g => g.name).join(', ')
    };
  } catch (error) {
    console.error('Error al obtener detalles de la película:', error);
    return null;
  }
};

// Search movies
export const searchMovies = async (query, page = 1) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&language=es-ES&query=${encodeURIComponent(
        query
      )}&page=${page}&include_adult=false`
    );
    
    if (!response.ok) {
      throw new Error('Error al buscar películas');
    }
    
    const data = await response.json();
    
    return data.results.map(movie => ({
      id: movie.id.toString(),
      title: movie.title,
      genre: getGenreNames(movie.genre_ids),
      rating: movie.vote_average,
      year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Desconocido',
      image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
      overview: movie.overview,
    }));
  } catch (error) {
    console.error('Error al buscar películas:', error);
    return [];
  }
};

// Get movie videos (trailers, teasers, etc.)
export const getMovieVideos = async (id) => {
  try {
    const response = await fetch(`${TMDB_BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=es-ES`);
    
    if (!response.ok) {
      throw new Error('Error al obtener videos de la película');
    }
    
    const data = await response.json();
    
    // Filter to get mostly trailers or teasers
    const videos = data.results || [];
    
    // Prioritize trailers in Spanish, then trailers in any language, then teasers
    const spanishTrailers = videos.filter(video => 
      video.type === 'Trailer' && (video.iso_639_1 === 'es' || video.name.toLowerCase().includes('español'))
    );
    
    const allTrailers = videos.filter(video => video.type === 'Trailer');
    const teasers = videos.filter(video => video.type === 'Teaser');
    const clips = videos.filter(video => video.type === 'Clip');
    
    // Select the best video available
    let bestVideo = null;
    
    if (spanishTrailers.length > 0) {
      bestVideo = spanishTrailers[0];
    } else if (allTrailers.length > 0) {
      bestVideo = allTrailers[0];
    } else if (teasers.length > 0) {
      bestVideo = teasers[0];
    } else if (clips.length > 0) {
      bestVideo = clips[0];
    } else if (videos.length > 0) {
      bestVideo = videos[0];
    }
    
    // Return all videos and mark the best one
    return {
      allVideos: videos.map(video => ({
        id: video.id,
        name: video.name,
        key: video.key, // YouTube video key
        site: video.site, // Usually "YouTube"
        type: video.type, // "Trailer", "Teaser", etc.
        official: video.official,
        published_at: video.published_at,
        language: video.iso_639_1
      })),
      bestVideo: bestVideo ? {
        id: bestVideo.id,
        name: bestVideo.name,
        key: bestVideo.key,
        site: bestVideo.site,
        type: bestVideo.type,
        official: bestVideo.official
      } : null
    };
  } catch (error) {
    console.error('Error al obtener videos de la película:', error);
    return {
      allVideos: [],
      bestVideo: null
    };
  }
};
