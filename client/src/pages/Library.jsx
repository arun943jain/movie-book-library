import { useEffect, useState } from "react";
import AddItemForm from "../components/AddItemForm";

const API_URL = "http://localhost:5000/api/items";

function Library() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const itemsPerPage = 4;

  // =====================================================
  // LOAD ALL ITEMS FROM MONGODB
  // =====================================================

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");

      // Load all items from MongoDB.
      // Filtering and pagination are handled below in React.
      const response = await fetch(
        `${API_URL}?page=1&limit=1000`
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to load library."
        );
      }

      const receivedItems = Array.isArray(result.items)
        ? result.items
        : Array.isArray(result.data)
        ? result.data
        : [];

      setItems(receivedItems);

      return receivedItems;
    } catch (err) {
      console.error("Failed to load items:", err);

      setItems([]);

      setError(
        err.message ||
          "Unable to connect to the backend server."
      );

      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load MongoDB data when page opens.
  useEffect(() => {
    fetchItems();
  }, []);

  // =====================================================
  // FILTER ITEMS
  // =====================================================

  const filteredItems = items.filter((item) => {
    const title = String(item.title || "").toLowerCase();
    const itemGenre = String(item.genre || "").toLowerCase();
    const itemRating = Number(item.rating || 0);

    const searchValue = search
      .trim()
      .toLowerCase();

    // Search by title.
    const matchesSearch =
      searchValue === "" ||
      title.includes(searchValue);

    // Genre filter.
    const matchesGenre =
      genre === "" ||
      itemGenre === genre.toLowerCase();

    // Rating filter:
    // Keep the requested behavior:
    // selecting 4 means rating >= 4.
    const matchesRating =
      rating === "" ||
      itemRating >= Number(rating);

    return (
      matchesSearch &&
      matchesGenre &&
      matchesRating
    );
  });

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalItems = filteredItems.length;

  const totalPages =
    totalItems === 0
      ? 1
      : Math.ceil(totalItems / itemsPerPage);

  // Keep page valid after filtering/deleting.
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const startIndex =
    (currentPage - 1) * itemsPerPage;

  const currentItems = filteredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // =====================================================
  // ADD ITEM
  // =====================================================

  const addItem = async (newItem) => {
    try {
      setError("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to add item."
        );
      }

      setShowForm(false);
      setEditingItem(null);
      setCurrentPage(1);

      // Reload from MongoDB.
      await fetchItems();

    } catch (err) {
      console.error("Failed to add item:", err);

      alert(
        err.message ||
          "Unable to add item. Please check that the backend is running."
      );
    }
  };

  // =====================================================
  // DELETE ITEM
  // =====================================================

  const deleteItem = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this item?"
    );

    if (!confirmDelete) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to delete item."
        );
      }

      const selectedId =
        selectedItem?._id ||
        selectedItem?.id;

      if (
        selectedId &&
        String(selectedId) === String(id)
      ) {
        setSelectedItem(null);
      }

      // Reload from MongoDB.
      await fetchItems();

    } catch (err) {
      console.error("Failed to delete item:", err);

      alert(
        err.message ||
          "Unable to delete item."
      );
    }
  };

  // =====================================================
  // OPEN EDIT FORM
  // =====================================================

  const editItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  // =====================================================
  // UPDATE ITEM
  // =====================================================

  const updateItem = async (updatedItem) => {
    const itemId =
      updatedItem._id ||
      updatedItem.id;

    if (!itemId) {
      alert(
        "Unable to update item: item ID is missing."
      );
      return;
    }

    try {
      setError("");

      /*
       * IMPORTANT:
       * Do not send MongoDB's _id back in the
       * update body.
       */
      const updateData = {
        title: updatedItem.title || "",
        type: updatedItem.type || "Movie",
        genre: updatedItem.genre || "",
        rating: Number(updatedItem.rating),
        poster: updatedItem.poster || "",
        year: updatedItem.year || "",
        runtime: updatedItem.runtime || "",
        director: updatedItem.director || "",
        description: updatedItem.description || "",
      };

      const response = await fetch(
        `${API_URL}/${itemId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update item."
        );
      }

      const updatedFromServer =
        result.data ||
        result.item ||
        updateData;

      // Update details modal if it is open.
      if (selectedItem) {
        const selectedId =
          selectedItem._id ||
          selectedItem.id;

        if (
          String(selectedId) ===
          String(itemId)
        ) {
          setSelectedItem(
            updatedFromServer
          );
        }
      }

      setEditingItem(null);
      setShowForm(false);

      // Reload the updated item from MongoDB.
      await fetchItems();

    } catch (err) {
      console.error(
        "Failed to update item:",
        err
      );

      alert(
        err.message ||
          "Unable to update item."
      );
    }
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  // =====================================================
  // POSTER URL
  // =====================================================

  const getPoster = (item) => {
    return (
      item.poster ||
      item.posterUrl ||
      item.imageUrl ||
      item.image ||
      ""
    ).trim();
  };

  // =====================================================
  // PAGE CHANGE
  // =====================================================

  const changePage = (page) => {
    if (
      page < 1 ||
      page > totalPages
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="library">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="hero">

        <h1>
          Movie & Book Library
        </h1>

        <p>
          Browse, search and manage your collection.
        </p>

      </header>

      <div className="library-container">

        {/* =====================================================
            SEARCH + ADD
        ===================================================== */}

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

        {/* =====================================================
            FILTERS
        ===================================================== */}

        <div className="filters">

          <select
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setCurrentPage(1);
            }}
          >

            <option value="">
              All Genres
            </option>

            <option value="Action">
              Action
            </option>

            <option value="Comedy">
              Comedy
            </option>

            <option value="Drama">
              Drama
            </option>

            <option value="Horror">
              Horror
            </option>

            <option value="Romance">
              Romance
            </option>

            <option value="Sci-Fi">
              Sci-Fi
            </option>

            <option value="Thriller">
              Thriller
            </option>

          </select>

          <select
            value={rating}
            onChange={(e) => {
              setRating(e.target.value);
              setCurrentPage(1);
            }}
          >

            <option value="">
              All Ratings
            </option>

            <option value="5">
              5 Stars
            </option>

            <option value="4">
              4 Stars
            </option>

            <option value="3">
              3 Stars
            </option>

            <option value="2">
              2 Stars
            </option>

            <option value="1">
              1 Star
            </option>

          </select>

        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {error ? (

          <div className="empty-library">

            <div className="empty-icon">
              ▣
            </div>

            <h2>
              Unable to load library
            </h2>

            <p>
              {error}
            </p>

          </div>

        ) : loading ? (

          /* =====================================================
             LOADING
          ===================================================== */

          <div className="empty-library">

            <div className="empty-icon">
              ▣
            </div>

            <h2>
              Loading library...
            </h2>

            <p>
              Please wait while your collection loads.
            </p>

          </div>

        ) : currentItems.length === 0 ? (

          /* =====================================================
             EMPTY / NO RESULTS
          ===================================================== */

          <div className="empty-library">

            <div className="empty-icon">
              ▣
            </div>

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

          /* =====================================================
             ITEMS
          ===================================================== */

          <>

            <div className="items-grid">

              {currentItems.map((item) => {

                const poster =
                  getPoster(item);

                const itemId =
                  item._id ||
                  item.id;

                return (

                  <div
                    className="item-card"
                    key={itemId}
                  >

                    {/* ================================
                        POSTER
                    ================================= */}

                    <div
                      className="poster-container"
                      style={
                        poster
                          ? {
                              "--poster-background":
                                `url("${poster}")`,
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

                            event.currentTarget.style.display =
                              "none";

                            const placeholder =
                              event.currentTarget.parentElement.querySelector(
                                ".poster-placeholder"
                              );

                            if (placeholder) {
                              placeholder.style.display =
                                "flex";
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
                          display:
                            poster
                              ? "none"
                              : "flex",
                        }}
                      >

                        <span>
                          🎬
                        </span>

                        <span>
                          Poster not available
                        </span>

                      </div>

                    </div>

                    {/* ================================
                        CARD CONTENT
                    ================================= */}

                    <div className="item-card-content">

                      <h3>
                        {item.title}
                      </h3>

                      <span className="item-type">
                        🎬{" "}
                        {item.type ||
                          "Movie"}
                      </span>

                      <div className="basic-details">

                        <p>
                          <strong>
                            Genre:
                          </strong>{" "}
                          {item.genre ||
                            "Not specified"}
                        </p>

                        <p>
                          <strong>
                            Rating:
                          </strong>{" "}
                          ⭐{" "}
                          {item.rating ||
                            "N/A"}{" "}
                          / 5
                        </p>

                      </div>

                      <button
                        className="view-details-button"
                        onClick={() =>
                          setSelectedItem(item)
                        }
                      >
                        View Details
                      </button>

                      <div className="item-actions">

                        <button
                          onClick={() =>
                            editItem(item)
                          }
                          className="edit-button"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteItem(itemId)
                          }
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

            {/* =================================================
                PAGINATION
            ================================================= */}

            {totalPages > 1 && (

              <div className="pagination">

                <button
                  disabled={
                    currentPage === 1
                  }
                  onClick={() =>
                    changePage(
                      currentPage - 1
                    )
                  }
                >
                  Previous
                </button>

                {Array.from(
                  {
                    length:
                      totalPages,
                  },
                  (_, index) =>
                    index + 1
                ).map((page) => (

                  <button
                    key={page}
                    className={
                      currentPage === page
                        ? "active-page"
                        : ""
                    }
                    onClick={() =>
                      changePage(page)
                    }
                  >
                    {page}
                  </button>

                ))}

                <button
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  onClick={() =>
                    changePage(
                      currentPage + 1
                    )
                  }
                >
                  Next
                </button>

              </div>

            )}

          </>

        )}

      </div>

      {/* =====================================================
          ADD / EDIT FORM
      ===================================================== */}

      {showForm && (

        <AddItemForm
          onAdd={addItem}
          onUpdate={updateItem}
          onClose={closeForm}
          editingItem={editingItem}
        />

      )}

      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedItem && (

        <div
          className="details-overlay"
          onClick={() =>
            setSelectedItem(null)
          }
        >

          <div
            className="details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="details-close-button"
              onClick={() =>
                setSelectedItem(null)
              }
            >
              ×
            </button>

            {/* ================================
                DETAILS POSTER
            ================================= */}

            <div
              className="details-poster-container"
              style={
                getPoster(selectedItem)
                  ? {
                      "--details-poster-background":
                        `url("${getPoster(
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

                    event.currentTarget.style.display =
                      "none";

                    const placeholder =
                      event.currentTarget.parentElement.querySelector(
                        ".details-poster-placeholder"
                      );

                    if (placeholder) {
                      placeholder.style.display =
                        "flex";
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
                  display:
                    getPoster(
                      selectedItem
                    )
                      ? "none"
                      : "flex",
                }}
              >

                <span>
                  🎬
                </span>

                <span>
                  Poster not available
                </span>

              </div>

            </div>

            {/* ================================
                DETAILS CONTENT
            ================================= */}

            <div className="details-content">

              <h2>
                {selectedItem.title}
              </h2>

              <span className="item-type details-type">

                🎬{" "}
                {selectedItem.type ||
                  "Movie"}

              </span>

              <div className="details-info">

                <p>
                  <strong>
                    Genre:
                  </strong>{" "}
                  {selectedItem.genre ||
                    "Not specified"}
                </p>

                <p>
                  <strong>
                    Rating:
                  </strong>{" "}
                  ⭐{" "}
                  {selectedItem.rating ||
                    "N/A"}{" "}
                  / 5
                </p>

                <p>
                  <strong>
                    Release Year:
                  </strong>{" "}
                  {selectedItem.year ||
                    selectedItem.releaseYear ||
                    "Not specified"}
                </p>

                <p>
                  <strong>
                    Runtime:
                  </strong>{" "}
                  {selectedItem.runtime ||
                    selectedItem.runtimeOrPages ||
                    "Not specified"}
                </p>

                <p>
                  <strong>
                    Director:
                  </strong>{" "}
                  {selectedItem.director ||
                    selectedItem.directorOrAuthor ||
                    "Not specified"}
                </p>

              </div>

              <div className="details-description">

                <h3>
                  Description
                </h3>

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