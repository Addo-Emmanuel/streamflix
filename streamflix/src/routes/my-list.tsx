import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMyList } from "@/lib/api";
import { myListKeys } from "@/lib/queryKeys";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRemoveFromMyList } from "@/lib/mutations";

export const Route = createFileRoute("/my-list")({
  component: MyListPage,
});

function MyListPage() {
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: myListKeys.all,
    queryFn: getMyList,
  });

  const removeMutation = useRemoveFromMyList();

  return (
    <div className="space-y-6 bg-black px-6 py-10 text-white md:px-12">
      <Link
        to="/"
        className="inline-block text-sm text-neutral-400 hover:text-white"
      >
        ← Back to Home
      </Link>
      <h1 className="text-3xl font-bold">My List</h1>

      {isPending && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[2/3] w-full" />
          ))}
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            Could not load your list. Is the API running?
            <Button size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {data && data.length === 0 && (
        <Alert>
          <AlertTitle>Your list is empty</AlertTitle>
          <AlertDescription>
            Open a movie and press "Add to My List" to save it here.{" "}
            <Link to="/" className="underline">
              Browse movies
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {data && data.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
          {data.map((m) => (
            <div key={m.id} className="space-y-2">
              <Link
                to="/movie/$movieId"
                params={{ movieId: String(m.movieId) }}
                className="block"
              >
                <Card className="relative gap-0 overflow-hidden border-0 py-0 transition hover:scale-105">
                  {m.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w500${m.posterPath}`}
                      alt={m.title}
                      className="aspect-[2/3] w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-[2/3] items-center justify-center bg-neutral-800 text-sm text-neutral-400">
                      No image
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-2 pt-8">
                    <p className="line-clamp-2 text-sm font-semibold text-white">
                      {m.title}
                    </p>
                  </div>
                </Card>
              </Link>

              {/* Outside the Link, so clicking it does not open the movie */}
              <Button
                variant="outline"
                size="sm"
                className="w-full cursor-pointer border-white bg-black text-white hover:bg-neutral-900 hover:text-white"
                onClick={() => removeMutation.mutate(m.id)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}