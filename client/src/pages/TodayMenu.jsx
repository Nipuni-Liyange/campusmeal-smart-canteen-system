import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function TodayMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { logout } = useAuth();

  const fetchMenu = async () => {
    try {
      const res = await API.get("/menu/today");
      setMenuItems(res.data);
    } catch (err) {
      setError("Failed to load today's menu");
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const placeOrder = async (menuItemId) => {
    setMessage("");
    setError("");

    try {
      const res = await API.post("/orders", {
        menuItemId,
        quantity: 1,
      });

      setMessage(
        `Order placed successfully! Your token is ${res.data.order.orderToken}`
      );

      fetchMenu();
    } catch (err) {
      setError(err.response?.data?.message || "Order failed");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <h2>CampusMeal</h2>
        <div>
          <Link to="/student-dashboard" className="nav-link">Dashboard</Link>
          <Link to="/my-orders" className="nav-link">My Orders</Link>
          <button className="btn secondary" onClick={logout}>Logout</button>
        </div>
      </nav>

      <section className="dashboard">
        <h1>Today’s Dinner Menu</h1>
        <p>Order your dinner before the canteen deadline.</p>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <div className="features">
          {menuItems.length === 0 ? (
            <p>No menu items available today.</p>
          ) : (
            menuItems.map((item) => (
              <div className="card" key={item._id}>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p><strong>Price:</strong> Rs. {item.price}</p>
                <p><strong>Available:</strong> {item.quantityAvailable}</p>
                <button className="btn" onClick={() => placeOrder(item._id)}>
                  Order Now
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default TodayMenu;