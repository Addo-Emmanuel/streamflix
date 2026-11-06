const BASE = "https://api.themoviedb.org/3";
const LOCAL = "http://localhost:3001";

/* ---------- Types ---------- */

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
}

export interface Paged<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MovieDetail extends Movie {
  runtime: number | null;
  genres: Genre[];
  credits: {
    cast: { id: number; name: string; profile_path: string | null }[];
  };
  videos: { results: { key: string; site: string; type: string }[] };
}

export interface SavedMovie {
  id: number; // json-server's own id
  movieId: number; // TMDB movie id
  title: string;
  posterPath: string | null;
}

export interface Rating {
  id: number; // json-server's own id
  movieId: number;
  value: number;
}

/* ---------- TMDB (read only) ---------- */

async function tmdb<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` },
  });
  if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`);
  return res.json();
}

export const getTrending = () => tmdb<Paged<Movie>>("/trending/movie/week");

export const getPopular = () => tmdb<Paged<Movie>>("/movie/popular");

export const getUpComing = () => tmdb<Paged<Movie>>("/movie/upcoming");

export const getTopRated = (page = 1) =>
  tmdb<Paged<Movie>>(`/movie/top_rated?page=${page}`);

export const getMovie = (id: string) =>
  tmdb<MovieDetail>(`/movie/${id}?append_to_response=videos,credits`);

export const getGenres = async () => {
  const res = await tmdb<{ genres: Genre[] }>("/genre/movie/list");
  return res.genres;
};

export const getMoviesByGenre = (genreId: string, page = 1) =>
  tmdb<Paged<Movie>>(`/discover/movie?with_genres=${genreId}&page=${page}`);

export const searchMovies = (query: string, page = 1) =>
  tmdb<Paged<Movie>>(
    `/search/movie?query=${encodeURIComponent(query)}&page=${page}`,
  );

/* ---------- json-server (My List and ratings) ---------- */

async function local<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${LOCAL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`Local API request failed: ${res.status}`);
  return res.json();
}

export const getMyList = () => local<SavedMovie[]>("/myList");

export const addToMyList = (movie: Omit<SavedMovie, "id">) =>
  local<SavedMovie>("/myList", {
    method: "POST",
    body: JSON.stringify(movie),
  });

export const removeFromMyList = (id: number) =>
  local<Record<string, never>>(`/myList/${id}`, { method: "DELETE" });

// Returns the user's rating for one movie, or null if not rated yet
export const getRating = async (movieId: number) => {
  const list = await local<Rating[]>(`/ratings?movieId=${movieId}`);
  return list[0] ?? null;
};

export const createRating = (rating: { movieId: number; value: number }) =>
  local<Rating>("/ratings", {
    method: "POST",
    body: JSON.stringify(rating),
  });

export const updateRating = ({ id, value }: { id: number; value: number }) =>
  local<Rating>(`/ratings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ value }),
  });