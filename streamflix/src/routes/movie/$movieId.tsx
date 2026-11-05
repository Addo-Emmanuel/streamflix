import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/movie/$movieId')({
  component: MovieDetailPage,
})

function MovieDetailPage() {
  const { movieId } = Route.useParams()

  return (
    <div className="p-8 text-white">
      <h1 className="text-3xl font-bold">Movie Details</h1>
      <p className="mt-2 text-zinc-300">Selected movie ID: {movieId}</p>
    </div>
  )
}
