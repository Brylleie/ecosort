import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCred.user.uid;

      await setDoc(doc(db, "users", userId), {
        email,
        username,
        totalPoints: 0,
        role: "resident",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-green-300 flex flex-col items-center justify-center px-4 font-sans">
      {/* Title */}
      <h1 className="text-3xl font-bold text-green-800 mb-4 animate-fadein">Create Your Ecosort Account</h1>

      {/* Signup Card */}
      <div className="bg-white w-full max-w-sm p-6 rounded-xl shadow-lg animate-fadein">
        <h2 className="text-xl font-bold mb-4 text-green-700 text-center">Sign Up</h2>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-lime-500 to-green-600 text-white py-2 rounded-full font-semibold shadow hover:brightness-110"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{' '}
          <span
            className="text-blue-600 underline cursor-pointer"
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-xs text-center text-green-800">
        <p>♻️ Collection every Thursday morning • Brgy. T. Alonzo</p>
        <p className="mt-1">Contact us: taonzo@gmail.com • 0912 345 6789</p>
      </footer>

      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein {
          animation: fadein 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
