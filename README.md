# Streamflix

A Netflix-style movie browsing app built with React, TanStack Query and TanStack Router. Movie data comes from a public API (reads), and a small fake backend stores the user's "My List" and ratings (writes).

The project tests three things:

- **Queries:** fetching and caching
- **Mutations:** adding, removing and rating with instant UI updates
- **Routing:** pages, URL params and search params

The app uses a made-up name and logo, not Netflix's.

## Tech Stack

- Vite + React (TypeScript)
- TanStack Query v5
- TanStack Router (file-based routes)
- Tailwind CSS v4
- shadcn/ui (button, card, input, badge, skeleton, alert, sonner)
- Zod (validation)
- json-server 0.17.4 (fake backend)
- TMDB API (movie data)

## Rules

- All server data goes through TanStack Query. No `useEffect` + `fetch`, and no Redux or Zustand for server data.
- Routing uses TanStack Router, not React Router.
- The API token is kept in a `.env` file and out of git.
- Every loading, error and empty state is handled with shadcn components (Skeleton, Alert, etc.).

## Getting Started

Node 20 or newer is recommended.

### 1. Install dependencies

```bash
npm install
```

### 2. Get your TMDB token

The movie data needs a free TMDB token. The My List backend (json-server) needs no key.

1. Create a free account at [themoviedb.org](https://www.themoviedb.org) and confirm your email.
2. Open your account Settings, then the API section, and request an API key. Choose personal or learning use and describe it as a practice project.
3. On the API page, copy the **API Read Access Token** (the long token, not the shorter API key).
4. In the project root, create a `.env` file containing:

   ```
   VITE_TMDB_TOKEN=<your token>
   ```

   Add `.env` to `.gitignore`.
5. Test the token before writing any React:

   ```bash
   curl -H "Authorization: Bearer <your token>" https://api.themoviedb.org/3/trending/movie/week
   ```

   A JSON list of movies means it works.

> Vite sends `VITE_` variables to the browser, so the token is visible there. That is fine for a practice app, but never commit it or use this setup for a real product.

### 3. Fake backend data file

Create `db.json` in the project root with this content:

```json
{ "myList": [], "ratings": [] }
```

The `package.json` script for the fake API:

```json
"scripts": {
  "api": "json-server --watch db.json --port 3001 --delay 800"
}
```

The 800 ms delay makes loading states and optimistic updates easy to see. Version 0.17.4 is pinned because it is the stable release; the v1 beta changes several options.

### 4. Run both servers

Run each in its own terminal:

```bash
npm run dev
npm run api
```

- App: http://localhost:5173
- Fake API: http://localhost:3001

## Endpoints

### Movie data: TMDB (GET only)

Base URL: `https://api.themoviedb.org/3`

Send the token as the header `Authorization: Bearer <token>`. Poster images are built as `https://image.tmdb.org/t/p/w500/<poster_path>`.

| Endpoint | Used for |
|---|---|
| `/trending/movie/week` | Hero banner and the "Trending now" row |
| `/movie/popular` | "Popular" row |
| `/movie/top_rated?page=1` | "Top rated" row with a Load more button |
| `/genre/movie/list` | Genre names and ids for the genre filter |
| `/discover/movie?with_genres=28&page=1` | One row per genre, and the genre page |
| `/movie/{id}?append_to_response=videos,credits` | Movie detail page |
| `/search/movie?query=batman&page=1` | Search page |

### My List and ratings: json-server (local, read and write)

| Method and path | Body | Used for |
|---|---|---|
| `GET /myList` | none | Show the My List page |
| `GET /myList?movieId=550` | none | Check if one movie is already saved |
| `POST /myList` | `{ movieId, title, posterPath }` | Add a movie |
| `DELETE /myList/:id` | none | Remove a movie |
| `GET /ratings?movieId=550` | none | Read the user's rating |
| `POST /ratings` | `{ movieId, value }` | Rate a movie for the first time |
| `PATCH /ratings/:id` | `{ value }` | Change a rating |

## Pages and Routes

File-based routes. The root layout holds a navbar with the app name, a search box and links to Home and My List.

| URL | Route file | What it shows | What it tests |
|---|---|---|---|
| `/` | `routes/index.tsx` | Hero banner plus Trending, Popular and Top rated rows | Several queries at once, prefetching in the loader |
| `/movie/$movieId` | `routes/movie.$movieId.tsx` | Poster, overview, cast, trailer, rating, Add to My List button | Path params, dependent queries |
| `/search?q=...&page=...` | `routes/search.tsx` | Search results with pagination | Validated search params, keeping the previous page while the next loads |
| `/genre/$genreId` | `routes/genre.$genreId.tsx` | Movies in one genre with a Load more button | `useInfiniteQuery` |
| `/my-list` | `routes/my-list.tsx` | Saved movies with a Remove button | Mutations and cache invalidation |
| any other URL | not-found component | A friendly 404 page | Router error handling |

## Requirements

### Queries

- Keep all fetch functions in one api file. Each one checks `response.ok` and throws an error when it is false.
- Build query keys with a small factory, for example `movieKeys.detail(id)`, instead of typing arrays in components.
- Set a `staleTime` for movie data and add a one-line comment explaining the value chosen.
- Each home page row loads on its own, with its own skeleton and its own error message with a Retry button.
- The genre page uses `useInfiniteQuery` with `getNextPageParam` and a Load more button.
- Search runs only when the text has 2 or more characters (`enabled`), and uses `placeholderData: keepPreviousData` so the list does not flash empty between pages.
- Show a small "Updating..." indicator while a background refetch runs (`isFetching`).

### Mutations

- **Add to My List:** `useMutation` that posts the movie, then invalidates the My List query.
- **Remove from My List:** an optimistic update. In `onMutate`, cancel running queries, save the old data and remove the movie from the cache. In `onError`, restore the saved data. In `onSettled`, invalidate the query.
- **Rating:** create the rating with POST the first time and update it with PATCH after that. Disable the stars while the request is pending.
- The button on the detail page shows the saved state of that movie (Add or Remove) from the cache.
- Show a toast on success and on error (shadcn sonner).

### Routing

- File-based routes exactly as in the table above, with typed `Link` components and typed params.
- Put the `queryClient` in the router context. Route loaders call `queryClient.ensureQueryData(...)` so each page opens with data ready. Set `defaultPreloadStaleTime: 0` so TanStack Query decides when data is stale.
- Validate the `/search` params (`q`, `page`) with a schema and fall back to defaults when the URL is malformed. Changing the page updates the URL.
- Set `defaultPreload: 'intent'` so data loads when the user hovers a link.
- Add a `pendingComponent`, an `errorComponent` and a `notFoundComponent`.

## Sources

- [TMDB authentication](https://developer.themoviedb.org/docs/authentication-application)
- [json-server on GitHub](https://github.com/typicode/json-server)
- [TanStack Router: data loading](https://tanstack.com/router/latest/docs/framework/react/guide/data-loading)
- [TanStack Router: search params](https://tanstack.com/router/latest/docs/framework/react/guide/search-params)

## Estimated Time

4 to 5 days.