import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const { logout } = useAuth();

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/all");
      setOrders(res.data);
    } catch (err) {
      setError("Failed to load orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await API.put(`/orders/${orderId}/status`, { status });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed");
    }
  };

  return (
    <div className="page">
      <nav className="navbar">
        <h2>CampusMeal Admin</h2>
        <div>
          <Link to="/admin-dashboard" className="nav-link">Dashboard</Link>
          <Link to="/manage-menu" className="nav-link">Menu</Link>
          <Link to="/analytics" className="nav-link">Analytics</Link>
          <button className="btn secondary" onClick={logout}>Logout</button>
        </div>
      </nav>

      <section className="dashboard">
        <h1>Manage Orders</h1>
        <p>View student orders and update order status.</p>

        {error && <p className="error">{error}</p>}

        <div className="table-container">
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Food</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Token</th>
                  <th>Status</th>
                  <th>Update</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.studentName}</td>
                    <td>{order.foodName}</td>
                    <td>{order.quantity}</td>
                    <td>Rs. {order.totalAmount}</td>
                    <td>{order.orderToken}</td>
                    <td>
                      <span className={`status ${order.status.toLowerCase()}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Collected">Collected</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default ManageOrders;