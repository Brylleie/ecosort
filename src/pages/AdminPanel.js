import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  query,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdmin = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists() || userSnap.data().role !== "admin") {
        alert("Access denied. Admins only.");
        navigate("/dashboard");
      } else {
        const q = query(
          collection(db, "violation_reports"),
          orderBy("submittedAt", "desc")
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(data);
      }
      setLoading(false);
    };

    verifyAdmin();
  }, [navigate]);

  const updateStatus = async (id, newStatus) => {
    const reportRef = doc(db, "violation_reports", id);
    await updateDoc(reportRef, { status: newStatus });
    setReports((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  if (loading) {
    return <div className="p-6 text-xl">Verifying access...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-green-300 px-6 py-10 font-sans">
      <h2 className="text-3xl font-bold text-green-800 mb-6 text-center animate-fadein">Admin Panel - Violation Reports</h2>

      {reports.length === 0 ? (
        <p className="text-center text-green-700">No reports found.</p>
      ) : (
        <div className="space-y-6">
          {reports.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-xl shadow-md animate-fadein">
              <div className="text-sm text-gray-500 mb-2">
                <strong>Location:</strong> {r.location} • {new Date(r.submittedAt?.seconds * 1000).toLocaleString()}
              </div>
              <p className="text-green-900 font-medium mb-2">{r.description}</p>
              {r.mediaUrl && (
                <div className="mb-2">
                  {r.mediaUrl.includes(".mp4") ? (
                    <video controls className="w-full rounded">
                      <source src={r.mediaUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <img src={r.mediaUrl} alt="proof" className="w-full rounded" />
                  )}
                </div>
              )}
              <p className="text-sm mb-2 text-gray-700"><strong>Status:</strong> <span className="capitalize">{r.status}</span></p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => updateStatus(r.id, "in review")}
                  className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-medium hover:brightness-110"
                >
                  In Review
                </button>
                <button
                  onClick={() => updateStatus(r.id, "resolved")}
                  className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-green-700"
                >
                  Mark Resolved
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein { animation: fadein 0.8s ease-out forwards; }
      `}</style>
    </div>
  );
}
