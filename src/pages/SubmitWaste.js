// src/pages/SubmitWaste.js
import { useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function SubmitWaste() {
  const [type, setType] = useState("plastic");
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const points = calculatePoints(type, weight);
    const userId = auth.currentUser.uid;

    try {
      await addDoc(collection(db, "waste_submissions"), {
        userId,
        type,
        weight: parseFloat(weight),
        points,
        submittedAt: serverTimestamp(),
      });

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const currentPoints = userSnap.data().totalPoints || 0;
        await updateDoc(userRef, {
          totalPoints: currentPoints + points,
        });
      } else {
        await setDoc(userRef, {
          totalPoints: points,
          email: auth.currentUser.email,
        });
      }

      alert(`Waste submitted! You earned ${points} points.`);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting waste:", error);
      alert("Submission failed.");
    }

    setLoading(false);
  };

  const calculatePoints = (type, weightKg) => {
    const weight = parseFloat(weightKg);
    const multipliers = {
      plastic: 10,
      paper: 8,
      metal: 12,
      glass: 9,
      others: 5,
    };
    return Math.round(weight * (multipliers[type] || 5));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-lime-200 to-green-300 px-4 font-sans">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm animate-fadein">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-4">Submit Waste</h2>

        <label className="block mb-2 text-green-900 font-semibold">Waste Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="plastic">Plastic</option>
          <option value="paper">Paper</option>
          <option value="metal">Metal</option>
          <option value="glass">Glass</option>
          <option value="others">Others</option>
        </select>

        <label className="block mb-2 text-green-900 font-semibold">Weight (kg)</label>
        <input
          type="number"
          step="0.01"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          required
          className="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-lime-500 to-green-600 text-white font-bold py-2 rounded-full shadow-lg hover:brightness-110 transition duration-300"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>

      {/* Animations */}
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
