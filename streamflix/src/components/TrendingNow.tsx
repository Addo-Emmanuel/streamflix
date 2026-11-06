import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { getTrending } from "@/lib/api";
import { movieKeys } from "@/lib/queryKeys";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export default function TrendingRow() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: movieKeys.trending(),
    queryFn: getTrending,
    staleTime: 5 * 60 * 1000, // trending lists change slowly, so 5 min avoids needless refetches
  });

  return (
    <section className="bg-black px-6 py-8 text-white md:px-12 lg:px-16">
      <h2 className="mb-6 mt-5 text-xl font-semibold text-white">Trending now</h2>

      {isPending && (
        <div className="flex gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-40 shrink-0" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            Could not load trending movies.
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {data && (
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {data.results.map((movie) => (
            <Link
              key={movie.id}
              to="/movie/$movieId"
              params={{ movieId: String(movie.id) }}
              className="block w-40 shrink-0"
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
          ))}
        </div>
      )}
    </section>
  );
}