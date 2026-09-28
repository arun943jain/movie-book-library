# Movie Book Library — Full Stack Web Application

A full-stack Movie & Book Library app: browse, search, filter, sort, add,
edit and delete movies and books with poster cards and star ratings, backed
by REST APIs and MongoDB Atlas.

## Live Deployment

| Layer    | Platform            | URL                                                    |
|----------|---------------------|--------------------------------------------------------|
| Frontend | Render Static Site  | `https://movie-book-library-1.onrender.com`            |
| Backend  | Render Web Service  | `https://movie-book-library-ii96.onrender.com`         |
| Database | MongoDB Atlas       | database `movie`, collection `items`                   |

Backend health check: `GET https://movie-book-library-ii96.onrender.com/`
returns `{"success": true, "message": "Movie & Book Library API is running"}`.
The deployed frontend is built with
`VITE_API_URL=https://movie-book-library-ii96.onrender.com/api/items`,
so every search, filter, sort, page and CRUD action runs against production data.

## Features

- View library items as poster cards (title, type badge, genre, ⭐ rating / 5)
- Add Movie/Book through a modal form with live poster preview
- Edit Movie/Book with the form prefilled from the database
- Delete Movie/Book with a confirmation prompt
- Item details modal (release year, runtime, director, description)
- Search by title (`?search=`, case-insensitive)
- Filter by genre (`?genre=`), type (`?type=Movie|Book`), rating (`?rating=`, greater-than-or-equal, 1–5 scale)
- Sorting (`?sort=newest|oldest|rating`)
- Server-side pagination (`?page=&limit=`, 4 cards per page in the UI)
- Loading, error-with-retry, empty-library and no-results states
- Responsive dark UI built with React + Vite + CSS

## Tech Stack

| Layer    | Technology                                    |
|----------|-----------------------------------------------|
| Frontend | React.js 19, Vite 8, CSS                      |
| Backend  | Node.js, Express.js 4, Mongoose 8             |
| Database | MongoDB Atlas — database `movie`, collection `items` |
| Test tools | VS Code REST client, MongoDB Compass, oxlint |

## Folder Structure

```text
movie-book-library/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── pages/Library.jsx      # Library page: fetch, search, filter, CRUD wiring
│   │   ├── components/AddItemForm.jsx  # Add/Edit modal form
│   │   ├── App.jsx / App.css / main.jsx / index.css
│   ├── .env.example               # VITE_API_URL template
│   └── package.json
├── server/                        # Express + Mongoose backend
│   ├── config/db.js               # Atlas connection (MONGO_URI)
│   ├── models/Item.js             # Item schema (1–5 rating, field aliases)
│   ├── controllers/itemController.js  # CRUD + search/filter/sort/pagination
│   ├── routes/itemRoutes.js       # /api/items routes
│   ├── middleware/errorHandler.js # Centralized error handling
│   ├── .env.example / package.json / server.js
│   └── README_BACKEND.md
└── docs/                          # Submission pack (this folder)
    ├── README.md                  # This file
    ├── Project_Report.md / .docx  # Internship report (source + Word)
    ├── PPT_Content.md / Presentation.pptx
    ├── screenshot-register.md
    ├── FINAL_CHECKLIST.md
    ├── Screenshots/               # 9 selected screenshots
    └── Architecture/              # system-architecture.png, request-flow.png
```

## Installation

### Local Setup — Backend

```bash
cd server
npm install
cp .env.example .env   # set MONGO_URI and PORT
npm run dev            # http://localhost:5000
```

### Local Setup — Frontend

```bash
cd client
npm install
cp .env.example .env   # optional; default API URL is baked in
npm run dev            # http://localhost:5173
```

Run the backend first, then the frontend. (The sections above are for
local development only — production runs at the Live Deployment URLs.)

## Deployment Architecture

```text
Browser
  │  https://movie-book-library-1.onrender.com  (Render Static Site: Vite build)
  ▼
https://movie-book-library-ii96.onrender.com/api/items  (Render Web Service: Node + Express)
  ▼
MongoDB Atlas — database `movie`, collection `items`
```

Production workflow: the frontend's filter/sort/page controls build the API
query string; the Render web service translates it into MongoDB queries and
returns the paginated envelope; `POST`/`PUT`/`DELETE` refetch the list so the
UI always reflects Atlas data. CORS is open on the API, so the deployed
static site is accepted without extra configuration.

## Environment Variables

| File            | Variable       | Local example                                                  | Production value                                                     |
|-----------------|----------------|----------------------------------------------------------------|----------------------------------------------------------------------|
| `server/.env`   | `MONGO_URI`    | `mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/movie` | Existing Atlas string (Render dashboard secret, never committed)     |
| `server/.env`   | `PORT`         | `5000`                                                         | Auto-injected by Render                                              |
| `client/.env`   | `VITE_API_URL` | `http://localhost:5000/api/items`                              | `https://movie-book-library-ii96.onrender.com/api/items` (Vercel/Render dashboard, set before build) |

## API Endpoints

| Method | Endpoint           | Description                                    |
|--------|--------------------|------------------------------------------------|
| POST   | `/api/items`       | Create item → `201` + created document         |
| GET    | `/api/items`       | List with search/filter/sort/pagination        |
| GET    | `/api/items/:id`   | Single item (`400` invalid id, `404` missing)  |
| PUT    | `/api/items/:id`   | Update item (schema validators run on update)  |
| DELETE | `/api/items/:id`   | Delete item                                    |

Query parameters: `search` (regex on title + directorOrAuthor),
`genre` (exact, case-insensitive), `type` (`Movie`/`Book`),
`rating` (greater-than-or-equal), `sort` (`newest`/`oldest`/`rating`),
`page`, `limit`.

List responses use the envelope
`{ success, currentPage, totalPages, totalItems, count, items, data }`.
Every item additionally carries `runtime` (= `runtimeOrPages`) and
`director` (= `directorOrAuthor`) so the UI consumes the API directly.

## Project Workflow

1. The Library page loads and fetches the current page from MongoDB.
2. Search text (debounced), genre/type/rating filters, sort order and page
   number are sent as query parameters; the server filters, sorts and
   paginates in MongoDB.
3. Add sends `POST`; the form closes and the list refetches newest-first.
   Edit prefills the form and sends `PUT`. Delete asks for confirmation,
   sends `DELETE`, then refetches (page auto-clamped if emptied).
4. Mongoose revalidates every write; API failures surface as friendly
   loading/error/empty UI states.

## Team Members

| Name            | Role                                |
|-----------------|-------------------------------------|
| Arun Kumar Jain | Backend Developer & Integration Engineer |
| Ansh            | Frontend Developer                  |
| Jheel           | Documentation & Project Delivery    |

## Contribution Section

**Arun Kumar Jain — Backend Developer & Integration Engineer**
- Designed and implemented Node.js + Express backend
- MongoDB database integration
- CRUD APIs
- Search, filter and pagination APIs
- Backend testing
- Frontend-backend integration
- Deployment support
- Final project integration and release

**Ansh — Frontend Developer**
- React frontend development
- UI design
- Forms and validation
- Movie and Book cards
- Edit/Delete UI
- Search and filter interface
- Frontend bug fixes
- Frontend deployment support

**Jheel — Documentation & Project Delivery**
- Project report
- PPT preparation
- Architecture diagrams
- Screenshots organization
- README preparation
- Final documentation
- Deployment documentation
- Final submission package

## Future Scope

- User accounts with JWT authentication and per-user collections
- Watchlist / favourites and reading progress
- Reviews and comments per item
- Poster image upload instead of URL-only posters
- Shareable filter URLs, PWA offline support
- Automated unit/integration test suites with CI

## Conclusion

A complete, integrated React/Express/MongoDB CRUD application: responsive
UI, validated REST APIs, Atlas persistence, and verified search, filter,
sort and pagination — live in production at
https://movie-book-library-1.onrender.com
(backed by https://movie-book-library-ii96.onrender.com),
ready for evaluation and extension.
