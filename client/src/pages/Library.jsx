import { useEffect, useState } from "react";
import AddItemForm from "../components/AddItemForm";

function Library() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  useEffect(() => {
    const savedItems = localStorage.getItem("movieBookLibrary");

    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch {
        setItems([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("movieBookLibrary", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem) => {
    const itemWithId = {
      ...newItem,
      id: Date.now(),
    };

    setItems((previousItems) => [
      ...previousItems,
      itemWithId,
    ]);

    setShowForm(false);
    setCurrentPage(1);
  };

  const deleteItem = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

    setItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );

    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }

    setCurrentPage(1);
  };

  const editItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const updateItem = (updatedItem) => {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );

    setEditingItem(null);
    setShowForm(false);

    if (selectedItem?.id === updatedItem.id) {
      setSelectedItem(updatedItem);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const filteredItems = items.filter((item) => {
    const title = item.title || "";
    const itemGenre = item.genre || "";

    const matchesSearch = title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesGenre =
      genre === "" ||
      itemGenre.toLowerCase() === genre.toLowerCase();

    const matchesRating =
      rating === "" ||
      Math.floor(Number(item.rating)) === Number(rating);

    return matchesSearch && matchesGenre && matchesRating;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
        </div>

        {filteredItems.length === 0 ? (
          <div className="empty-library">
            <div className="empty-icon">▣</div>

            <h2>
              {items.length === 0
                ? "Your library is empty"
                : "No matching items found"}
            </h2>

            <p>
              {items.length === 0
                ? "Start building your collection by adding a movie or book."
                : "Try changing your search or filters."}
            </p>

            {items.length === 0 && (
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
              {currentItems.map((item) => {
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
