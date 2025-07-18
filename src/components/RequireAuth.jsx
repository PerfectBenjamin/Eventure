import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }
  return children;
}
