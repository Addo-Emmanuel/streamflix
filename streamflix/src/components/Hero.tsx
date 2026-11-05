import { Play, Plus } from 'lucide-react'
import Navbar from './Navbar'
import { Button } from './ui/button'
import marvelLogo from '../assets/marvelLogo.svg'
import heroBg from '../assets/backgroundImage.png'

const Hero = () => {
  return (
    <section
      className="relative min-h-screen overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.7)), url(${heroBg})`,
      }}
    >
      <div className="relative z-10">
        <Navbar />
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-90px)] items-end px-6 pb-16 pt-8 md:px-12 lg:px-16">
        <div className="max-w-150 text-white">
          <div className="mb-5 flex items-center gap-3">
            <img src={marvelLogo} alt="Marvel logo" className="h-8 w-auto md:h-10" />
            {/* <span className="text-xl font-black tracking-tight md:text-3xl">STUDIOS</span> */}
          </div>

          <h1 className="text-4xl font-black leading-[0.9] tracking-[-0.06em] md:text-6xl">
            Guardians
            <span className="block">of the Galaxy</span>
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-zinc-200 md:text-base">
            <span>Action</span>
            <span className="text-zinc-400">|</span>
            <span>Adventure</span>
            <span className="text-zinc-400">|</span>
            <span>Sci-Fi</span>
            <span className="text-zinc-400">•</span>
            <span>2018</span>
            <span className="text-zinc-400">•</span>
            <span>2h 8m</span>
          </div>

          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-200 md:text-lg">
            A fearless team of outcasts embarks on an epic cosmic adventure, where danger, laughter,
            and loyalty collide across the galaxy.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button className="h-12 rounded-full bg-white px-7 text-sm font-semibold text-black shadow-[0_12px_28px_rgba(255,255,255,0.25)] hover:bg-zinc-200">
              <Play className="mr-2 h-4 w-4 fill-current" />
              Play trailer
            </Button>

            <Button variant="secondary" className="h-12 rounded-full border border-white/20 bg-black/30 px-7 text-sm font-semibold text-white hover:bg-black/40">
              <Plus className="mr-2 h-4 w-4" />
              Add to my list
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
