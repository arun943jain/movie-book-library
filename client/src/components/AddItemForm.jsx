import { useEffect, useState } from "react";

function AddItemForm({ onAdd, onUpdate, onClose, editingItem }) {
  const [formData, setFormData] = useState({
    title: "",
    type: "Movie",
    genre: "",
    rating: "",
    poster: "",
    year: "",
    runtime: "",
    director: "",
    description: "",
  });

  const [imageStatus, setImageStatus] = useState("idle");

  useEffect(() => {
    if (editingItem) {
      setFormData({
        title: editingItem.title || "",
        type: editingItem.type || "Movie",
        genre: editingItem.genre || "",
        rating: editingItem.rating || "",
        poster:
          editingItem.poster ||
          editingItem.posterUrl ||
          editingItem.imageUrl ||
          editingItem.image ||
          "",
        year: editingItem.year
          ? String(editingItem.year)
          : editingItem.releaseYear
            ? String(editingItem.releaseYear)
            : "",
        runtime: editingItem.runtime || "",
        director: editingItem.director || "",
        description: editingItem.description || "",
      });
    } else {
      setFormData({
        title: "",
        type: "Movie",
        genre: "",
        rating: "",
        poster: "",
        year: "",
        runtime: "",
        director: "",
        description: "",
      });
    }

    setImageStatus("idle");
  }, [editingItem]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    if (name === "poster") {
      setImageStatus(value.trim() ? "loading" : "idle");
    }
  };

  const handleImageLoad = () => {
    setImageStatus("success");
  };

  const handleImageError = () => {
    setImageStatus("error");
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

    const itemData = {
      title: formData.title.trim(),
      type: formData.type,
      genre: formData.genre.trim(),
      rating: Number(formData.rating),
      poster: formData.poster.trim(),
      year: formData.year ? Number(formData.year) : "",
      runtime: formData.runtime.trim(),
      director: formData.director.trim(),
      description: formData.description.trim(),
    };

    if (editingItem) {
      onUpdate({
        ...editingItem,
        ...itemData,
      });
    } else {
      onAdd(itemData);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-button" onClick={onClose}>
          ×
        </button>

        <h2>{editingItem ? "Edit Movie / Book" : "Add Movie / Book"}</h2>

        <form onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>Type</label>

            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="Movie">Movie</option>
              <option value="Book">Book</option>
            </select>
          </div>

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

          <div className="form-group">
            <label>Rating</label>

            <select
              name="rating"
              value={formData.rating}
              onChange={handleChange}
            >
              <option value="">Select rating</option>
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

          {/* POSTER URL */}
          <div className="form-group">
            <label>Poster / Cover Image URL</label>

            <input
              type="url"
              name="poster"
              placeholder="Paste direct poster image URL"
              value={formData.poster}
              onChange={handleChange}
            />

            <small>
              Paste a direct image link. The URL does not need to end with .jpg
              or .png.
            </small>

            {/* LIVE IMAGE PREVIEW */}
            {formData.poster.trim() && (
              <div
                style={{
                  marginTop: "12px",
                  textAlign: "center",
                }}
              >
                <img
                  src={formData.poster.trim()}
                  alt="Poster preview"
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  style={{
                    width: "140px",
                    height: "190px",
                    objectFit: "cover",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    display: imageStatus === "error" ? "none" : "inline-block",
                  }}
                />

                {imageStatus === "loading" && <p>Loading poster...</p>}

                {imageStatus === "success" && (
                  <p
                    style={{
                      color: "#7CFF8A",
                      marginTop: "6px",
                    }}
                  >
                    ✓ Poster loaded successfully
                  </p>
                )}

                {imageStatus === "error" && (
                  <p
                    style={{
                      color: "#ff6b6b",
                      marginTop: "6px",
                    }}
                  >
                    ✕ Image could not be loaded.
                    <br />
                    Make sure this is a direct image URL.
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Release Year</label>

            <input
              type="text"
              name="year"
              placeholder="e.g. 2024"
              value={formData.year}
              onChange={handleChange}
            />
          </div>

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

          <div className="form-group">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Enter a short description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
            />
          </div>

          <div className="form-buttons">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>

            <button type="submit" className="submit-button">
              {editingItem ? "Update Item" : "Add Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddItemForm;
