import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FiUser, FiBell, FiSettings } from "react-icons/fi";
import {
  FaRecycle,
  FaGift,
  FaExclamationTriangle,
  FaTrophy,
  FaFileAlt,
  FaLeaf,
  FaCoins,
  FaCalendarAlt,
} from "react-icons/fa";

export default function Dashboard() {
  const [userName, setUserName] = useState("User");
  const [points, setPoints] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
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

      const pointsQuery = query(
        collection(db, "point_transactions"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const pointsSnap = await getDocs(pointsQuery);
      const pointsData = pointsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const rewardsQuery = query(
        collection(db, "reward_redemptions"),
        where("userId", "==", user.uid),
        orderBy("timestamp", "desc")
      );
      const rewardsSnap = await getDocs(rewardsQuery);
      const rewardsData = rewardsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      setTransactions(pointsData);
      setRedemptions(rewardsData);
    };

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchUserData();

    return () => clearInterval(timer);
  }, [navigate]);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const menuItems = [
    {
      id: "submit",
      title: "Submit Waste",
      subtitle: "Earn points for recycling",
      icon: FaRecycle,
      color: "from-emerald-400 to-green-500",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-700",
      route: "/SubmitWaste",
    },
    {
      id: "rewards",
      title: "Rewards",
      subtitle: "Redeem your points",
      icon: FaGift,
      color: "from-amber-400 to-orange-500",
      bgColor: "bg-amber-50",
      textColor: "text-amber-700",
      route: "/rewards",
    },
    {
      id: "report",
      title: "Report Forum",
      subtitle: "Community discussions",
      icon: FaExclamationTriangle,
      color: "from-red-400 to-rose-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      route: "/forum",
    },
    {
      id: "leaderboard",
      title: "Leaderboards",
      subtitle: "See top contributors",
      icon: FaTrophy,
      color: "from-blue-400 to-indigo-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      route: "/leaderboard",
    },
    {
      id: "transactions",
      title: "Transactions",
      subtitle: "View your history",
      icon: FaFileAlt,
      color: "from-gray-400 to-slate-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      route: "/transactions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 relative overflow-hidden">
      {/* Transactions Section */}
      <div className="mt-12 p-6 bg-white/80 rounded-3xl shadow-xl">
        <h2 className="text-xl font-bold text-green-800 mb-4">Transaction History</h2>

        <h3 className="text-md font-semibold text-green-600 mb-2">Points Earned</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">No point transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li key={tx.id} className="text-sm border-b pb-2">
                <span className="font-medium text-green-700">{tx.description}</span><br />
                <span className="text-gray-500">{new Date(tx.timestamp?.seconds * 1000).toLocaleString()}</span><br />
                <span className="text-green-800 font-bold">+{tx.points} pts</span>
              </li>
            ))}
          </ul>
        )}

        <h3 className="text-md font-semibold text-red-600 mt-6 mb-2">Rewards Redeemed</h3>
        {redemptions.length === 0 ? (
          <p className="text-sm text-gray-500">No rewards redeemed yet.</p>
        ) : (
          <ul className="space-y-2">
            {redemptions.map((rd) => (
              <li key={rd.id} className="text-sm border-b pb-2">
                <span className="font-medium text-red-700">{rd.rewardName}</span><br />
                <span className="text-gray-500">{new Date(rd.timestamp?.seconds * 1000).toLocaleString()}</span><br />
                <span className="text-red-800 font-bold">-{rd.pointCost} pts</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
