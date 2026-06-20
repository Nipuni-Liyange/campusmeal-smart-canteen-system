import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");
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

  const isWithinLastWeek = (order) => {
    const orderDate = new Date(getOrderDate(order));
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return orderDate >= sevenDaysAgo;
  };

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
    setMessage("");
    setError("");

    try {
      await API.put(`/orders/${orderId}/status`, { status });

      setMessage("Order status updated successfully");

      setTimeout(() => {
        setMessage("");
      }, 4000);

      fetchOrders();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");

      setTimeout(() => {
        setError("");
      }, 4000);
    }
  };

  const todayOrders = orders.filter((order) => getOrderDate(order) === today);

  const yesterdayOrders = orders.filter(
    (order) => getOrderDate(order) === yesterday
  );

  const previousOrders = orders.filter(
    (order) =>
      getOrderDate(order) !== today &&
      getOrderDate(order) !== yesterday &&
      isWithinLastWeek(order)
  );
  
  const isTodayOrder = (order) => {
  return getOrderDate(order) === today;
};

const getDisplayStatus = (order) => {
  const orderDate = getOrderDate(order);

  if (orderDate !== today && order.status === "Pending") {
    return "Expired";
  }

  return order.status;
};

  const renderOrderTable = (orderList, allowUpdate = false) => {
    if (orderList.length === 0) {
      return <p className="empty-text">No orders found.</p>;
    }
  const deleteOrder = async (orderId) => {
  setMessage("");
  setError("");

  try {
    await API.delete(`/orders/${orderId}`);

    setMessage("Order deleted successfully");

    setTimeout(() => {
      setMessage("");
    }, 4000);

    fetchOrders();
  } catch (err) {
    setError(err.response?.data?.message || "Failed to delete order");

    setTimeout(() => {
      setError("");
    }, 4000);
  }
};
    return (
      <div className="admin-order-table-wrapper">
        <table className="admin-order-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Food</th>
              <th>Portion</th>
              <th>Qty</th>
              <th>Extras</th>
              <th>Total</th>
              <th>Token</th>
              <th>Status</th>
              {allowUpdate && <th>Update</th>}
              <th>Delete</th>
            
            </tr>
          </thead>

          <tbody>
            {orderList.map((order) => (
              <tr key={order._id}>
                <td>{order.studentName || order.student?.name}</td>

                <td>
                  {order.foodName}
                  {order.recipeType && ` (${order.recipeType})`}
                </td>

                <td>{order.portionSize || "-"}</td>

                <td>{order.quantity || 1}</td>

                <td>
                  {order.extras && order.extras.length > 0
                    ? order.extras.map((extra) => extra.name).join(", ")
                    : "None"}
                </td>

                <td>Rs. {order.totalAmount}</td>

                <td>{order.orderToken}</td>

                <td>
                 <span className={`status ${getDisplayStatus(order).toLowerCase()}`}>
                  {getDisplayStatus(order)}
                 </span> 
                </td>

               {allowUpdate && (
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
)} 
                <td>
              <button
              className="btn secondary small-btn"
              onClick={() => deleteOrder(order._id)}
              >
              Delete
              </button>
              </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

 const renderOrderSection = (title, orderList, allowUpdate = false) => (
  <div className="admin-order-section">
    <h2>{title}</h2>
    {renderOrderTable(orderList, allowUpdate)}
  </div>
); 

  return (
    <div className="page">
      <nav className="navbar">
        <h2>CampusMeal Admin</h2>

        <div>
          <Link to="/admin-dashboard" className="nav-link">
            Dashboard
          </Link>

          <Link to="/manage-menu" className="nav-link">
            Menu
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
        <h1>Manage Orders</h1>
        <p>View student orders and update order status.</p>

        {renderOrderSection("Today’s Orders", todayOrders, true)}
{renderOrderSection("Yesterday’s Orders", yesterdayOrders, false)}
{renderOrderSection("Previous Orders - Last 7 Days", previousOrders, false)}
      </section>
    </div>
  );
}

export default ManageOrders;