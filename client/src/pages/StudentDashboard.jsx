import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function StudentDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <nav className="navbar">
        <h2>CampusMeal</h2>
        <button className="btn secondary" onClick={logout}>Logout</button>
      </nav>

      <section className="dashboard">
        <h1>Welcome, {user?.name}</h1>
        <p>This is the student dashboard.</p>

        <div className="features">
          <div className="card">
            <h3>Today’s Menu</h3>
            <p>View available dinner items and place your order.</p>
            <Link to="/today-menu" className="btn">View Menu</Link>
          </div>

          <div className="card">
            <h3>My Orders</h3>
            <p>Track your dinner orders and pickup token.</p>
            <Link to="/my-orders" className="btn">View Orders</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudentDashboard;