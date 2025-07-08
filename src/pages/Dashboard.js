import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import {
  FaRecycle,
  FaGift,
  FaExclamationTriangle,
  FaTrophy,
  FaFileAlt,
} from "react-icons/fa";

export default function Dashboard() {
  const [userName, setUserName] = useState("User");
  const [points, setPoints] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return navigate("/login");

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserName(data.username || "User");
        setPoints(data.totalPoints || 0);
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-200 px-4 py-6 font-sans overflow-hidden relative">
      {/* Animated background icon */}
      <div className="absolute top-20 left-10 text-green-300 text-4xl opacity-20 animate-float">♻️</div>
      <div className="absolute top-8 right-20 text-green-500 text-5xl opacity-10 animate-float-reverse">🌱</div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-green-800 animate-slidein">T. Alonzo Project</h1>
        <button
          onClick={() => navigate("/profile")}
          className="p-2 bg-white rounded-full shadow hover:shadow-md animate-fadein"
        >
          <FiUser size={20} className="text-green-800" />
        </button>
      </div>

      {/* Welcome & Points */}
      <div className="text-center mb-8 animate-fadein">
        <h2 className="text-2xl font-bold text-green-700 animate-bouncein">Welcome, {userName}!</h2>
        <p className="text-sm text-green-800">Points: {points}</p>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 animate-fadein">
        <div
          onClick={() => navigate("/SubmitWaste")}
          className="rounded-xl p-5 bg-green-100 shadow hover:shadow-lg cursor-pointer flex flex-col items-center justify-center transition-transform hover:scale-105"
        >
          <FaRecycle size={28} className="text-green-700 animate-float" />
          <p className="mt-2 font-medium text-green-900">Submit Waste</p>
        </div>

        <div
          onClick={() => navigate("/rewards")}
          className="rounded-xl p-5 bg-yellow-100 shadow hover:shadow-lg cursor-pointer flex flex-col items-center justify-center transition-transform hover:scale-105"
        >
          <FaGift size={28} className="text-yellow-600 animate-bouncein" />
          <p className="mt-2 font-medium text-green-900">Rewards</p>
        </div>

        <div
          onClick={() => navigate("/report")}
          className="rounded-xl p-5 bg-red-100 shadow hover:shadow-lg cursor-pointer flex flex-col items-center justify-center transition-transform hover:scale-105"
        >
          <FaExclamationTriangle size={28} className="text-red-600 animate-float" />
          <p className="mt-2 font-medium text-green-900">Report Forum</p>
        </div>

        <div
          onClick={() => navigate("/leaderboard")}
          className="rounded-xl p-5 bg-blue-100 shadow hover:shadow-lg cursor-pointer flex flex-col items-center justify-center transition-transform hover:scale-105"
        >
          <FaTrophy size={28} className="text-blue-600 animate-bouncein" />
          <p className="mt-2 font-medium text-green-900">Leaderboards</p>
        </div>

        <div
          onClick={() => navigate("/transactions")}
          className="rounded-xl p-5 bg-gray-100 shadow hover:shadow-lg cursor-pointer flex flex-col items-center justify-center transition-transform hover:scale-105"
        >
          <FaFileAlt size={28} className="text-gray-700 animate-float" />
          <p className="mt-2 font-medium text-green-900">Transactions</p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-10 text-xs text-center text-gray-600 animate-fadein">
        <p>Basura collection day every Thursday morning</p>
        <p>Contact us: 0912 345 6789 | taonzo@gmail.com</p>
        <p className="font-semibold mt-1">Brgy. T. Alonzo</p>
      </footer>

      {/* Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(12px); }
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bouncein {
          0% { transform: scale(0.8) translateY(-10px); opacity: 0; }
          60% { transform: scale(1.05) translateY(5px); opacity: 1; }
          100% { transform: scale(1) translateY(0); }
        }
        @keyframes slidein {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 6s ease-in-out infinite; }
        .animate-fadein { animation: fadein 1s ease-out forwards; }
        .animate-bouncein { animation: bouncein 0.7s ease-out forwards; }
        .animate-slidein { animation: slidein 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
