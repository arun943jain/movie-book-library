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

| Field             | Type   | Rules                                                        |
| ----------------- | ------ | ------------------------------------------------------------ |
| `title`           | String | required, trim                                               |
| `type`            | String | required, enum `["Movie", "Book"]`                           |
| `genre`           | String | required                                                     |
| `rating`          | Number | required, min `1`, max `5` (decimals allowed: 1, 1.5, 2, … 4.5, 5) |
| `poster`          | String | optional URL                                                 |
| `year`            | Number | optional                                                     |
| `directorOrAuthor`| String | optional — **internal storage** (see aliases below)          |
| `runtimeOrPages`  | String | optional — **internal storage** (e.g. `"2h 30m"`, `"309 pages"`) |
| `description`     | String | optional                                                     |
| `createdAt` / `updatedAt` | Date | automatic via `timestamps: true`                         |

### Compatibility aliases (frontend ↔ backend)

| Frontend field | Stored as (MongoDB) | Direction                     |
| -------------- | ------------------- | ----------------------------- |
| `runtime`      | `runtimeOrPages`    | accepted on POST/PUT, returned on GET |
| `director`     | `directorOrAuthor`  | accepted on POST/PUT, returned on GET |

- On **POST/PUT** you may send either name. `runtime` is saved as `runtimeOrPages`, `director` is saved as `directorOrAuthor`. If both versions are present, the canonical name (`runtimeOrPages` / `directorOrAuthor`) is the source of truth.
- On **GET** responses every item contains **both** names: `runtime` mirrors `runtimeOrPages`, and `director` mirrors `directorOrAuthor` — single item, list, search, filtered and paginated results alike — so the frontend consumes the API with no mapping.

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

Each item in a GET response contains both the stored and frontend field names:

```json
{
  "_id": "64f000000000000000000001",
  "title": "Inception",
  "type": "Movie",
  "genre": "Sci-Fi",
  "rating": 4.5,
  "poster": "https://example.com/poster.jpg",
  "year": 2024,
  "directorOrAuthor": "Christopher Nolan",
  "director": "Christopher Nolan",
  "runtimeOrPages": "2h 30m",
  "runtime": "2h 30m",
  "description": "A mind-bending thriller"
}
```

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
| Rating     | `?rating=4`                      | `rating >= 4` (scale is 1–5)              |
| Pagination | `?page=1&limit=6`                | Defaults `page=1`, `limit=6`, max `50`    |
| Sort       | `?sort=newest`                   | `newest` (default), `oldest`, `rating`    |

Combine them freely:

```text
/api/items?search=nolan&type=Movie&genre=Sci-Fi&rating=4&page=1&limit=6&sort=rating
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

Send the **exact frontend payload** — no mapping needed. The backend stores
`runtime` as `runtimeOrPages` and `director` as `directorOrAuthor` automatically
(the canonical names work too).

```json
{
  "title": "Inception",
  "type": "Movie",
  "genre": "Sci-Fi",
  "rating": 4.5,
  "poster": "https://example.com/poster.jpg",
  "year": 2024,
  "runtime": "2h 30m",
  "director": "Christopher Nolan",
  "description": "A mind-bending thriller"
}
```

Sample Book body:

```json
{
  "title": "Harry Potter and the Sorcerer's Stone",
  "type": "Book",
  "genre": "Fantasy",
  "rating": 5,
  "poster": "https://example.com/hp1.jpg",
  "year": 1997,
  "director": "J.K. Rowling",
  "runtime": "309 pages",
  "description": "First book in the Harry Potter series"
}
```

> `rating` uses the 1–5 scale (allowed: 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5;
> decimals allowed). Prefer `director` / `runtime`, but `directorOrAuthor` /
> `runtimeOrPages` are also accepted on POST/PUT.

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
| 10 | Rating filter | GET   | `http://localhost:5000/api/items?rating=4` |
| 11 | Pagination    | GET    | `http://localhost:5000/api/items?page=1&limit=6` |
| 12 | Pagination p2 | GET    | `http://localhost:5000/api/items?page=2&limit=6` |
| 13 | Sort newest   | GET    | `http://localhost:5000/api/items?sort=newest` |
| 14 | Sort oldest   | GET    | `http://localhost:5000/api/items?sort=oldest` |
| 15 | Sort by rating| GET    | `http://localhost:5000/api/items?sort=rating` |
| 16 | Combined      | GET    | `http://localhost:5000/api/items?search=nolan&type=Movie&genre=Sci-Fi&rating=4&page=1&limit=6&sort=rating` |

### 6.4 Error cases to verify

| Test | URL / Action | Expected |
| ---- | ------------ | -------- |
| Invalid ObjectId | `GET /api/items/123` | `400` `{ success:false, message:"Invalid item ID format" }` |
| Not found | `GET /api/items/64f000000000000000000000` (valid but non-existent) | `404` `{ success:false, message:"Item not found" }` |
| Validation error | `POST /api/items` with `{}` | `400` with required-field messages |
| Bad enum | `POST` with `"type": "Song"` | `400` `Type must be either 'Movie' or 'Book'` |
| Bad rating | `POST` with `"rating": 5.5` | `400` `Rating cannot be more than 5` |
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

## 8. Frontend Integration (direct compatibility — no mapping needed)

The frontend sends this payload **as-is** — no mapping code required:

```json
{
  "title": "Inception",
  "type": "Movie",
  "genre": "Sci-Fi",
  "rating": 4.5,
  "poster": "https://example.com/poster.jpg",
  "year": 2024,
  "runtime": "2h 30m",
  "director": "Christopher Nolan",
  "description": "A mind-bending thriller"
}
```

Backend behavior:

- `POST` / `PUT`: `runtime` → stored as `runtimeOrPages`, `director` → stored as `directorOrAuthor`. `rating` uses the same 1–5 scale (decimals allowed). `poster`, `year`, `description` pass through unchanged.
- `GET` (single, list, search, filtered, paginated): every item returns **both** names, so the frontend renders `item.runtime` and `item.director` directly:

```js
// GET /api/items/:id -> res.data.data
{
  title: "Inception",
  rating: 4.5,                    // same 1-5 scale, no conversion
  poster: "https://...",         // use directly in <img src>
  runtime: "2h 30m",             // alias of runtimeOrPages
  runtimeOrPages: "2h 30m",      // stored value (same content)
  director: "Christopher Nolan", // alias of directorOrAuthor
  directorOrAuthor: "Christopher Nolan",
  // ...
}
```

Suggested API base URL for the frontend: `http://localhost:5000/api/items` (via Vite proxy or `fetch`/`axios`).

---

## 9. Scripts

```bash
npm run dev   # nodemon server.js (auto-reload)
npm start     # node server.js
```
