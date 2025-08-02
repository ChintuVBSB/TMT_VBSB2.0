// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { getToken, getUserRole } from "../utils/token";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = getToken();
  const role = getUserRole();

  // Step 1: Agar token ya role missing hai to redirect to login
  if (!token || !role) {
    return <Navigate to="/" replace />;
  }

  // Step 2: Agar current role allowedRoles me nahi hai to unauthorized
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Step 3: Access allowed
  return children;
};

export default ProtectedRoute;
