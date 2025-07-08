import { useState } from "react";
import { db, auth, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function Report() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleMediaChange = (e) => {
    if (e.target.files[0]) {
      setMedia(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let mediaUrl = null;

      if (media) {
        const fileRef = ref(storage, `reports/${uuidv4()}-${media.name}`);
        await uploadBytes(fileRef, media);
        mediaUrl = await getDownloadURL(fileRef);
      }

      await addDoc(collection(db, "violation_reports"), {
        reportedBy: auth.currentUser.uid,
        description,
        location,
        mediaUrl,
        status: "pending",
        likes: [],
        comments: [],
        submittedAt: serverTimestamp(),
      });

      alert("Report submitted successfully.");
      navigate("/forum"); // Go to forum page
    } catch (err) {
      console.error("Error reporting:", err);
      alert("Failed to submit report.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-green-300 flex flex-col items-center justify-center px-4 py-6 font-sans">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl animate-fadein">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-4 animate-bouncein">Report a Violation</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Photo/Video (optional)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="w-full p-1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-2 rounded-full font-semibold hover:brightness-110 shadow-lg transition duration-300"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>

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
