import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import heroImage from "../assets/hero.png";

function TodayMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [orderOptions, setOrderOptions] = useState({});
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

  const getRecipePoints = (description) => {
    if (!description) return [];
    return description.split(",").map((item) => item.trim());
  };

 const placeOrder = async (menuItemId) => {
  setMessage("");
  setError("");

  try {
    const options = orderOptions[menuItemId] || {
      portionSize: "Normal",
      extras: [],
    };

    const res = await API.post("/orders", {
      menuItemId,
      portionSize: options.portionSize || "Normal",
      extras: options.extras || [],
    });

    setMessage(
      `Order placed successfully! Your token is ${res.data.order.orderToken}`
    );

    setTimeout(() => {
      setMessage("");
    }, 4000);

    fetchMenu();
  } catch (err) {
    setError(err.response?.data?.message || err.message || "Order failed");

    setTimeout(() => {
      setError("");
    }, 4000);
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

        <div className="deadline-box">
  <span className="deadline-icon">⏰</span>

  <div>
    <strong>Orders close at 3:00 PM</strong>
    <p>Please place your dinner order before the daily deadline.</p>
  </div>
</div>

        {message && <div className="toast-message success-toast">{message}</div>}
        {error && <div className="toast-message error-toast">{error}</div>}

        <div className="today-menu-list">
          {menuItems.length === 0 ? (
            <p>No menu items available today.</p>
          ) : (
            menuItems.map((item) => (
              <div className="card today-menu-card" key={item._id}>
                <div className="menu-card-left">
                  <h3>{item.name}</h3>

                  <p><strong>Normal Price:</strong> Rs. {item.normalPrice}</p>
                  <p><strong>Full Price:</strong> Rs. {item.fullPrice}</p>

                  <label><strong>Portion Size</strong></label>
                  <br />
                  <select>
                    <option>Normal</option>
                    <option>Full</option>
                  </select>

                  <div style={{ marginTop: "15px" }}>
                    <strong>Additional Items</strong>
                    <label style={{ display: "block", marginTop: "8px" }}>
                      <input type="checkbox" /> Extra Egg - Rs. 50
                    </label>
                    <label style={{ display: "block", marginTop: "8px" }}>
                      <input type="checkbox" /> Extra Sausages - Rs. 50
                    </label>
                    <label style={{ display: "block", marginTop: "8px" }}>
                      <input type="checkbox" /> Extra Chicken - Rs. 80
                    </label>
                    <label style={{ display: "block", marginTop: "8px" }}>
                      <input type="checkbox" /> Extra Fish - Rs. 50
                    </label>
                  </div>

                  <p style={{ marginTop: "15px" }}>
                    <strong>Total:</strong> Rs. {item.normalPrice}
                  </p>

                  <button className="btn" onClick={() => placeOrder(item._id)}>
                    Order Now
                  </button>
                </div>

                <div className="menu-card-right">
  <div
    className="recipe-image-panel"
    style={{ "--recipe-image": `url(${heroImage})` }}
  >
    <div className="glass-recipe-box">
      <h4>Recipe Includes</h4>

      <ul className="recipe-list">
        {getRecipePoints(item.description).map((point, index) => (
          <li key={index}>{point}</li>
        ))}
      </ul>
    </div>
  </div>
</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default TodayMenu;