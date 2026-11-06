import { Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Movie } from "@/lib/api";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link
      to="/movie/$movieId"
      params={{ movieId: String(movie.id) }}
      className="block"
    >
      <Card className="relative gap-0 overflow-hidden border-0 py-0 transition hover:scale-105">
        {movie.poster_path ? (
          <img
            src={`${IMAGE_BASE}${movie.poster_path}`}
            alt={movie.title}
            className="aspect-[2/3] w-full object-cover"
          />
        ) : (
          <div className="flex aspect-[2/3] items-center justify-center bg-neutral-800 text-sm text-neutral-400">
            No image
          </div>
        )}

        <Badge className="absolute right-2 top-2">
          {movie.vote_average?.toFixed(1) ?? "N/A"}
        </Badge>

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-8">
          <p className="line-clamp-2 text-sm font-semibold text-white">
            {movie.title}
          </p>
          <p className="text-xs text-neutral-300">
            {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
          </p>
        </div>
      </Card>
    </Link>
  );
}