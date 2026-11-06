export const movieKeys = {
  all: ["movies"] as const,
  trending: () => [...movieKeys.all, "trending"] as const,
  popular: () => [...movieKeys.all, "popular"] as const,
  topRated: () => [...movieKeys.all, "top-rated"] as const,
  upcoming: () => [...movieKeys.all, "upcoming"] as const,
  detail: (id: string) => [...movieKeys.all, "detail", id] as const,
  genres: () => [...movieKeys.all, "genres"] as const,
  genre: (genreId: string) => [...movieKeys.all, "genre", genreId] as const,
  search: (q: string, page: number) =>
    [...movieKeys.all, "search", q, page] as const,
};

export const myListKeys = {
  all: ["my-list"] as const,
};

export const ratingKeys = {
  all: ["ratings"] as const,
  byMovie: (movieId: number) => [...ratingKeys.all, movieId] as const,
};