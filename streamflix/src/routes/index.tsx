import { createFileRoute } from '@tanstack/react-router'
import Hero from '../components/Hero'
import TrendingNow from '@/components/TrendingNow'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="bg-black text-white">
      <Hero />
      <div className="bg-black px-6 pb-16 md:px-12 lg:px-16">
        <TrendingNow />
        {/* add popular, top rated, upcoming here later */}
      </div>
    </div>
  )
}
