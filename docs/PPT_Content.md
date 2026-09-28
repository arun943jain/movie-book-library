# Movie Book Library — Presentation Content (16 slides)

## Slide 1: Movie Book Library
- Full Stack Web Application — React + Node.js + Express + MongoDB Atlas
- Internship submission — Naviotech Solution Pvt Ltd
- Live: https://movie-book-library-1.onrender.com (API: https://movie-book-library-ii96.onrender.com)
- Team: Arun Kumar Jain (Backend Developer & Integration Engineer) · Ansh (Frontend Developer) · Jheel (Documentation & Project Delivery)
> Notes: 30-second hook — one searchable library for movies and books, live in production on Render + MongoDB Atlas.

## Slide 2: Introduction
- Personal media collections outgrow notes and spreadsheets
- One web library for movies AND books: posters, genres, ratings, directors
- React SPA + Express REST API + Atlas persistence, verified end to end
[IMG: Screenshots/S01-homepage-hero-search.png]
> Notes: Frame the demo — everything shown next is running code, not mockups.

## Slide 3: Problem Statement
- Collections scattered across notes, files and streaming apps
- Manual lists: no combined movie/book store, no real search or filters
- Unvalidated entry produces inconsistent records
- Need: persistent, validated, searchable, multi-device web access

## Slide 4: Objectives
- Full CRUD over REST endpoints
- Search by title/director; genre, type and rating (≥) filters
- Newest / oldest / top-rated sorting; server-side pagination, 4 per page
- Shared 1–5 rating scale from form to validation to display
- Zero-mapping UI↔API field contract; loading/error/empty states

## Slide 5: Technology Stack
- Frontend: React 19, Vite 8, custom CSS dark theme
- Backend: Node.js, Express 4, Mongoose 8 (schema + validation)
- Database: MongoDB Atlas — database `movie`, collection `items`
- Tools: VS Code REST client, MongoDB Compass, oxlint
> Notes: Atlas means zero-ops cloud persistence; Mongoose enforces every write.

## Slide 6: System Architecture
- Three tiers: React SPA → Express REST API (`/api/items`) → Mongoose → Atlas
- Stateless JSON API, CORS enabled; controllers map query params to Mongo queries
- Flow: filter change → query string → Mongo filter/sort/skip/limit → cards re-render
- Hosting: frontend = Render Static Site, backend = Render Web Service, database = MongoDB Atlas
[IMG: Architecture/system-architecture.png]
> Notes: Walk the request-flow diagram on the next click if asked.

## Slide 7: Frontend Overview
- `Library.jsx`: debounced search, AbortController, `_id`→`id`, payload sanitizer, server totals, Type/Sort controls
- `AddItemForm.jsx`: String-coercion (numeric years can't crash `.trim()`), prefill, live poster preview
- Styling untouched; Edit/Delete/View Details preserved
[IMG: Screenshots/S08-add-form-blank.png]
[IMG: Screenshots/S09-filter-bar-genres.png]

## Slide 8: Backend Overview
- 5 controllers: create, list (search/filter/sort/paginate), get, update, delete
- Aliases: `runtime`=`runtimeOrPages`, `director`=`directorOrAuthor` on every payload
- Centralized errors: 400 validation/id, 404 missing, 500 fallback; uniform envelopes
[IMG: Screenshots/S05-api-get-all-items.png]
[IMG: Screenshots/S06-api-post-create.png]

## Slide 9: Database Design
- `movie.items`: title*, type* (Movie/Book), genre*, rating* 1–5, poster, year, directorOrAuthor, runtimeOrPages, description + timestamps
- Single collection with type discriminator; default `_id` index
[IMG: Screenshots/S03-mongodb-compass-items.png]
> Notes: Point out canonical vs alias fields in the Compass shot.

## Slide 10: Features Implemented
- Add / View / Edit / Delete with confirmation and refetch
- Search, genre / type / rating filters, 3 sort orders, server pagination
- Details modal, loading / error-retry / empty / no-results states
- 13 features, each traced to UI control + API mechanism + proof
> Notes: Every item here maps to a screenshot or a passing test.

## Slide 11: Screenshots and Demo
- Homepage + filters (S01), cards with Edit/Delete (S02), prefilled Edit form (S07)
- Live demo at https://movie-book-library-1.onrender.com — order: search → filter → add → edit → delete
[IMG: Screenshots/S01-homepage-hero-search.png]
[IMG: Screenshots/S02-library-cards-actions.png]
[IMG: Screenshots/S07-edit-form-prefilled.png]
> Notes: Do the live demo from this slide (see Slide 16 for URLs).

## Slide 12: Testing
- `vite build` clean (19 modules); `oxlint` 0 errors
- 20/20 live Atlas API checks: CRUD round-trip, all filters, pagination, sorting, 400/404 paths
- Manual UI pass + Compass persistence proof
[IMG: Screenshots/S04-api-genre-filter.png]
> Notes: Emphasize test docs were created and deleted — DB left clean.

## Slide 13: Challenges
- Numeric `year` crashing `.trim()` → String-coercion + empty-year stripping
- Field-name divergence → backend alias layer, zero UI mapping
- Rating-scale drift → schema `max: 5`, documented ≥ semantics
- Client vs server pagination → server contract + page clamp; merge conflicts resolved with build+lint proof

## Slide 14: Future Scope
- JWT auth with per-user collections; watchlists and favourites
- Reviews/comments; poster image uploads; shareable filter URLs
- PWA offline support; automated test suites with CI

## Slide 15: Conclusion
- All objectives met against live Atlas: CRUD, search, filters, sorting, pagination
- Clean three-tier architecture with a zero-mapping UI↔API contract
- Released live: frontend https://movie-book-library-1.onrender.com, backend https://movie-book-library-ii96.onrender.com
- Team: Arun Kumar Jain (backend/integration/release) · Ansh (frontend/UI) · Jheel (docs/packaging)
- Thank you — open for questions
> Notes: Close on the alias contract as the engineering highlight.

## Slide 16: Live Deployment & Release
- Frontend: Render Static Site — https://movie-book-library-1.onrender.com
- Backend: Render Web Service — https://movie-book-library-ii96.onrender.com (health endpoint verified live)
- Database: MongoDB Atlas (`movie.items`); frontend built with production `VITE_API_URL`
- Live demo order: search → filter → add → edit → delete, then confirm in Atlas
- No CRUD, UI or schema changes were needed for release
> Notes: Open both URLs live from this slide; expect a cold-start delay on the free tier.
