import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

export default function PrivateRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div className="p-6 text-xl">Loading...</div>;
  }

  return user ? children : <Navigate to="/" />;
}
