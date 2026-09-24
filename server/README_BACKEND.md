# Movie & Book Library — Backend README

Backend REST API built with **Node.js + Express.js + MongoDB + Mongoose** (ES Modules).

> Team rule respected: this backend lives entirely in `server/`. Nothing inside `client/` was modified.

---

## 1. Folder Structure

```text
server/
├── config/
│   └── db.js               # MongoDB connection (uses process.env.MONGO_URI)
├── models/
│   └── Item.js             # Mongoose schema for Movie/Book items
├── controllers/
│   └── itemController.js   # CRUD + search/filter/sort/pagination logic
├── routes/
│   └── itemRoutes.js       # Route definitions for /api/items
├── middleware/
│   └── errorHandler.js     # Centralized error handler
├── .env.example            # Example env vars (copy to .env)
├── package.json            # Dependencies + scripts
├── server.js               # Express app entry point
└── README_BACKEND.md       # This file (setup + testing guide)
```

---

## 2. Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env and set your MONGO_URI if needed
npm run dev    # development (nodemon)
# or
npm start      # production
```

### `.env` values

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/moviebooklibrary
```

- Local MongoDB default: `mongodb://localhost:27017/moviebooklibrary`
- MongoDB Atlas example: `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/moviebooklibrary`

Server runs at: `http://localhost:5000`

---

## 3. Data Model (`Item`)

| Field             | Type   | Rules                                |
| ----------------- | ------ | ------------------------------------ |
| `title`           | String | required, trim                       |
| `type`            | String | required, enum `["Movie", "Book"]`   |
| `genre`           | String | required                             |
| `rating`          | Number | required, min `1`, max `10`          |
| `poster`          | String | optional URL                         |
| `year`            | Number | optional                             |
| `directorOrAuthor`| String | optional                             |
| `runtimeOrPages`  | String | optional (e.g. `"181 min"`, `"309 pages"`) |
| `description`     | String | optional                             |
| `createdAt` / `updatedAt` | Date | automatic via `timestamps: true` |

---

## 4. REST APIs

| Method | Endpoint           | Description        |
| ------ | ------------------ | ------------------ |
| POST   | `/api/items`       | Create item        |
| GET    | `/api/items`       | Get all (query features below) |
| GET    | `/api/items/:id`   | Get single item    |
| PUT    | `/api/items/:id`   | Update item        |
| DELETE | `/api/items/:id`   | Delete item        |

### Response format

Success:

```json
{
  "success": true,
  "data": { "...": "..." }
}
```

Paginated list (`GET /api/items`) returns:

```json
{
  "success": true,
  "currentPage": 1,
  "totalPages": 5,
  "totalItems": 30,
  "count": 6,
  "items": [ "..." ],
  "data": [ "..." ]
}
```

> `data` is an alias of `items` so the paginated response also matches the standard `{ success, data }` shape.

Failure:

```json
{
  "success": false,
  "message": "Error message"
}
```

---

## 5. Query Features (`GET /api/items`)

| Feature    | Example                          | Behavior                                  |
| ---------- | -------------------------------- | ----------------------------------------- |
| Search     | `?search=harry`                  | Regex (case-insensitive) on `title` + `directorOrAuthor` |
| Genre      | `?genre=Action`                  | Exact match, case-insensitive             |
| Type       | `?type=Movie` / `?type=Book`     | Exact enum match                          |
| Rating     | `?rating=8`                      | `rating >= 8`                             |
| Pagination | `?page=1&limit=6`                | Defaults `page=1`, `limit=6`, max `50`    |
| Sort       | `?sort=newest`                   | `newest` (default), `oldest`, `rating`    |

Combine them freely:

```text
/api/items?search=russo&type=Movie&genre=Action&rating=8&page=1&limit=6&sort=rating
```

---

## 6. Postman Testing Guide

### 6.1 Setup

1. Open Postman.
2. Create a new Collection: `Movie Book Library`.
3. Set base URL variable: `baseUrl = http://localhost:5000`.
4. Set header for POST/PUT requests: `Content-Type: application/json`.

### 6.2 Sample POST body (Create)

**POST** `{{baseUrl}}/api/items`

```json
{
  "title": "Avengers Endgame",
  "type": "Movie",
  "genre": "Action",
  "rating": 9,
  "poster": "https://example.com/poster.jpg",
  "year": 2019,
  "directorOrAuthor": "Russo Brothers",
  "runtimeOrPages": "181 min",
  "description": "Marvel movie"
}
```

Sample Book body:

```json
{
  "title": "Harry Potter and the Sorcerer's Stone",
  "type": "Book",
  "genre": "Fantasy",
  "rating": 10,
  "poster": "https://example.com/hp1.jpg",
  "year": 1997,
  "directorOrAuthor": "J.K. Rowling",
  "runtimeOrPages": "309 pages",
  "description": "First book in the Harry Potter series"
}
```

Expected: `201 Created` with `{ "success": true, "data": {...} }`. Copy the `_id` for the tests below.

### 6.3 Test URLs

Replace `:id` with a real `_id` from the create step.

| # | Test          | Method | URL |
| - | ------------- | ------ | --- |
| 1 | Create        | POST   | `http://localhost:5000/api/items` |
| 2 | Get All       | GET    | `http://localhost:5000/api/items` |
| 3 | Get By ID     | GET    | `http://localhost:5000/api/items/:id` |
| 4 | Update        | PUT    | `http://localhost:5000/api/items/:id` (send JSON body with changed fields) |
| 5 | Delete        | DELETE | `http://localhost:5000/api/items/:id` |
| 6 | Search        | GET    | `http://localhost:5000/api/items?search=harry` |
| 7 | Genre filter  | GET    | `http://localhost:5000/api/items?genre=Action` |
| 8 | Type filter (Movie) | GET | `http://localhost:5000/api/items?type=Movie` |
| 9 | Type filter (Book)  | GET | `http://localhost:5000/api/items?type=Book` |
| 10 | Rating filter | GET   | `http://localhost:5000/api/items?rating=8` |
| 11 | Pagination    | GET    | `http://localhost:5000/api/items?page=1&limit=6` |
| 12 | Pagination p2 | GET    | `http://localhost:5000/api/items?page=2&limit=6` |
| 13 | Sort newest   | GET    | `http://localhost:5000/api/items?sort=newest` |
| 14 | Sort oldest   | GET    | `http://localhost:5000/api/items?sort=oldest` |
| 15 | Sort by rating| GET    | `http://localhost:5000/api/items?sort=rating` |
| 16 | Combined      | GET    | `http://localhost:5000/api/items?search=avengers&type=Movie&genre=Action&rating=8&page=1&limit=6&sort=rating` |

### 6.4 Error cases to verify

| Test | URL / Action | Expected |
| ---- | ------------ | -------- |
| Invalid ObjectId | `GET /api/items/123` | `400` `{ success:false, message:"Invalid item ID format" }` |
| Not found | `GET /api/items/64f000000000000000000000` (valid but non-existent) | `404` `{ success:false, message:"Item not found" }` |
| Validation error | `POST /api/items` with `{}` | `400` with required-field messages |
| Bad enum | `POST` with `"type": "Song"` | `400` `Type must be either 'Movie' or 'Book'` |
| Bad rating | `POST` with `"rating": 99` | `400` `Rating cannot be more than 10` |
| Bad type filter | `GET /api/items?type=Song` | `400` `Type filter must be either...` |
| Unknown route | `GET /api/unknown` | `404` `Route not found...` |

---

## 7. Status Codes Used

- `200 OK` — GET, PUT, DELETE success
- `201 Created` — POST success
- `400 Bad Request` — validation / invalid ObjectId / bad filter
- `404 Not Found` — item not found / unknown route
- `500 Internal Server Error` — unexpected server errors

---

## 8. Frontend Integration Note (recommendation only — no frontend files changed)

The existing frontend in `client/` currently:

- stores items in `localStorage` (no API calls yet),
- uses field names `image`, `director`, `author`, `runtime`, `pages` (separate),
- uses a `1–5` star rating scale.

The backend spec requires unified fields `poster`, `directorOrAuthor`, `runtimeOrPages` and a `1–10` rating scale.

**Recommended mapping when the Frontend Developer wires the API** (no change made by backend team):

```js
// Backend -> Frontend (on GET)
const toFrontend = (item) => ({
  ...item,
  id: item._id,
  image: item.poster,
  director: item.type === "Movie" ? item.directorOrAuthor : "",
  author: item.type === "Book" ? item.directorOrAuthor : "",
  runtime: item.type === "Movie" ? item.runtimeOrPages : "",
  pages: item.type === "Book" ? parseInt(item.runtimeOrPages) || "" : "",
  rating: item.rating / 2, // 1-10 backend -> 1-5 frontend stars
});

// Frontend -> Backend (on POST/PUT)
const toBackend = (form) => ({
  title: form.title,
  type: form.type,
  genre: form.genre,
  rating: Number(form.rating) * 2, // 1-5 stars -> 1-10 backend
  poster: form.image,
  year: form.year ? Number(form.year) : undefined,
  directorOrAuthor: form.type === "Movie" ? form.director : form.author,
  runtimeOrPages: form.type === "Movie" ? form.runtime : String(form.pages),
  description: form.description,
});
```

Suggested API base URL for the frontend: `http://localhost:5000/api/items` (via Vite proxy or `fetch`/`axios`).

---

## 9. Scripts

```bash
npm run dev   # nodemon server.js (auto-reload)
npm start     # node server.js
```
