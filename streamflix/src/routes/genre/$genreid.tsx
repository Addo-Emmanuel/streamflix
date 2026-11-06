import { createFileRoute, Link } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  genreInfiniteQuery,
  genresQuery,
  uniqueMovies,
} from "@/lib/queries";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const Route = createFileRoute("/genre/$genreid")({
  loader: ({ context: { queryClient }, params: { genreid } }) =>
    Promise.all([
      queryClient.ensureInfiniteQueryData(genreInfiniteQuery(genreid)),
      queryClient.ensureQueryData(genresQuery()),
    ]),
  component: GenrePage,
});

function GenrePage() {
  const { genreid } = Route.useParams();

  const genres = useQuery(genresQuery());
  const genreName =
    genres.data?.find((g) => String(g.id) === genreid)?.name ?? "Genre";

  const {
    data,
    isPending,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(genreInfiniteQuery(genreid));

  const movies = data ? uniqueMovies(data.pages.flatMap((p) => p.results)) : [];

  return (
    <div className="space-y-6 bg-black px-6 py-10 text-white md:px-12">
      <Link
        to="/"
        className="inline-block text-sm text-neutral-400 hover:text-white"
      >
        ← Back to Home
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">{genreName}</h1>
        {isFetching && !isPending && !isFetchingNextPage && (
          <span className="text-sm text-neutral-400">Updating...</span>
        )}
      </div>

      {isPending && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            Could not load movies for this genre.
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {data && movies.length === 0 && (
        <Alert>
          <AlertTitle>No movies found</AlertTitle>
          <AlertDescription>There are no movies in this genre yet.</AlertDescription>
        </Alert>
      )}

      {movies.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                className="cursor-pointer border-white bg-black text-white hover:bg-neutral-900 hover:text-white"
                disabled={isFetchingNextPage}
                onClick={() => fetchNextPage()}
              >
                {isFetchingNextPage ? "Loading..." : "Load more"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}