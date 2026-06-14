import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function ManageMenu() {
  const today = new Date().toLocaleDateString("en-CA");

  const [menuItems, setMenuItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantityAvailable: "",
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
        price: Number(formData.price),
        quantityAvailable: Number(formData.quantityAvailable),
      });

      setMessage("Menu item added successfully");

      setFormData({
        name: "",
        description: "",
        price: "",
        quantityAvailable: "",
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

          <label>Description</label>
          <input
            type="text"
            name="description"
            placeholder="Chicken rice and curry with vegetables"
            value={formData.description}
            onChange={handleChange}
          />

          <label>Price</label>
          <input
            type="number"
            name="price"
            placeholder="350"
            value={formData.price}
            onChange={handleChange}
          />

          <label>Available Quantity</label>
          <input
            type="number"
            name="quantityAvailable"
            placeholder="50"
            value={formData.quantityAvailable}
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
                <p><strong>Price:</strong> Rs. {item.price}</p>
                <p><strong>Quantity:</strong> {item.quantityAvailable}</p>
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