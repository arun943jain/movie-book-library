# Screenshot Register — Movie Book Library

Source folder (untracked, not committed): `doc-assets/` — 12 raw screenshots.
Selected: **9 unique screenshots** copied to `docs/Screenshots/` with professional names.
Rejected: **3 duplicates** (listed at the bottom with reasons).

Triage rules applied: keep only unique, clear, relevant shots; drop repeated
API responses and repeated UI screens; never invent screenshots.

## Selected screenshots

### S01-homepage-hero-search.png
- **Caption:** Application homepage with hero banner, search bar, filter row and library grid.
- **Feature demonstrated:** Homepage layout, text search box, Add Movie/Book button, Genre/Type/Rating/Sort filters, poster cards loading from the database.
- **Report section:** §17 Screenshot Demonstration (Fig. 17.1); also suitable for §6 Introduction.
- **PPT slide:** Slide 11 (Screenshots and Demo); alt Slide 2 (Introduction).

### S02-library-cards-actions.png
- **Caption:** Library cards showing poster, type badge, genre, star rating, View Details, Edit and Delete actions.
- **Feature demonstrated:** View items; per-card Edit/Delete buttons; `4.5 / 5` rating display; poster-not-available placeholder card.
- **Report section:** §17 (Fig. 17.2); supports §16 Features Implemented.
- **PPT slide:** Slide 11 (Screenshots and Demo).

### S03-mongodb-compass-items.png
- **Caption:** MongoDB Compass showing documents in database `movie`, collection `items`.
- **Feature demonstrated:** Atlas persistence; stored fields `_id, title, type, genre, rating, poster, year, directorOrAuthor, runtimeOrPages, description, createdAt, updatedAt`; document count.
- **Report section:** §14 Database Design (Fig. 14.1); supports §18 Testing.
- **PPT slide:** Slide 9 (Database Design).

### S04-api-genre-filter.png
- **Caption:** REST client `GET /api/items?genre=Action` returning 200 OK with 2 matching items.
- **Feature demonstrated:** Genre-filter query parameter; paginated JSON envelope (`currentPage, totalPages, totalItems, count, items`).
- **Report section:** §15 API Design (Fig. 15.1); supports §18 Testing.
- **PPT slide:** Slide 12 (Testing); alt Slide 8 (Backend Overview).

### S05-api-get-all-items.png
- **Caption:** REST client `GET /api/items` returning 200 OK with `totalItems: 4` and full item documents.
- **Feature demonstrated:** Unfiltered list endpoint; complete stored fields including `directorOrAuthor` / `runtimeOrPages`; pagination envelope.
- **Report section:** §15 API Design (Fig. 15.2).
- **PPT slide:** Slide 8 (Backend Overview).

### S06-api-post-create.png
- **Caption:** REST client `POST /api/items` returning 201 Created with `runtime` / `director` compatibility aliases.
- **Feature demonstrated:** Create endpoint; request body; response echoing both canonical fields and frontend aliases.
- **Report section:** §15 API Design (Fig. 15.3); supports §18 Testing.
- **PPT slide:** Slide 8 (Backend Overview).

### S07-edit-form-prefilled.png
- **Caption:** Edit form prefilled from the database with poster preview, year, runtime, director and description.
- **Feature demonstrated:** Update flow; live poster-preview success state; numeric year loaded into the form (year-trim fix); runtime/director alias fields.
- **Report section:** §17 (Fig. 17.3).
- **PPT slide:** Slide 11 (Screenshots and Demo).

### S08-add-form-blank.png
- **Caption:** Blank Add Movie / Book form with all input fields.
- **Feature demonstrated:** Create UI — title, type, genre, 1–5 rating options, poster URL, release year, runtime, director, description.
- **Report section:** §17 (Fig. 17.4); supports §12 Frontend Development.
- **PPT slide:** Slide 7 (Frontend Overview).

### S09-filter-bar-genres.png
- **Caption:** Filter bar close-up with the genre dropdown open and Type, Rating and Sort controls.
- **Feature demonstrated:** Genre options (Action…Thriller); All Types / All Ratings / Newest First controls (type filter + sorting UI).
- **Report section:** §17 (Fig. 17.5); supports §12 Frontend Development.
- **PPT slide:** Slide 7 (Frontend Overview).

## Rejected screenshots

| Raw file | Reason |
|----------|--------|
| `Screenshot 2026-09-28 010128.png` (Uri / Avengers cards) | Duplicates S02 — same card layout, actions and rating display already covered. |
| `Screenshot 2026-09-28 010253.png` (`GET ?genre=Drama`) | Duplicates S04 — same genre-filter proof with a single item; S05 (Action, 2 items) is the stronger example. |
| `Screenshot 2026-09-28 010453.png` (Edit modal, top half) | Same modal as S07 with fewer fields; S07 shows prefilled year/runtime/director plus the poster-preview success state. |
