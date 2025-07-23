// AdminPanel.js - Updated with Welcome.js design theme

import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, updateDoc, doc, orderBy, query, getDoc } from "firebase/firestore";
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
        const q = query(collection(db, "violation_reports"), orderBy("submittedAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setReports(data);
      }
      setLoading(false);
    };

    verifyAdmin();
  }, [navigate]);

  const updateStatus = async (id, newStatus) => {
    const reportRef = doc(db, "violation_reports", id);
    await updateDoc(reportRef, { status: newStatus });
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r)));
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-green-300 flex flex-col overflow-hidden font-sans text-white">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 text-green-300 text-4xl opacity-30 select-none">♻️</div>
      <div className="absolute bottom-24 right-10 text-green-400 text-5xl opacity-20 select-none">🍃</div>
      <div className="absolute top-8 right-28 text-green-500 text-3xl opacity-10 select-none">🗑️</div>
      <div className="absolute left-1/3 bottom-12 text-6xl opacity-10">🌎</div>

      <header className="flex justify-between items-center px-4 py-3 shadow bg-white text-green-800">
        <h1 className="font-bold text-lg">Admin Panel - ECOSORT</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-gradient-to-r from-lime-500 to-green-600 hover:brightness-110 text-white py-1 px-4 rounded-full text-sm"
        >
          Back to Dashboard
        </button>
      </header>

      <main className="flex-1 p-6">
        <h2 className="text-xl font-bold mb-4 text-green-900">Violation Reports</h2>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p>No reports found.</p>
        ) : (
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report.id} className="bg-white text-green-900 p-4 rounded shadow">
                <p><strong>Description:</strong> {report.description}</p>
                <p><strong>Location:</strong> {report.location}</p>
                <p><strong>Status:</strong> {report.status}</p>

                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => updateStatus(report.id, "in review")}
                    className="bg-yellow-400 px-2 py-1 rounded"
                  >
                    In Review
                  </button>
                  <button
                    onClick={() => updateStatus(report.id, "resolved")}
                    className="bg-green-500 text-white px-2 py-1 rounded"
                  >
                    Mark Resolved
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <footer className="text-xs text-center text-green-900 py-6">
        <p>♻️ ECOSORT Admin Panel • Brgy. T. Alonzo</p>
        <p className="mt-1">Contact: taonzo@gmail.com • 0912 345 6789</p>
      </footer>
    </div>
  );
}
