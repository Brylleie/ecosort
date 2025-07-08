import { useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCred.user.uid;

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role || "resident";
        navigate(role === "admin" ? "/AdminPanel" : "/dashboard");
      } else {
        await setDoc(userRef, {
          email,
          totalPoints: 0,
          role: "resident",
        });
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-green-300 flex flex-col items-center justify-center px-4 font-sans">
      {/* Header */}
      <header className="absolute top-4 left-4 font-bold text-lg text-green-800">T. Alonzo Project</header>

      {/* Login Card */}
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow-2xl animate-fadein">
        <h2 className="text-2xl font-bold mb-4 text-center text-green-700 animate-bouncein">Log In</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lime-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-lime-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm text-center animate-fadein">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-lime-500 to-green-600 text-white py-2 rounded-full font-semibold hover:brightness-110 shadow-lg transition duration-300"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Don’t have an account?{' '}
          <span
            className="text-blue-600 underline cursor-pointer hover:text-blue-800"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </span>
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-xs text-center text-green-900">
        <p>For support: taonzo@gmail.com</p>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bouncein {
          0% { transform: scale(0.8) translateY(-20px); opacity: 0; }
          60% { transform: scale(1.05) translateY(5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); }
        }
        .animate-fadein { animation: fadein 1s ease-out forwards; }
        .animate-bouncein { animation: bouncein 0.6s ease-out forwards; }
      `}</style>
    </div>
  );
}
