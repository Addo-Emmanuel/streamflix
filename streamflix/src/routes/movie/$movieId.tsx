import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, Play, Plus, Star } from "lucide-react";
import {
  addToMyList,
  createRating,
  getMovie,
  getMyList,
  getRating,
  updateRating,
} from "@/lib/api";
import { movieKeys, myListKeys, ratingKeys } from "@/lib/queryKeys";
import { useRemoveFromMyList } from "@/lib/mutations";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/movie/$movieId")({
  component: MovieDetailPage,
});

const IMG = "https://image.tmdb.org/t/p";

function formatRuntime(minutes: number | null) {
  if (!minutes) return null;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function MovieDetailPage() {
  const { movieId } = Route.useParams();
  const numericId = Number(movieId);
  const queryClient = useQueryClient();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: movieKeys.detail(movieId),
    queryFn: () => getMovie(movieId),
    staleTime: 5 * 60 * 1000, // movie details rarely change, so 5 min avoids needless refetches
  });

  const myList = useQuery({
    queryKey: myListKeys.all,
    queryFn: getMyList,
  });

  const addMutation = useMutation({
    mutationFn: addToMyList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myListKeys.all });
      toast.success("Added to My List");
    },
    onError: () => toast.error("Could not add this movie. Please try again."),
  });

  const removeMutation = useRemoveFromMyList();

  // The saved item (with json-server's own id) comes from the cache, not local state
  const saved = myList.data?.find((m) => m.movieId === numericId);

  // The user's own rating for this movie (null if not rated yet)
  const ratingQuery = useQuery({
    queryKey: ratingKeys.byMovie(numericId),
    queryFn: () => getRating(numericId),
  });

  const rateMutation = useMutation({
    // First rating: POST. Every change after that: PATCH.
    mutationFn: (value: number) =>
      ratingQuery.data
        ? updateRating({ id: ratingQuery.data.id, value })
        : createRating({ movieId: numericId, value }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ratingKeys.byMovie(numericId),
      });
      toast.success("Rating saved");
    },
    onError: () => toast.error("Could not save your rating. Please try again."),
  });

  const rating = ratingQuery.data?.value ?? 0;

  const [playing, setPlaying] = useState(false);

  if (isPending) {
    return (
      <div className="grid gap-10 bg-black px-6 py-10 md:grid-cols-[380px_1fr] md:px-12">
        <Skeleton className="aspect-[2/3] w-full max-w-[380px]" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-20 w-full max-w-2xl" />
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-black px-6 py-10 md:px-12">
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            Could not load this movie.
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const trailer = data.videos.results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer",
  );
  const cast = data.credits.cast.slice(0, 6);
  const runtime = formatRuntime(data.runtime);

  return (
    <div className="space-y-12 bg-black px-6 py-10 text-white md:px-12">
      <div className="grid gap-10 md:grid-cols-[380px_1fr]">
        {/* Poster with title overlay */}
        <div className="relative w-full max-w-[380px] self-start overflow-hidden rounded-2xl bg-neutral-900">
          {data.poster_path ? (
            <img
              src={`${IMG}/w500${data.poster_path}`}
              alt={data.title}
              className="aspect-[2/3] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[2/3] items-center justify-center text-neutral-400">
              No image
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-5 pt-20">
            <p className="text-xl font-bold">{data.title}</p>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <p className="flex items-center gap-4 text-sm text-neutral-400">
            <Link to="/" className="hover:text-white">
              Home
            </Link>
            <Link to="/my-list" className="hover:text-white">
              My List
            </Link>
          </p>

          <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-300">
            <span className="font-bold text-yellow-400">
              {data.vote_average.toFixed(1)}
            </span>
            <span>{data.release_date?.slice(0, 4)}</span>
            {runtime && (
              <>
                <span>·</span>
                <span>{runtime}</span>
              </>
            )}
            {data.genres.map((g) => (
              <Badge key={g.id} variant="secondary">
                {g.name}
              </Badge>
            ))}
          </div>

          <p className="max-w-2xl text-lg leading-relaxed text-neutral-300">
            {data.overview}
          </p>

          {/* My List buttons */}
          <div className="flex flex-wrap gap-3">
            {saved ? (
              <>
                <Button
                  className="bg-white text-black hover:bg-neutral-200"
                  disabled
                >
                  <Check /> In My List
                </Button>
                <Button
                  variant="outline"
                  className="cursor-pointer border-white bg-black text-white hover:bg-neutral-900 hover:text-white"
                  onClick={() => removeMutation.mutate(saved.id)}
                >
                  Remove from My List
                </Button>
              </>
            ) : (
              <Button
                className="cursor-pointer bg-white text-black hover:bg-neutral-200"
                disabled={addMutation.isPending || myList.isPending}
                onClick={() =>
                  addMutation.mutate({
                    movieId: data.id,
                    title: data.title,
                    posterPath: data.poster_path,
                  })
                }
              >
                <Plus /> {addMutation.isPending ? "Adding..." : "Add to My List"}
              </Button>
            )}
          </div>

          {/* Your rating (saved to json-server) */}
          <div className="flex w-fit items-center gap-4 rounded-xl border border-neutral-700 px-5 py-4">
            <span className="text-sm text-neutral-300">Your rating</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`Rate ${n} out of 5`}
                  disabled={rateMutation.isPending || ratingQuery.isPending}
                  onClick={() => rateMutation.mutate(n)}
                  className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Star
                    className={`size-7 ${
                      n <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-neutral-600"
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="text-sm text-neutral-300">
              {rateMutation.isPending
                ? "Saving..."
                : rating > 0
                  ? `${rating} of 5`
                  : "Not rated"}
            </span>
          </div>

          {/* Cast */}
          {cast.length > 0 && (
            <div className="space-y-3 pt-2">
              <h2 className="text-xl font-semibold">Cast</h2>
              <div className="flex flex-wrap gap-4">
                {cast.map((person) => (
                  <div key={person.id} className="w-28 text-center">
                    {person.profile_path ? (
                      <img
                        src={`${IMG}/w185${person.profile_path}`}
                        alt={person.name}
                        className="aspect-square w-28 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="flex aspect-square w-28 items-center justify-center rounded-xl bg-neutral-900 text-xs text-neutral-400">
                        No photo
                      </div>
                    )}
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-300">
                      {person.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trailer */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Trailer</h2>
        {trailer ? (
          <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
            {playing ? (
              <iframe
                className="absolute inset-0 size-full"
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                title="Trailer"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <button
                type="button"
                onClick={() => setPlaying(true)}
                className="group absolute inset-0"
                aria-label="Play trailer"
              >
                <img
                  src={`https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`}
                  alt=""
                  className="size-full object-cover opacity-60"
                />
                <span className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white transition group-hover:scale-110">
                  <Play className="size-6 fill-black text-black" />
                </span>
              </button>
            )}
          </div>
        ) : (
          <p className="text-neutral-400">No trailer available.</p>
        )}
      </section>
    </div>
  );
}