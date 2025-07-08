import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";

export default function Rewards() {
  const [submissions, setSubmissions] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const userId = auth.currentUser.uid;

      // Fetch total points
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setTotalPoints(userSnap.data().totalPoints || 0);
      }

      // Fetch waste submission history
      const q = query(
        collection(db, "waste_submissions"),
        where("userId", "==", userId)
      );
      const querySnapshot = await getDocs(q);
      const history = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSubmissions(history);
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-green-300 p-6 font-sans">
      <h2 className="text-2xl font-bold mb-4 text-green-800 text-center animate-fadein">🎁 Your Rewards</h2>

      <div className="bg-white p-4 rounded-2xl shadow text-xl text-center mb-6 animate-bouncein">
        🪙 Total Points: <span className="font-bold text-green-700">{totalPoints}</span>
      </div>

      <h3 className="text-lg font-semibold mb-2 text-green-800">📜 Submission History</h3>
      <ul className="space-y-3">
        {submissions.map((item) => (
          <li key={item.id} className="bg-white p-4 rounded-xl shadow-md animate-fadein">
            <div className="font-medium text-green-700">Type: {item.type}</div>
            <div className="text-green-900">Weight: {item.weight} kg</div>
            <div className="text-green-900">Points Earned: {item.points}</div>
          </li>
        ))}
      </ul>

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
