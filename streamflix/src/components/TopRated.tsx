import { useInfiniteQuery } from "@tanstack/react-query";
import { topRatedInfiniteQuery, uniqueMovies } from "@/lib/queries";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TopRated() {
  const {
    data,
    isPending,
    isError,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery(topRatedInfiniteQuery());

  const movies = data ? uniqueMovies(data.pages.flatMap((p) => p.results)) : [];

  return (
    <section className="bg-black px-6 py-8 text-white md:px-12 lg:px-16">
      <div className="mb-6 mt-5 flex items-center gap-3">
        <h2 className="text-xl font-semibold text-white">Top Rated</h2>
        {/* Background refetch indicator (not shown for the first load or Load more) */}
        {isFetching && !isPending && !isFetchingNextPage && (
          <span className="text-sm text-neutral-400">Updating...</span>
        )}
      </div>

      {isPending && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            Could not load top rated movies.
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {movies.length > 0 && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {movies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          {hasNextPage && (
            <div className="mt-8 flex justify-center">
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
    </section>
  );
}