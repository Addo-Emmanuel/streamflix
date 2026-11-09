import { createFileRoute, Link } from "@tanstack/react-router";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { searchQuery } from "@/lib/queries";
import { MovieCard } from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Validate the URL params. A malformed URL falls back to the defaults
// instead of crashing the page.
const searchSchema = z.object({
  // the URL parser turns "2024" into a number, so accept both
  q: z.union([z.string(), z.number()]).transform(String).catch(""),
  page: z.number().int().min(1).catch(1),
});

export const Route = createFileRoute("/search")({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search: { q, page } }) => ({ q, page }),
  loader: ({ context: { queryClient }, deps: { q, page } }) => {
    const term = q.trim();
    if (term.length >= 2) {
      return queryClient.ensureQueryData(searchQuery(term, page));
    }
  },
  component: SearchPage,
});

function SearchPage() {
  const { q, page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const term = q.trim();
  const enabled = term.length >= 2; // only search with 2 or more characters

  const { data, isPending, isError, isFetching, isPlaceholderData, refetch } =
    useQuery({
      ...searchQuery(term, page),
      enabled,
      placeholderData: keepPreviousData, // keep the old page visible while the next loads
    });

  const goToPage = (next: number) =>
    navigate({ search: (prev) => ({ ...prev, page: next }) });

  return (
    <div className="space-y-6 bg-black px-6 py-10 text-white md:px-12">
      <Link
        to="/"
        className="inline-block text-sm text-neutral-400 hover:text-white"
      >
        ← Back to Home
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold">
          {enabled ? `Results for "${term}"` : "Search"}
        </h1>
        {enabled && isFetching && !isPending && (
          <span className="text-sm text-neutral-400">Updating...</span>
        )}
      </div>

      {!enabled && (
        <Alert>
          <AlertTitle>Start typing</AlertTitle>
          <AlertDescription>
            Type at least 2 characters in the search box to find movies.
          </AlertDescription>
        </Alert>
      )}

      {enabled && isPending && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full" />
          ))}
        </div>
      )}

      {enabled && isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            Could not load search results.
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {enabled && data && data.results.length === 0 && (
        <Alert>
          <AlertTitle>No movies found</AlertTitle>
          <AlertDescription>
            Nothing matched "{term}". Try a different search.
          </AlertDescription>
        </Alert>
      )}

      {enabled && data && data.results.length > 0 && (
        <>
          <div
            className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-4 lg:grid-cols-6 ${
              isPlaceholderData ? "opacity-60" : ""
            }`}
          >
            {data.results.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Button
              variant="outline"
              className="cursor-pointer border-white bg-black text-white hover:bg-neutral-900 hover:text-white"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-neutral-300">
              Page {page} of {Math.min(data.total_pages, 500)}
            </span>
            <Button
              variant="outline"
              className="cursor-pointer border-white bg-black text-white hover:bg-neutral-900 hover:text-white"
              disabled={page >= Math.min(data.total_pages, 500)}
              onClick={() => goToPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
}