import { useEffect, useState } from "react";
import {
  collection,
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { FiThumbsUp, FiUser } from "react-icons/fi";

export default function ReportForum() {
  const [reports, setReports] = useState([]);
  const [commentText, setCommentText] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "violation_reports"), (snapshot) => {
      const items = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => b.submittedAt?.seconds - a.submittedAt?.seconds);
      setReports(items);
    });

    return () => unsub();
  }, []);

  const handleLike = async (reportId) => {
    const reportRef = doc(db, "violation_reports", reportId);
    await updateDoc(reportRef, {
      likes: arrayUnion(auth.currentUser.uid),
    });
  };

  const handleCommentSubmit = async (reportId) => {
    const text = commentText[reportId]?.trim();
    if (!text) return;

    const comment = {
      text,
      user: auth.currentUser.email,
      timestamp: new Date(),
    };

    const reportRef = doc(db, "violation_reports", reportId);
    await updateDoc(reportRef, {
      comments: arrayUnion(comment),
    });

    setCommentText((prev) => ({ ...prev, [reportId]: "" }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-green-300 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4">
        <h1 className="font-bold text-xl text-green-800">T. Alonzo Project</h1>
        <button onClick={() => navigate("/dashboard")}
          className="p-2 bg-white rounded-full shadow hover:shadow-md">
          <FiUser size={20} className="text-green-800" />
        </button>
      </div>

      <h2 className="text-2xl font-bold px-6 text-green-800 mb-4">Report Forum</h2>

      <div className="space-y-6 px-6 pb-20">
        {reports.map((report) => {
          const likeCount = report.likes?.length || 0;
          const isLiked = report.likes?.includes(auth.currentUser.uid);
          return (
            <div key={report.id} className="bg-white rounded-2xl shadow-md p-4 animate-fadein">
              <div className="text-sm text-gray-500 mb-2">
                📍 <strong>{report.location}</strong> •{" "}
                {new Date(report.submittedAt?.seconds * 1000).toLocaleString()}
              </div>

              <p className="text-gray-800 mb-2">{report.description}</p>

              {report.mediaUrl && (
                <div className="mb-2">
                  {report.mediaUrl.includes(".mp4") ? (
                    <video controls className="w-full rounded-lg">
                      <source src={report.mediaUrl} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={report.mediaUrl}
                      alt="Proof"
                      className="rounded-lg w-full"
                    />
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <button
                  className={`flex items-center gap-1 ${isLiked ? "text-blue-600" : ""}`}
                  onClick={() => handleLike(report.id)}
                >
                  <FiThumbsUp />
                  {likeCount}
                </button>
              </div>

              {/* Comments */}
              <div className="space-y-1 text-sm">
                {report.comments?.map((c, i) => (
                  <div key={i} className="border rounded p-2 bg-gray-50">
                    <strong className="text-green-600">{c.user}</strong>: {c.text}
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={commentText[report.id] || ""}
                  onChange={(e) =>
                    setCommentText((prev) => ({
                      ...prev,
                      [report.id]: e.target.value,
                    }))
                  }
                  className="flex-1 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400"
                />
                <button
                  onClick={() => handleCommentSubmit(report.id)}
                  className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                >
                  Post
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes fadein {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadein { animation: fadein 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
}
