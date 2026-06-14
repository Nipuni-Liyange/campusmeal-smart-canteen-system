import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import TodayMenu from "./pages/TodayMenu";
import MyOrders from "./pages/MyOrders";
import ManageMenu from "./pages/ManageMenu";
import ManageOrders from "./pages/ManageOrders";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/student-dashboard"
        element={
          <ProtectedRoute allowedRole="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
  path="/today-menu"
  element={
    <ProtectedRoute allowedRole="student">
      <TodayMenu />
    </ProtectedRoute>
  }
/>

<Route
  path="/my-orders"
  element={
    <ProtectedRoute allowedRole="student">
      <MyOrders />
    </ProtectedRoute>
  }
/>

<Route
  path="/manage-menu"
  element={
    <ProtectedRoute allowedRole="admin">
      <ManageMenu />
    </ProtectedRoute>
  }
/>

<Route
  path="/manage-orders"
  element={
    <ProtectedRoute allowedRole="admin">
      <ManageOrders />
    </ProtectedRoute>
  }
/>

<Route
  path="/analytics"
  element={
    <ProtectedRoute allowedRole="admin">
      <Analytics />
    </ProtectedRoute>
  }
/>
    </Routes>

    
  );
}

export default App;