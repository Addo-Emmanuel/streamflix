export const movieKeys = {
  all: ["movies"] as const,
  trending: () => [...movieKeys.all, "trending"] as const,
};