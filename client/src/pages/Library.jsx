import { useEffect, useState } from "react";
import AddItemForm from "../components/AddItemForm";

function Library() {
  const [showForm, setShowForm] = useState(false);
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [rating, setRating] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 4;

  useEffect(() => {
    const savedItems =
      localStorage.getItem("movieBookLibrary");

    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "movieBookLibrary",
      JSON.stringify(items)
    );
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
      previousItems.filter(
        (item) => item.id !== id
      )
    );

    setCurrentPage(1);
  };

  const editItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const updateItem = (updatedItem) => {
    setItems((previousItems) =>
      previousItems.map((item) =>
        item.id === updatedItem.id
          ? updatedItem
          : item
      )
    );

    setEditingItem(null);
    setShowForm(false);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesGenre =
      genre === "" ||
      item.genre.toLowerCase() ===
        genre.toLowerCase();

    const matchesRating =
      rating === "" ||
      Math.floor(Number(item.rating)) ===
        Number(rating);

    return (
      matchesSearch &&
      matchesGenre &&
      matchesRating
    );
  });

  const totalPages = Math.ceil(
    filteredItems.length / itemsPerPage
  );

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1);
    } else if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex =
    (currentPage - 1) * itemsPerPage;

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

  return (
    <div className="library">

      {/* Header */}
      <header className="hero">
        <div className="hero-content">

          <h1>
            Movie & Book Library
          </h1>

          <p>
            Browse, search and manage your collection.
          </p>

        </div>
      </header>

      <div className="library-container">

        {/* Search + Add */}
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

        {/* Filters */}
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

        {/* Library */}
        {filteredItems.length === 0 ? (

          <div className="empty-library">

            <h2>
              {items.length === 0
                ? "No movies or books yet"
                : "No matching items found"}
            </h2>

            <p>
              {items.length === 0
                ? "Add your first movie or book to the library."
                : "Try changing your search or filters."}
            </p>

          </div>

        ) : (

          <>

            <div className="items-grid">

              {currentItems.map((item) => (

                <div
                  className="item-card"
                  key={item.id}
                >

                  {/* Poster */}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="item-image"
                      onError={(event) => {
                        event.currentTarget.style.display =
                          "none";
                      }}
                    />
                  ) : (
                    <div className="image-placeholder">
                      {item.type === "Book"
                        ? "📚"
                        : "🎬"}
                    </div>
                  )}

                  {/* Information */}
                  <div className="item-content">

                    <h3>
                      {item.title}
                    </h3>

                    <div className="item-type">
                      {item.type === "Book"
                        ? "📚 Book"
                        : "🎬 Movie"}
                    </div>

                    <p>
                      <strong>Genre:</strong>{" "}
                      {item.genre}
                    </p>

                    <p className="rating-line">
                      <strong>Rating:</strong>{" "}
                      <span className="rating-star">
                        ★
                      </span>{" "}
                      {item.rating} / 5
                    </p>

                    {item.year && (
                      <p>
                        <strong>
                          {item.type === "Movie"
                            ? "Year:"
                            : "Published:"}
                        </strong>{" "}
                        {item.year}
                      </p>
                    )}

                    {item.type === "Movie" &&
                      item.runtime && (
                        <p>
                          <strong>
                            Runtime:
                          </strong>{" "}
                          {item.runtime}
                        </p>
                      )}

                    {item.type === "Book" &&
                      item.pages && (
                        <p>
                          <strong>
                            Pages:
                          </strong>{" "}
                          {item.pages}
                        </p>
                      )}

                    {item.type === "Movie" &&
                      item.director && (
                        <p>
                          <strong>
                            Director:
                          </strong>{" "}
                          {item.director}
                        </p>
                      )}

                    {item.type === "Book" &&
                      item.author && (
                        <p>
                          <strong>
                            Author:
                          </strong>{" "}
                          {item.author}
                        </p>
                      )}

                    {item.description && (
                      <p className="description">
                        {item.description}
                      </p>
                    )}

                  </div>

                  {/* Buttons */}
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
                        deleteItem(item.id)
                      }
                      className="delete-button"
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

            {/* Pagination */}
            {totalPages > 1 && (

              <div className="pagination">

                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    changePage(currentPage - 1)
                  }
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
                    currentPage === totalPages
                  }
                  onClick={() =>
                    changePage(currentPage + 1)
                  }
                >
                  Next
                </button>

              </div>

            )}

          </>

        )}

      </div>

      {/* Modal */}
      {showForm && (
        <AddItemForm
          onAdd={addItem}
          onUpdate={updateItem}
          onClose={closeForm}
          editingItem={editingItem}
        />
      )}

    </div>
  );
}

export default Library;