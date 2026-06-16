import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const { logout } = useAuth();

  const getDateInSriLanka = (daysAgo = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    return date.toLocaleDateString("en-CA", {
      timeZone: "Asia/Colombo",
    });
  };

  const today = getDateInSriLanka(0);
  const yesterday = getDateInSriLanka(1);

  const getOrderDate = (order) => {
    if (order.date) return order.date;

    return new Date(order.createdAt).toLocaleDateString("en-CA", {
      timeZone: "Asia/Colombo",
    });
  };

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/my-orders");
      setOrders(res.data);
    } catch (err) {
      setError("Failed to load your orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (orderId) => {
    try {
      await API.put(`/orders/${orderId}/cancel`);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Cancel failed");
    }
  };

  const todayOrders = orders.filter((order) => getOrderDate(order) === today);
  const yesterdayOrders = orders.filter(
    (order) => getOrderDate(order) === yesterday
  );
  const previousOrders = orders.filter(
    (order) => getOrderDate(order) !== today && getOrderDate(order) !== yesterday
  );

  const renderOrderCard = (order) => (
    <div className="card order-card" key={order._id}>
      <h3>
        {order.foodName}
        {order.recipeType && ` (${order.recipeType})`}
      </h3>

      {order.portionSize && (
        <p>
          <strong>Portion:</strong> {order.portionSize}
        </p>
      )}

      {order.extras && order.extras.length > 0 ? (
        <div>
          <strong>Extras:</strong>
          <ul className="extras-list">
            {order.extras.map((extra, index) => (
              <li key={index}>
                {extra.name} - Rs. {extra.price}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>
          <strong>Extras:</strong> None
        </p>
      )}

      <p>
        <strong>Total:</strong> Rs. {order.totalAmount}
      </p>

      <p>
        <strong>Token:</strong> {order.orderToken}
      </p>

      <p>
        <strong>Status:</strong>{" "}
        <span className={`status ${order.status.toLowerCase()}`}>
          {order.status}
        </span>
      </p>

      <p className="order-date">
        <strong>Date:</strong> {getOrderDate(order)}
      </p>

      {order.status === "Pending" && (
        <button className="btn secondary" onClick={() => cancelOrder(order._id)}>
          Cancel Order
        </button>
      )}
    </div>
  );

  const renderOrderSection = (title, orderList) => (
    <div className="order-section">
      <h2 className="order-section-title">{title}</h2>

      {orderList.length === 0 ? (
        <p className="empty-text">No orders found.</p>
      ) : (
        <div className="order-grid">{orderList.map(renderOrderCard)}</div>
      )}
    </div>
  );

  return (
    <div className="page">
      <nav className="navbar">
        <h2>CampusMeal</h2>

        <div>
          <Link to="/student-dashboard" className="nav-link">
            Dashboard
          </Link>

          <Link to="/today-menu" className="nav-link">
            Today’s Menu
          </Link>

          <button className="btn secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>

      <section className="dashboard">
        <h1>My Orders</h1>
        <p>Track your dinner order history and current status here.</p>

        {error && <p className="error">{error}</p>}

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <>
            {renderOrderSection("Today’s Orders", todayOrders)}
            {renderOrderSection("Yesterday’s Orders", yesterdayOrders)}
            {renderOrderSection("Previous Orders", previousOrders)}
          </>
        )}
      </section>
    </div>
  );
}

export default MyOrders;