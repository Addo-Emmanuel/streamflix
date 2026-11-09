import {
  Link,
  useRouter,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Shown while a route's loader is still running
export function PendingPage() {
  return (
    <div className="space-y-6 bg-black px-6 py-10 md:px-12">
      <Skeleton className="h-9 w-64" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[2/3] w-full" />
        ))}
      </div>
    </div>
  );
}

// Shown when a route's loader (or component) throws
export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  return (
    <div className="space-y-4 bg-black px-6 py-10 text-white md:px-12">
      <Alert variant="destructive">
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
          <Button
            size="sm"
            onClick={() => {
              reset();
              router.invalidate();
            }}
          >
            Retry
          </Button>
    
        </AlertDescription>
      </Alert>
      <Link to="/" className="inline-block text-sm text-neutral-400 hover:text-white">
        ← Back to Home
      </Link>
    </div>
  );
}

// Shown for any URL that matches no route
export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
      <p className="text-6xl font-bold">404</p>
      <p className="text-neutral-300">
        We couldn't find the page you were looking for.
      </p>
      <Link
        to="/"
        className={buttonVariants({
          variant: "default",
          className: "bg-white text-black hover:bg-neutral-200",
        })}
      >
        Back to Home
      </Link>


    </div>
  );
}