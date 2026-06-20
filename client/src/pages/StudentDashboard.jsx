import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
  const { user, logout } = useAuth();
  const [recentOrders, setRecentOrders] = useState([]);

  const getTodayDate = () => {
    return new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Colombo",
    });
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await API.get("/orders/my-orders");

      const today = getTodayDate();

      // Dashboard should show only previous orders, not today's orders
      const previousOrders = res.data.filter((order) => order.date !== today);

      // Show latest two previous orders only
      setRecentOrders(previousOrders.slice(0, 2));
    } catch (err) {
      console.log("Failed to load recent orders");
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, []);

  const getFoodDisplayName = (order) => {
    if (!order.recipeType || order.recipeType === "Vegetarian") {
      return order.foodName;
    }

    const nameAlreadyHasType = order.foodName
      ?.toLowerCase()
      .includes(order.recipeType.toLowerCase());

    if (nameAlreadyHasType) {
      return order.foodName;
    }

    return `${order.foodName} (${order.recipeType})`;
  };

  const formatOrderDate = (date) => {
    if (!date) return "-";
    return date;
  };

  return (
    <div className="page dashboard-bg-page">
      <nav className="navbar">
        <h2>හෙල බොජුන්</h2>

        <div>
          <button className="btn secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <section className="dashboard">
        <h1>Welcome , {user?.name}</h1>
        <p>This is the student dashboard.</p>

        <div className="features">
          <div className="card">
            <h3>Today’s Menu</h3>
            <p>View available dinner items and place your order.</p>

            <Link to="/today-menu">
              <button className="btn">View Menu</button>
            </Link>
          </div>

          <div className="card">
            <h3>My Orders</h3>
            <p>Track your dinner orders and pickup token.</p>

            <Link to="/my-orders">
              <button className="btn">View Orders</button>
            </Link>
          </div>
        </div>

        <div className="recent-orders-section">
          <div className="recent-orders-header">
            <div>
              <h2>Previous Orders</h2>
              <p>Your latest two previous dinner orders.</p>
            </div>

            <Link to="/my-orders" className="view-all-orders-link">
              View All Orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="recent-empty-card">
              <p>No previous orders yet.</p>
            </div>
          ) : (
            <div className="recent-orders-grid">
              {recentOrders.map((order) => (
                <div className="recent-order-card" key={order._id}>
                  <div className="recent-order-top">
                    <h3>{getFoodDisplayName(order)}</h3>

                    <Link to="/today-menu" className="recent-order-action-btn">
                      Order Now
                    </Link>
                  </div>

                  <div className="recent-order-details">
                    <p>
                      <strong>Token:</strong> {order.orderToken}
                    </p>

                    <p>
                      <strong>Portion:</strong> {order.portionSize || "-"}
                    </p>

                    <p>
                      <strong>Qty:</strong> {order.quantity || 1}
                    </p>

                    <p>
                      <strong>Total:</strong> Rs. {order.totalAmount}
                    </p>

                    <p>
                      <strong>Date:</strong> {formatOrderDate(order.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;