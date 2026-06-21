import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");
  const { logout } = useAuth();

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/analytics/today");
      setAnalytics(res.data);
    } catch (err) {
      setError("Failed to load analytics");
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="page">
      <nav className="navbar">
        <h2>හෙළ බොජුන් Admin</h2>
        <div>
          <Link to="/admin-dashboard" className="nav-link">Dashboard</Link>
          <Link to="/manage-menu" className="nav-link">Menu</Link>
          <Link to="/manage-orders" className="nav-link">Orders</Link>
          <button className="btn secondary" onClick={logout}>Logout</button>
        </div>
      </nav>

      <section className="dashboard">
        <h1>Daily Demand Analytics</h1>
        <p>
          These analytics help the canteen prepare the correct food quantity and reduce food wastage.
        </p>

        {error && <p className="error">{error}</p>}

        {!analytics ? (
          <p>Loading analytics...</p>
        ) : (
          <>
            <div className="features">
              <div className="card">
                <h3>Total Orders Today</h3>
                <p className="big-number">{analytics.totalOrders}</p>
              </div>

              <div className="card">
                <h3>Total Revenue</h3>
                <p className="big-number">Rs. {analytics.totalRevenue}</p>
              </div>

              <div className="card">
                <h3>Pending Orders</h3>
                <p className="big-number">{analytics.pendingOrders}</p>
              </div>

              <div className="card">
                <h3>Collected Orders</h3>
                <p className="big-number">{analytics.collectedOrders}</p>
              </div>
            </div>

            <div className="card analytics-card">
              <h3>Most Ordered Item</h3>
              {analytics.mostOrderedItem ? (
                <p>
                  {analytics.mostOrderedItem.foodName} -{" "}
                  {analytics.mostOrderedItem.quantity} orders
                </p>
              ) : (
                <p>No orders yet today.</p>
              )}
            </div>

            <div className="table-container">
              <h3>Food Demand Summary</h3>

              {analytics.foodDemand.length === 0 ? (
                <p>No demand data available.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Food Item</th>
                      <th>Quantity Ordered</th>
                    </tr>
                  </thead>

                  <tbody>
                    {analytics.foodDemand.map((item) => (
                      <tr key={item.foodName}>
                        <td>{item.foodName}</td>
                        <td>{item.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Analytics;