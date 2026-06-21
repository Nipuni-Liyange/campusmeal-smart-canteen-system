import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <nav className="navbar">
        <h2>හෙළ බොජුන් Admin</h2>
        <button className="btn secondary" onClick={logout}>Logout</button>
      </nav>

      <section className="dashboard">
        <h1>Welcome , {user?.name}</h1>
        <p>This is the canteen admin dashboard.</p>

        <div className="features">
          <div className="card">
            <h3>Manage Menu</h3>
            <p>Add, edit, and remove daily dinner items.</p>
            <Link to="/manage-menu" className="btn">Manage Menu</Link>
          </div>

          <div className="card">
            <h3>Manage Orders</h3>
            <p>View and update student orders.</p>
            <Link to="/manage-orders" className="btn">Manage Orders</Link>
          </div>

          <div className="card">
            <h3>Analytics</h3>
            <p>View daily food demand and revenue.</p>
            <Link to="/analytics" className="btn">View Analytics</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;