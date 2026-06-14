import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const { logout } = useAuth();

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

  return (
    <div className="page">
      <nav className="navbar">
        <h2>CampusMeal</h2>
        <div>
          <Link to="/student-dashboard" className="nav-link">Dashboard</Link>
          <Link to="/today-menu" className="nav-link">Today’s Menu</Link>
          <button className="btn secondary" onClick={logout}>Logout</button>
        </div>
      </nav>

      <section className="dashboard">
        <h1>My Orders</h1>
        <p>Track your dinner order status here.</p>

        {error && <p className="error">{error}</p>}

        <div className="features">
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            orders.map((order) => (
              <div className="card" key={order._id}>
                <h3>{order.foodName}</h3>
                <p><strong>Quantity:</strong> {order.quantity}</p>
                <p><strong>Total:</strong> Rs. {order.totalAmount}</p>
                <p><strong>Token:</strong> {order.orderToken}</p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span className={`status ${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </p>

                {order.status === "Pending" && (
                  <button
                    className="btn secondary"
                    onClick={() => cancelOrder(order._id)}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default MyOrders;