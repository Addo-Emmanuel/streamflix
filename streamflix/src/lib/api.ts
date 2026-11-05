const BASE = "https://api.themoviedb.org/3";

export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date: string;
}

async function tmdb<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${import.meta.env.VITE_TMDB_TOKEN}` },
  });
  if (!res.ok) throw new Error(`TMDB request failed: ${res.status}`);
  return res.json();
}

export const getTrending = () =>
  tmdb<{ results: Movie[] }>("/trending/movie/week");