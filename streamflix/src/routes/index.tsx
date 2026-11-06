import { createFileRoute } from '@tanstack/react-router'
import Hero from '../components/Hero'
import TrendingNow from '@/components/TrendingNow'
import Popular from '@/components/Popular'
import TopRated from '@/components/TopRated'
import UpComing from '@/components/UpComing'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="bg-black text-white">
      <Hero />
      <div className="bg-black px-6 pb-16 md:px-12 lg:px-16">
        <TrendingNow />
        <Popular/>
        <TopRated/>
        <UpComing/>
      </div>
    </div>
  )
}
