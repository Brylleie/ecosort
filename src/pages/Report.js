import { useState, useEffect } from "react";
import { db, auth, storage } from "../firebase";
import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

export default function Report() {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const navigate = useNavigate();

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocation(`Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
          setUseCurrentLocation(true);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please enter manually.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

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

      const reportData = {
        reportedBy: auth.currentUser.uid,
        reporterEmail: auth.currentUser.email,
        description,
        location,
        mediaUrl,
        status: "pending",
        likes: [],
        comments: [],
        submittedAt: serverTimestamp(),
        coordinates: currentLocation || null,
        severity: "medium",
        category: "violation"
      };

      await addDoc(collection(db, "violation_reports"), reportData);

      alert("Report submitted successfully!");
      navigate("/forum");
    } catch (err) {
      console.error("Error reporting:", err);
      alert("Failed to submit report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-green-300 flex flex-col items-center justify-center px-4 py-6 font-sans">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl animate-fadein">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-4 animate-bouncein">Report a Violation</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Description *</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
              placeholder="Describe the violation in detail..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold mb-1">Location *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                className="flex-1 bg-blue-100 text-blue-700 py-2 px-3 rounded text-sm hover:bg-blue-200 transition-colors"
              >
                {useCurrentLocation ? "✓ Using Current Location" : "Use Current Location"}
              </button>
              <span className="flex items-center text-gray-500 text-sm">or</span>
              <input
                type="text"
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setUseCurrentLocation(false);
                }}
                required
                className="flex-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-300"
                placeholder="Enter address or landmark"
              />
            </div>
            {useCurrentLocation && (
              <p className="text-xs text-gray-500">Location accuracy: ~{currentLocation ? "10-50 meters" : "unknown"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Photo/Video (optional)</label>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaChange}
              className="w-full p-1 border rounded"
            />
            <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-2 rounded-full font-semibold hover:brightness-110 shadow-lg transition duration-300 disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}