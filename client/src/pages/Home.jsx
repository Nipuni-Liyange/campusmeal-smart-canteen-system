import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page">
      <nav className="navbar">
        <h2>හෙළ බොජුන්</h2>
        <div>
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/register" className="btn">Register</Link>
        </div>
      </nav>

      <section className="hero">
        <h1>Order Your University Dinner Easily</h1>
        <p>
          View today’s canteen menu, pre-order dinner, and track your order status
          without using SMS or phone calls.
        </p>

        <div className="hero-buttons">
          <Link to="/login" className="btn">Get Started</Link>
          <Link to="/register" className="btn secondary">Create Account</Link>
        </div>
      </section>

      <section className="features">
        <div className="card">
          <h3>View Today’s Menu</h3>
          <p>Students can see available dinner items before ordering.</p>
        </div>

        <div className="card">
          <h3>Pre-order Dinner</h3>
          <p>Students can order food before the deadline.</p>
        </div>

        <div className="card">
          <h3>Track Order Status</h3>
          <p>Students can check whether the order is pending, accepted, or ready.</p>
        </div>

        <div className="card">
          <h3>Reduce Food Waste</h3>
          <p>Canteen staff can prepare food according to real demand.</p>
        </div>
      </section>
    </div>
  );
}

export default Home;