import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function ManageMenu() {
  const today = new Date().toLocaleDateString("en-CA");

  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "Rice & Curry",
  recipeType: "Fish",
  description: "",
  normalPrice: "",
  fullPrice: "",
  date: today,
  isAvailable: true,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { logout } = useAuth();

  const fetchMenuItems = async () => {
    try {
      const res = await API.get("/menu");
      setMenuItems(res.data);
    } catch (err) {
      setError("Failed to load menu items");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await API.post("/menu", {
        ...formData,
        normalPrice: Number(formData.normalPrice),
        fullPrice: Number(formData.fullPrice),
      });

      setMessage("Menu item added successfully");

      setFormData({
        name: "Rice & Curry",
        recipeType: "Fish",
        description: "",
        normalPrice: "",
        fullPrice: "",
        date: today,
        isAvailable: true,
      });

      fetchMenuItems();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add menu item");
    }
  };

  const deleteMenuItem = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this item?");

    if (!confirmDelete) return;

    try {
      await API.delete(`/menu/${id}`);
      fetchMenuItems();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <h2>CampusMeal Admin</h2>
        <div>
          <Link to="/admin-dashboard" className="nav-link">Dashboard</Link>
          <Link to="/manage-orders" className="nav-link">Orders</Link>
          <Link to="/analytics" className="nav-link">Analytics</Link>
          <button className="btn secondary" onClick={logout}>Logout</button>
        </div>
      </nav>

      <section className="dashboard">
        <h1>Manage Menu</h1>
        <p>Add and manage daily dinner menu items.</p>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Add Menu Item</h2>

          <label>Food Name</label>
          <input
            type="text"
            name="name"
            placeholder="Rice and Curry"
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

          <label>
            <input
              type="checkbox"
              name="isAvailable"
              checked={formData.isAvailable}
              onChange={handleChange}
            />
            Available
          </label>

          <button className="btn full" type="submit">Add Item</button>
        </form>

        <div className="features">
          {menuItems.length === 0 ? (
            <p>No menu items found.</p>
          ) : (
            menuItems.map((item) => (
              <div className="card" key={item._id}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p><strong>Recipe:</strong> {item.recipeType}</p>
                <p><strong>Normal:</strong> Rs. {item.normalPrice}</p>
                <p><strong>Full:</strong> Rs. {item.fullPrice}</p>
                <p><strong>Date:</strong> {item.date}</p>
                <p><strong>Available:</strong> {item.isAvailable ? "Yes" : "No"}</p>

                <button
                  className="btn secondary"
                  onClick={() => deleteMenuItem(item._id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default ManageMenu;