import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "./ui/input";
import { genresQuery } from "@/lib/queries";

const linkClass = "text-sm text-zinc-300 hover:text-white [&.active]:text-white";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [genresOpen, setGenresOpen] = useState(false);
  const [text, setText] = useState("");

  const navigate = useNavigate();
  const genres = useQuery(genresQuery());

  const closeAll = () => {
    setMenuOpen(false);
    setGenresOpen(false);
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const term = text.trim();
    if (!term) return;
    navigate({ to: "/search", search: { q: term, page: 1 } });
    closeAll();
  };

  const genreLinks = genres.data?.map((g) => (
    <Link
      key={g.id}
      to="/genre/$genreid"
      params={{ genreid: String(g.id) }}
      onClick={closeAll}
      className="rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-900 hover:text-white"
    >
      {g.name}
    </Link>
  ));

  const searchForm = (
    <form onSubmit={onSearch} className="relative w-full max-w-75">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search movies"
        className="h-11 rounded-full border border-white/20 bg-white/10 pl-10 pr-3 text-sm text-white placeholder:text-zinc-300 focus-visible:ring-white/30"
      />
    </form>
  );

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
          *{
            font-family: "Geist", sans-serif;
          }
        `}
      </style>
      <nav className="relative flex items-center justify-between bg-transparent px-6 py-4 md:px-16 lg:px-24 xl:px-32">
        <div className="flex items-center gap-20">
          <Link to="/" className="text-xl font-bold text-white">
            Streamflix
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link to="/" activeOptions={{ exact: true }} className={linkClass}>
              Home
            </Link>
            <Link to="/my-list" className={linkClass}>
              My List
            </Link>

            {/* Genres dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setGenresOpen(!genresOpen)}
                className="flex cursor-pointer items-center gap-1 text-sm text-zinc-300 hover:text-white"
              >
                Genres
                <ChevronDown
                  className={`size-4 transition-transform ${
                    genresOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {genresOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setGenresOpen(false)}
                  />
                  <div className="absolute left-0 top-full z-50 mt-3 grid w-72 grid-cols-2 gap-1 rounded-xl border border-zinc-800 bg-black p-2">
                    {genres.isPending && (
                      <p className="col-span-2 p-2 text-sm text-zinc-400">
                        Loading...
                      </p>
                    )}
                    {genres.isError && (
                      <p className="col-span-2 p-2 text-sm text-zinc-400">
                        Could not load genres.
                      </p>
                    )}
                    {genreLinks}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-end pl-8 md:flex">
          {searchForm}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex cursor-pointer flex-col gap-1.5 border-0 bg-transparent p-1 md:hidden"
        >
          <span
            className={`block h-0.5 w-6 bg-white transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          ></span>
          <span
            className={`block h-0.5 w-6 bg-white transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          ></span>
          <span
            className={`block h-0.5 w-6 bg-white transition-transform ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          ></span>
        </button>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="absolute left-0 top-full z-50 flex max-h-[80vh] w-full flex-col gap-1 overflow-y-auto border-t border-zinc-800 bg-black p-5 md:hidden">
            {searchForm}
            <Link
              to="/"
              activeOptions={{ exact: true }}
              onClick={closeAll}
              className="rounded-lg px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 [&.active]:text-white"
            >
              Home
            </Link>
            <Link
              to="/my-list"
              onClick={closeAll}
              className="rounded-lg px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-900 [&.active]:text-white"
            >
              My List
            </Link>
            <p className="px-4 pt-3 text-xs uppercase tracking-wide text-zinc-500">
              Genres
            </p>
            <div className="grid grid-cols-2 gap-1">{genreLinks}</div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;