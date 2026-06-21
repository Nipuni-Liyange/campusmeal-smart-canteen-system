import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    regNo: "",
    adminCode: "",
  });

  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      // If user changes role, clear unnecessary fields
      if (name === "role" && value === "student") {
        updatedData.adminCode = "";
      }

      if (name === "role" && value === "admin") {
        updatedData.regNo = "";
      }

      return updatedData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await API.post("/auth/register", formData);

      login(res.data.user, res.data.token);

      if (res.data.user.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Register</h2>
        <p>Create your CampusMeal account</p>

        {error && <div className="error-message">{error}</div>}

        <label>Register As</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          <option value="student">Student</option>
          <option value="admin">Admin</option>
        </select>

        <label>Name</label>
        <input
          type="text"
          name="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
        />

        {formData.role === "student" && (
          <>
            <label>Registration Number</label>
            <input
              type="text"
              name="regNo"
              placeholder="Enter your registration number"
              value={formData.regNo}
              onChange={handleChange}
            />
          </>
        )}

        {formData.role === "admin" && (
          <>
            <label>Admin Secret Code</label>
            <input
              type="password"
              name="adminCode"
              placeholder="Enter admin secret code"
              value={formData.adminCode}
              onChange={handleChange}
            />
          </>
        )}

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />

        <button className="btn full" type="submit">
          Register
        </button>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;