import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function ManageMenu() {
  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Colombo",
    });
  };

  const categoryOptions = [
    { label: "Fish", value: "Fish" },
    { label: "Egg", value: "Egg" },
    { label: "Sausages", value: "Sausages" },
    { label: "Chicken", value: "Chicken" },
    { label: "Vegetarian", value: "Vegetarian" },
  ];

  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [formData, setFormData] = useState({
    name: "Rice & Curry",
    recipeType: "Fish",
    description: "",
    normalPrice: "",
    fullPrice: "",
    date: getTodayDate(),
    isAvailable: true,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const { logout } = useAuth();

  const showMessage = (text) => {
    setMessage(text);
    setError("");

    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  const showError = (text) => {
    setError(text);
    setMessage("");

    setTimeout(() => {
      setError("");
    }, 4000);
  };

  const fetchMenuItems = async () => {
    try {
      const res = await API.get("/menu");
      setMenuItems(res.data);
    } catch (err) {
      showError("Failed to load menu items");
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const makeRecipeKey = (item) => {
    const cleanText = (value) => {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
    };

    return [
      cleanText(item.name),
      cleanText(item.recipeType),
      cleanText(item.description),
      Number(item.normalPrice),
      Number(item.fullPrice),
    ].join("|");
  };

  const uniqueMenuItems = menuItems.filter((item, index, self) => {
    return (
      index ===
      self.findIndex((otherItem) => {
        return makeRecipeKey(otherItem) === makeRecipeKey(item);
      })
    );
  });

  const getCategoryCount = (category) => {
    return uniqueMenuItems.filter((item) => item.recipeType === category).length;
  };

  const filteredMenuItems = selectedCategory
    ? uniqueMenuItems.filter((item) => item.recipeType === selectedCategory)
    : [];

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedTemplateId(null);
    setDeleteConfirmId(null);
  };

  const useTemplate = (item) => {
    setFormData({
      name: item.name,
      recipeType: item.recipeType,
      description: item.description,
      normalPrice: item.normalPrice,
      fullPrice: item.fullPrice,
      date: getTodayDate(),
      isAvailable: true,
    });

    setSelectedTemplateId(item._id);
    showMessage(
      `${item.recipeType} recipe loaded into the form. You can edit and add it.`
    );

    const formElement = document.getElementById("add-menu-form");

    if (formElement) {
      formElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const duplicateForSameDate = menuItems.some((item) => {
      return (
        makeRecipeKey(item) === makeRecipeKey(formData) &&
        item.date === formData.date
      );
    });

    if (duplicateForSameDate) {
      showError("This same recipe is already saved for this date.");
      return;
    }

    try {
      await API.post("/menu", {
        ...formData,
        normalPrice: Number(formData.normalPrice),
        fullPrice: Number(formData.fullPrice),
      });

      showMessage("Menu item added successfully");

      setFormData({
        name: "Rice & Curry",
        recipeType: "Fish",
        description: "",
        normalPrice: "",
        fullPrice: "",
        date: getTodayDate(),
        isAvailable: true,
      });

      setSelectedTemplateId(null);
      fetchMenuItems();
    } catch (err) {
      showError(err.response?.data?.message || "Failed to add menu item");
    }
  };

  const deleteMenuItem = async (id) => {
    try {
      await API.delete(`/menu/${id}`);

      showMessage("Menu item deleted successfully");

      setDeleteConfirmId(null);
      setSelectedTemplateId(null);
      fetchMenuItems();
    } catch (err) {
      showError(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <h2>CampusMeal Admin</h2>

        <div>
          <Link to="/admin-dashboard" className="nav-link">
            Dashboard
          </Link>

          <Link to="/manage-orders" className="nav-link">
            Orders
          </Link>

          <Link to="/analytics" className="nav-link">
            Analytics
          </Link>

          <button className="btn secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      {message && <div className="toast-message success-toast">{message}</div>}
      {error && <div className="toast-message error-toast">{error}</div>}

      <section className="dashboard">
        <h1>Manage Menu</h1>
        <p>Add daily menu items or reuse common recipes.</p>

        <div className="manage-menu-layout">
          <div className="saved-menu-panel">
            <h2>Common Menu Items</h2>
            <p>
              Select a recipe type first. Then choose the saved recipe you want
              to reuse.
            </p>

            <div className="recipe-category-grid">
              {categoryOptions.map((category) => (
                <button
                  type="button"
                  key={category.value}
                  className={
                    selectedCategory === category.value
                      ? "recipe-category-card selected-category-card"
                      : "recipe-category-card"
                  }
                  onClick={() => handleCategorySelect(category.value)}
                >
                  <span className="recipe-category-title">
                    {category.label}
                  </span>

                  <span className="recipe-category-count">
                    {getCategoryCount(category.value)} saved
                  </span>
                </button>
              ))}
            </div>

            {!selectedCategory ? (
              <div className="empty-category-message">
                Select Fish, Egg, Sausages, Chicken, or Vegetarian to view saved
                menu cards.
              </div>
            ) : (
              <>
                <div className="selected-category-header">
                  <h3>{selectedCategory} Saved Recipes</h3>

                  <button
                    type="button"
                    className="btn secondary small-btn"
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedTemplateId(null);
                      setDeleteConfirmId(null);
                    }}
                  >
                    Close
                  </button>
                </div>

                <div className="menu-template-grid">
                  {filteredMenuItems.length === 0 ? (
                    <p>No saved {selectedCategory} menu items found.</p>
                  ) : (
                    filteredMenuItems.map((item) => (
                      <div
                        className={
                          selectedTemplateId === item._id
                            ? "card menu-template-card selected-template-card"
                            : "card menu-template-card"
                        }
                        key={item._id}
                      >
                        <h3>{item.name}</h3>

                        <p>{item.description}</p>

                        <p>
                          <strong>Recipe:</strong> {item.recipeType}
                        </p>

                        <p>
                          <strong>Normal:</strong> Rs. {item.normalPrice}
                        </p>

                        <p>
                          <strong>Full:</strong> Rs. {item.fullPrice}
                        </p>

                        <p>
                          <strong>Date:</strong> {item.date}
                        </p>

                        <p>
                          <strong>Available:</strong>{" "}
                          {item.isAvailable ? "Yes" : "No"}
                        </p>

                        <div className="menu-action-buttons">
                          <button
                            className="btn small-btn"
                            onClick={() => useTemplate(item)}
                          >
                            Use Template
                          </button>

                          {deleteConfirmId === item._id ? (
                            <>
                              <button
                                className="btn danger small-btn"
                                onClick={() => deleteMenuItem(item._id)}
                              >
                                Confirm
                              </button>

                              <button
                                className="btn secondary small-btn"
                                onClick={() => setDeleteConfirmId(null)}
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              className="btn secondary small-btn"
                              onClick={() => setDeleteConfirmId(item._id)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <div className="add-menu-panel">
            <form
              id="add-menu-form"
              className="auth-card"
              onSubmit={handleSubmit}
            >
              <h2>Add Menu Item</h2>

              <label>Food Name</label>
              <input
                type="text"
                name="name"
                placeholder="Rice & Curry"
                value={formData.name}
                onChange={handleChange}
              />

              <label>Recipe Type</label>
              <select
                name="recipeType"
                value={formData.recipeType}
                onChange={handleChange}
              >
                <option value="Fish">Fish</option>
                <option value="Chicken">Chicken</option>
                <option value="Egg">Egg</option>
                <option value="Sausages">Sausages</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Other">Other</option>
              </select>

              <label>Description</label>
              <input
                type="text"
                name="description"
                placeholder="Rice, dhal curry, sambol, beetroot curry"
                value={formData.description}
                onChange={handleChange}
              />

              <label>Normal Price</label>
              <input
                type="number"
                name="normalPrice"
                placeholder="150"
                value={formData.normalPrice}
                onChange={handleChange}
              />

              <label>Full Price</label>
              <input
                type="number"
                name="fullPrice"
                placeholder="200"
                value={formData.fullPrice}
                onChange={handleChange}
              />

              <label>Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
              />

              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isAvailable"
                  checked={formData.isAvailable}
                  onChange={handleChange}
                />
                Available
              </label>

              <button className="btn full" type="submit">
                Add Item
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ManageMenu;