import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import {
  getGenres,
  getMovie,
  getMoviesByGenre,
  getMyList,
  getPopular,
  getTopRated,
  getTrending,
  searchMovies,
  type Movie,
} from "@/lib/api";
import { movieKeys, myListKeys } from "@/lib/queryKeys";

// Movie lists change slowly, so 5 min avoids needless refetches
const MOVIE_STALE = 5 * 60 * 1000;

// Shared by components (useQuery) and route loaders (ensureQueryData),
// so both always use the exact same key and fetch function.

export const trendingQuery = () =>
  queryOptions({
    queryKey: movieKeys.trending(),
    queryFn: getTrending,
    staleTime: MOVIE_STALE,
  });

export const popularQuery = () =>
  queryOptions({
    queryKey: movieKeys.popular(),
    queryFn: getPopular,
    staleTime: MOVIE_STALE,
  });

export const movieDetailQuery = (id: string) =>
  queryOptions({
    queryKey: movieKeys.detail(id),
    queryFn: () => getMovie(id),
    staleTime: MOVIE_STALE,
  });

export const genresQuery = () =>
  queryOptions({
    queryKey: movieKeys.genres(),
    queryFn: getGenres,
    staleTime: 60 * 60 * 1000, // the genre list almost never changes
  });

export const searchQuery = (q: string, page: number) =>
  queryOptions({
    queryKey: movieKeys.search(q, page),
    queryFn: () => searchMovies(q, page),
    staleTime: MOVIE_STALE,
  });

export const myListQuery = () =>
  queryOptions({
    queryKey: myListKeys.all,
    queryFn: getMyList,
  });

export const topRatedInfiniteQuery = () =>
  infiniteQueryOptions({
    queryKey: movieKeys.topRated(),
    queryFn: ({ pageParam }) => getTopRated(pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.total_pages ? last.page + 1 : undefined,
    staleTime: MOVIE_STALE,
  });

export const genreInfiniteQuery = (genreId: string) =>
  infiniteQueryOptions({
    queryKey: movieKeys.genre(genreId),
    queryFn: ({ pageParam }) => getMoviesByGenre(genreId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) =>
      last.page < last.total_pages ? last.page + 1 : undefined,
    staleTime: MOVIE_STALE,
  });

// TMDB can return the same movie on two pages; keep each one once
export function uniqueMovies(movies: Movie[]): Movie[] {
  return Array.from(new Map(movies.map((m) => [m.id, m])).values());
}