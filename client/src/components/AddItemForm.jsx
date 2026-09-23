import { useEffect, useState } from "react";

function AddItemForm({
  onAdd,
  onUpdate,
  onClose,
  editingItem,
}) {
  const [formData, setFormData] = useState({
    title: "",
    type: "Movie",
    genre: "",
    rating: "",
    image: "",
    year: "",
    runtime: "",
    pages: "",
    description: "",
    director: "",
    author: "",
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || "",
        type: editingItem.type || "Movie",
        genre: editingItem.genre || "",
        rating: editingItem.rating || "",
        image: editingItem.image || "",
        year: editingItem.year || "",
        runtime: editingItem.runtime || "",
        pages: editingItem.pages || "",
        description: editingItem.description || "",
        director: editingItem.director || "",
        author: editingItem.author || "",
      });
    } else {
      setFormData({
        title: "",
        type: "Movie",
        genre: "",
        rating: "",
        image: "",
        year: "",
        runtime: "",
        pages: "",
        description: "",
        director: "",
        author: "",
      });
    }
  }, [editingItem]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!formData.genre.trim()) {
      alert("Please enter a genre.");
      return;
    }

    if (!formData.rating) {
      alert("Please select a rating.");
      return;
    }

    if (formData.type === "Movie" && !formData.director.trim()) {
      alert("Please enter the director.");
      return;
    }

    if (formData.type === "Book" && !formData.author.trim()) {
      alert("Please enter the author.");
      return;
    }

    const itemData = {
      title: formData.title.trim(),
      type: formData.type,
      genre: formData.genre.trim(),
      rating: Number(formData.rating),
      image: formData.image.trim(),
      year: formData.year
        ? Number(formData.year)
        : "",
      runtime: formData.runtime.trim(),
      pages: formData.pages
        ? Number(formData.pages)
        : "",
      description: formData.description.trim(),
      director: formData.director.trim(),
      author: formData.author.trim(),
    };

    if (editingItem) {
      onUpdate({
        ...editingItem,
        ...itemData,
      });
      return;
    }

    onAdd(itemData);

    setFormData({
      title: "",
      type: "Movie",
      genre: "",
      rating: "",
      image: "",
      year: "",
      runtime: "",
      pages: "",
      description: "",
      director: "",
      author: "",
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className="close-button"
          onClick={onClose}
          type="button"
        >
          ×
        </button>

        <h2>
          {editingItem
            ? "Edit Movie / Book"
            : "Add Movie / Book"}
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Title */}
          <div className="form-group">
            <label>Title</label>

            <input
              type="text"
              name="title"
              placeholder="Enter title"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          {/* Type */}
          <div className="form-group">
            <label>Type</label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="Movie">
                Movie
              </option>

              <option value="Book">
                Book
              </option>
            </select>
          </div>

          {/* Genre */}
          <div className="form-group">
            <label>Genre</label>

            <input
              type="text"
              name="genre"
              placeholder="e.g. Action, Drama, Romance"
              value={formData.genre}
              onChange={handleChange}
            />
          </div>

          {/* Rating */}
          <div className="form-group">
            <label>Rating</label>

            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
            >
              <option value="">
                Select rating
              </option>

              <option value="5">⭐ 5</option>
              <option value="4.5">⭐ 4.5</option>
              <option value="4">⭐ 4</option>
              <option value="3.5">⭐ 3.5</option>
              <option value="3">⭐ 3</option>
              <option value="2.5">⭐ 2.5</option>
              <option value="2">⭐ 2</option>
              <option value="1.5">⭐ 1.5</option>
              <option value="1">⭐ 1</option>
            </select>
          </div>

          {/* Image */}
          <div className="form-group">
            <label>Poster / Cover Image URL</label>

            <input
              type="url"
              name="image"
              placeholder="Paste image URL"
              value={formData.image}
              onChange={handleChange}
            />
          </div>

          {/* Year */}
          <div className="form-group">
            <label>
              {formData.type === "Movie"
                ? "Release Year"
                : "Publication Year"}
            </label>

            <input
              type="number"
              name="year"
              placeholder={
                formData.type === "Movie"
                  ? "e.g. 2024"
                  : "e.g. 1997"
              }
              value={formData.year}
              onChange={handleChange}
              min="0"
            />
          </div>

          {/* Movie Runtime */}
          {formData.type === "Movie" && (
            <div className="form-group">
              <label>Runtime</label>

              <input
                type="text"
                name="runtime"
                placeholder="e.g. 2h 49m"
                value={formData.runtime}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Book Pages */}
          {formData.type === "Book" && (
            <div className="form-group">
              <label>Pages</label>

              <input
                type="number"
                name="pages"
                placeholder="e.g. 309"
                value={formData.pages}
                onChange={handleChange}
                min="1"
              />
            </div>
          )}

          {/* Movie Director */}
          {formData.type === "Movie" && (
            <div className="form-group">
              <label>Director</label>

              <input
                type="text"
                name="director"
                placeholder="Enter director name"
                value={formData.director}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Book Author */}
          {formData.type === "Book" && (
            <div className="form-group">
              <label>Author</label>

              <input
                type="text"
                name="author"
                placeholder="Enter author name"
                value={formData.author}
                onChange={handleChange}
              />
            </div>
          )}

          {/* Description */}
          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Enter a short description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          {/* Buttons */}
          <div className="form-buttons">

            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-button"
            >
              {editingItem
                ? "Update Item"
                : "Add Item"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default AddItemForm;