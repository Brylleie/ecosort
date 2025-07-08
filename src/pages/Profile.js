import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import { FiUser } from "react-icons/fi";
import {
  updateProfile,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
  signOut,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  updateDoc,
  query,
  collection,
  getDocs,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return navigate("/");
      setUser(currentUser);
      setEmail(currentUser.email);
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUsername(data.username || "");
        setPoints(data.totalPoints || 0);
        if (data.profileUrl) setProfileUrl(data.profileUrl);
      }
      const q = query(collection(db, "users"), orderBy("totalPoints", "desc"));
      const snapshot = await getDocs(q);
      const ranked = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const index = ranked.findIndex((u) => u.id === currentUser.uid);
      setRank(index + 1);
    });
    return () => unsub();
  }, [navigate]);

  const handleProfilePicUpload = async () => {
    if (profilePic) {
      const fileRef = ref(storage, `profiles/${user.uid}/${uuidv4()}`);
      await uploadBytes(fileRef, profilePic);
      const url = await getDownloadURL(fileRef);
      await updateDoc(doc(db, "users", user.uid), { profileUrl: url });
      setProfileUrl(url);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (username) {
        await updateProfile(user, { displayName: username });
        await updateDoc(doc(db, "users", user.uid), { username });
      }
      if (email && email !== user.email) {
        await updateEmail(user, email);
      }
      if (password) {
        await updatePassword(user, password);
      }
      await handleProfilePicUpload();
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This cannot be undone.")) {
      try {
        await deleteUser(auth.currentUser);
        alert("Account deleted.");
        navigate("/");
      } catch (err) {
        console.error(err);
        alert("Failed to delete account.");
      }
    }
  };

  const getBadge = () => {
    if (points >= 1000) return "\ud83c\udfc6 Eco Hero";
    if (points >= 500) return "\ud83c\udf3f Eco Advocate";
    if (points >= 100) return "\u267b\ufe0f Eco Starter";
    return "\ud83d\udc64 Newbie";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-lime-200 to-green-300 flex justify-center items-center px-4 py-8 font-sans">
      <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl animate-fadein">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-4 animate-bouncein">My Profile</h2>

        <div className="flex flex-col items-center mb-4">
          {profileUrl ? (
            <img
              src={profileUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-green-400 shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-2 border">
              <FiUser size={40} className="text-gray-600" />
            </div>
          )}

          <label className="text-sm text-blue-600 cursor-pointer hover:underline">
            Change Profile Picture
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setProfilePic(e.target.files[0])}
            />
          </label>
        </div>

        <div className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Name / Username"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password (leave blank to keep current)"
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="text-sm text-gray-700 mt-4 space-y-1">
          <p><strong>Points:</strong> {points}</p>
          <p><strong>Leaderboard Rank:</strong> {rank}</p>
          <p><strong>Badge:</strong> {getBadge()}</p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-6 bg-gradient-to-r from-lime-500 to-green-600 text-white py-2 rounded-full font-semibold hover:brightness-110 shadow-md transition duration-300"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <div className="flex justify-between mt-4 text-sm">
          <button onClick={handleLogout} className="text-red-600 hover:underline">
            Logout
          </button>
          <button onClick={handleDeleteAccount} className="text-red-600 hover:underline">
            Delete Account
          </button>
        </div>
      </div>

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
