import { useCallback, useEffect, useState } from "react";
import AddItemForm from "../components/AddItemForm";

// Backend base URL. Override it with a `client/.env` file:
//   VITE_API_URL=http://localhost:5000/api/items
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api/items";

function Library() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");
  const [itemType, setItemType] = useState("");
  const [sort, setSort] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const itemsPerPage = 4;

  // Debounce the search box so we don't hit the API on every keystroke.
  // The input stays responsive (`search`), the API uses `debouncedSearch`.
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);

    return () => clearTimeout(timer);
  }, [search]);

  // Backend documents use `_id`. The UI below (keys, edit, delete,
  // details modal) works with `id`, so normalize once after fetching.
  const normalizeItem = (item) => ({
    ...item,
    id: item._id || item.id,
  });

  // Backend `year` is a Number: drop an empty string so Mongoose never
  // receives `""` (which would fail number casting). Also strip
  // client-only / read-only keys before POST/PUT.
  const sanitizePayload = (item) => {
    const payload = { ...item };

    delete payload.id;
    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;

    if (payload.year === "" || payload.year === undefined) {
      delete payload.year;
    }

    return payload;
  };

  // Build backend query string from the UI controls:
  // ?search=&genre=&type=&rating=&sort=&page=&limit=
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams();

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }

    if (genre) {
      params.set("genre", genre);
    }

    if (itemType) {
      params.set("type", itemType);
    }

    if (rating) {
      params.set("rating", rating);
    }

    if (sort) {
      params.set("sort", sort);
    }

    params.set("page", String(currentPage));
    params.set("limit", String(itemsPerPage));

    return params.toString();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, genre, itemType, rating, sort, currentPage]);

  // GET /api/items — load the current page from MongoDB.
  const fetchItems = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}?${buildQuery()}`,
          { signal }
        );

        if (!response.ok) {
          throw new Error(
            `Server responded with status ${response.status}.`
          );
        }

        const data = await response.json();

        setItems((data.items || []).map(normalizeItem));
        setTotalPages(data.totalPages || 0);
        setTotalItems(data.totalItems || 0);
      } catch (err) {
        // Ignore cancellations from React StrictMode / fast typing.
        if (err.name === "AbortError") {
          return;
        }

        setItems([]);
        setTotalPages(0);
        setTotalItems(0);
        setError(
          "Could not load your library. Please check that the backend is running (http://localhost:5000) and try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [buildQuery]
  );

  // Load from the database on mount and whenever filters/sort/page change.
  useEffect(() => {
    const controller = new AbortController();

    fetchItems(controller.signal);

    return () => controller.abort();
  }, [fetchItems]);

  // Keep the page in range when the result set shrinks
  // (e.g. after deleting the last item on the last page).
  useEffect(() => {
    if (loading) {
      return;
    }

    if (totalPages === 0) {
      if (currentPage !== 1) {
        setCurrentPage(1);
      }
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage, loading]);

  // POST /api/items — add a new movie/book, then show it immediately.
  const addItem = async (newItem) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizePayload(newItem)),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Server rejected the new item."
        );
      }

      setShowForm(false);

      // Newest items sort first, so jump back to page 1.
      // (If already there, refetch directly.)
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        await fetchItems();
      }
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }

      alert(`Could not add item: ${err.message}`);
    }
  };

  // DELETE /api/items/:id — remove from the database, then refresh.
  const deleteItem = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          `Server responded with status ${response.status}.`
        );
      }

      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }

      // Refresh; the clamp effect above fixes the page if it is now empty.
      await fetchItems();
    } catch (err) {
      alert(`Could not delete item: ${err.message}`);
    }
  };

  const editItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  // PUT /api/items/:id — save edits, then refresh the list.
  const updateItem = async (updatedItem) => {
    try {
      const itemId = updatedItem._id || updatedItem.id;

      const response = await fetch(`${API_BASE_URL}/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizePayload(updatedItem)),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Server rejected the update."
        );
      }

      const data = await response.json();
      const savedItem = normalizeItem(data.data);

      setEditingItem(null);
      setShowForm(false);

      if (selectedItem?.id === savedItem.id) {
        setSelectedItem(savedItem);
      }

      await fetchItems();
    } catch (err) {
      alert(`Could not update item: ${err.message}`);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const changePage = (page) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getPoster = (item) => {
    return (
      item.poster ||
      item.posterUrl ||
      item.imageUrl ||
      item.image ||
      ""
    ).trim();
  };

  const hasActiveFilters = Boolean(
    search.trim() || genre || itemType || rating
  );

  return (
    <div className="library">
      <header className="hero">
        <h1>Movie & Book Library</h1>
        <p>Browse, search and manage your collection.</p>
      </header>

      <div className="library-container">
        <div className="top-bar">
          <input
            type="text"
            placeholder="Search movies or books..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <button
            onClick={() => {
              setEditingItem(null);
              setShowForm(true);
            }}
          >
            Add Movie / Book
          </button>
        </div>

        <div className="filters">
          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Genres</option>
            <option value="Action">Action</option>
            <option value="Comedy">Comedy</option>
            <option value="Drama">Drama</option>
            <option value="Horror">Horror</option>
            <option value="Romance">Romance</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Thriller">Thriller</option>
          </select>

          <select
            value={itemType}
            onChange={(e) => {
              setItemType(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Types</option>
            <option value="Movie">Movies</option>
            <option value="Book">Books</option>
          </select>

          <select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {loading && items.length === 0 && !error ? (
          <div className="empty-library">
            <div className="empty-icon">▣</div>

            <h2>Loading your library...</h2>

            <p>Fetching movies and books from the server.</p>
          </div>
        ) : error && items.length === 0 ? (
          <div className="empty-library">
            <div className="empty-icon">▣</div>

            <h2>Something went wrong</h2>

            <p>{error}</p>

            <button
              className="empty-add-button"
              onClick={() => fetchItems()}
            >
              Retry
            </button>
          </div>
        ) : totalItems === 0 ? (
          <div className="empty-library">
            <div className="empty-icon">▣</div>

            <h2>
              {hasActiveFilters
                ? "No matching items found"
                : "Your library is empty"}
            </h2>

            <p>
              {hasActiveFilters
                ? "Try changing your search or filters."
                : "Start building your collection by adding a movie or book."}
            </p>

            {!hasActiveFilters && (
              <button
                className="empty-add-button"
                onClick={() => {
                  setEditingItem(null);
                  setShowForm(true);
                }}
              >
                + Add Movie / Book
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="items-grid">
              {items.map((item) => {
                const poster = getPoster(item);

                return (
                  <div className="item-card" key={item.id}>
                    <div
                      className="poster-container"
                      style={
                        poster
                          ? {
                              "--poster-background": `url("${poster}")`,
                            }
                          : {}
                      }
                    >
                      {poster ? (
                        <img
                          src={poster}
                          alt={`${item.title} poster`}
                          className="item-poster"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";

                            const placeholder =
                              event.currentTarget.parentElement.querySelector(
                                ".poster-placeholder"
                              );

                            if (placeholder) {
                              placeholder.style.display = "flex";
                            }

                            event.currentTarget.parentElement.style.setProperty(
                              "--poster-background",
                              "none"
                            );
                          }}
                        />
                      ) : null}

                      <div
                        className="poster-placeholder"
                        style={{
                          display: poster ? "none" : "flex",
                        }}
                      >
                        <span>🎬</span>
                        <span>Poster not available</span>
                      </div>
                    </div>

                    <div className="item-card-content">
                      <h3>{item.title}</h3>

                      <span className="item-type">
                        🎬 {item.type || "Movie"}
                      </span>

                      <div className="basic-details">
                        <p>
                          <strong>Genre:</strong>{" "}
                          {item.genre || "Not specified"}
                        </p>

                        <p>
                          <strong>Rating:</strong>{" "}
                          ⭐ {item.rating || "N/A"} / 5
                        </p>
                      </div>

                      <button
                        className="view-details-button"
                        onClick={() => setSelectedItem(item)}
                      >
                        View Details
                      </button>

                      <div className="item-actions">
                        <button
                          onClick={() => editItem(item)}
                          className="edit-button"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteItem(item.id)}
                          className="delete-button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() => changePage(currentPage - 1)}
                >
                  Previous
                </button>

                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1
                ).map((page) => (
                  <button
                    key={page}
                    className={
                      currentPage === page ? "active-page" : ""
                    }
                    onClick={() => changePage(page)}
                  >
                    {page}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => changePage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <AddItemForm
          onAdd={addItem}
          onUpdate={updateItem}
          onClose={closeForm}
          editingItem={editingItem}
        />
      )}

      {selectedItem && (
        <div
          className="details-overlay"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="details-close-button"
              onClick={() => setSelectedItem(null)}
            >
              ×
            </button>

            <div
              className="details-poster-container"
              style={
                getPoster(selectedItem)
                  ? {
                      "--details-poster-background": `url("${getPoster(
                        selectedItem
                      )}")`,
                    }
                  : {}
              }
            >
              {getPoster(selectedItem) ? (
                <img
                  src={getPoster(selectedItem)}
                  alt={`${selectedItem.title} poster`}
                  className="details-poster"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";

                    const placeholder =
                      event.currentTarget.parentElement.querySelector(
                        ".details-poster-placeholder"
                      );

                    if (placeholder) {
                      placeholder.style.display = "flex";
                    }

                    event.currentTarget.parentElement.style.setProperty(
                      "--details-poster-background",
                      "none"
                    );
                  }}
                />
              ) : null}

              <div
                className="details-poster-placeholder"
                style={{
                  display: getPoster(selectedItem) ? "none" : "flex",
                }}
              >
                <span>🎬</span>
                <span>Poster not available</span>
              </div>
            </div>

            <div className="details-content">
              <h2>{selectedItem.title}</h2>

              <span className="item-type details-type">
                🎬 {selectedItem.type || "Movie"}
              </span>

              <div className="details-info">
                <p>
                  <strong>Genre:</strong>{" "}
                  {selectedItem.genre || "Not specified"}
                </p>

                <p>
                  <strong>Rating:</strong>{" "}
                  ⭐ {selectedItem.rating || "N/A"} / 5
                </p>

                <p>
                  <strong>Release Year:</strong>{" "}
                  {selectedItem.releaseYear ||
                    selectedItem.year ||
                    "Not specified"}
                </p>

                <p>
                  <strong>Runtime:</strong>{" "}
                  {selectedItem.runtime || "Not specified"}
                </p>

                <p>
                  <strong>Director:</strong>{" "}
                  {selectedItem.director || "Not specified"}
                </p>
              </div>

              <div className="details-description">
                <h3>Description</h3>

                <p>
                  {selectedItem.description ||
                    "No description available."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Library;
