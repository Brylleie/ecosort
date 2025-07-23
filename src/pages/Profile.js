import { useEffect, useState } from "react";
import { auth, db, storage } from "../firebase";
import { FiUser, FiCamera, FiEdit3, FiEye, FiEyeOff, FiArrowLeft, FiLogOut, FiTrash2, FiSave, FiMail, FiLock, FiAward, FiTrendingUp } from "react-icons/fi";
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
  const [showPassword, setShowPassword] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profileUrl, setProfileUrl] = useState("");
  const [points, setPoints] = useState(0);
  const [rank, setRank] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [achievements, setAchievements] = useState([]);
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
        
        // Generate achievements based on points
        const userAchievements = generateAchievements(data.totalPoints || 0);
        setAchievements(userAchievements);
      }
      
      const q = query(collection(db, "users"), orderBy("totalPoints", "desc"));
      const snapshot = await getDocs(q);
      const ranked = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const index = ranked.findIndex((u) => u.id === currentUser.uid);
      setRank(index + 1);
    });
    return () => unsub();
  }, [navigate]);

  const generateAchievements = (points) => {
    const achievements = [];
    if (points >= 100) achievements.push({ name: "First Steps", icon: "🌱", description: "Earned your first 100 points" });
    if (points >= 500) achievements.push({ name: "Eco Advocate", icon: "🌿", description: "Reached 500 points milestone" });
    if (points >= 1000) achievements.push({ name: "Eco Hero", icon: "🏆", description: "Achieved 1000 points!" });
    if (points >= 2000) achievements.push({ name: "Green Champion", icon: "👑", description: "Outstanding 2000+ points" });
    return achievements;
  };

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
      setIsEditing(false);
      setPassword("");
      alert("Profile updated successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await signOut(auth);
      navigate("/");
    }
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
    if (points >= 2000) return { name: "Green Champion", icon: "👑", color: "from-purple-500 to-pink-500" };
    if (points >= 1000) return { name: "Eco Hero", icon: "🏆", color: "from-yellow-400 to-orange-500" };
    if (points >= 500) return { name: "Eco Advocate", icon: "🌿", color: "from-green-400 to-emerald-500" };
    if (points >= 100) return { name: "Eco Starter", icon: "♻️", color: "from-blue-400 to-cyan-500" };
    return { name: "Newbie", icon: "👤", color: "from-gray-400 to-gray-500" };
  };

  const getProgressToNextLevel = () => {
    const levels = [100, 500, 1000, 2000];
    const nextLevel = levels.find(level => points < level);
    if (!nextLevel) return { progress: 100, remaining: 0, nextLevel: 2000 };
    
    const prevLevel = levels[levels.indexOf(nextLevel) - 1] || 0;
    const progress = ((points - prevLevel) / (nextLevel - prevLevel)) * 100;
    return { progress, remaining: nextLevel - points, nextLevel };
  };

  const currentBadge = getBadge();
  const levelProgress = getProgressToNextLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-emerald-200 text-5xl opacity-20 animate-float">🌿</div>
        <div className="absolute top-20 right-20 text-teal-300 text-4xl opacity-15 animate-float-reverse">♻️</div>
        <div className="absolute bottom-20 left-1/4 text-cyan-200 text-6xl opacity-10 animate-pulse">🌱</div>
      </div>

      <div className="relative z-10 px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slide-down">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <FiArrowLeft className="text-gray-700" />
            <span className="text-gray-700 font-medium">Dashboard</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 ${
              isEditing 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            <FiEdit3 />
            <span className="font-medium">{isEditing ? 'Cancel' : 'Edit'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 animate-fade-in">
              {/* Profile Picture */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative group">
                  {profileUrl ? (
                    <img
                      src={profileUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                      <FiUser size={48} className="text-gray-600" />
                    </div>
                  )}
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-3 shadow-lg cursor-pointer hover:bg-blue-600 transition-colors duration-300">
                      <FiCamera className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setProfilePic(e.target.files[0])}
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-800 text-center">
                  {username || "Anonymous User"}
                </h2>
                <p className="text-gray-600">{email}</p>
              </div>

              {/* Badge */}
              <div className="text-center mb-6">
                <div className={`inline-flex items-center space-x-2 bg-gradient-to-r ${currentBadge.color} text-white px-6 py-3 rounded-2xl shadow-lg`}>
                  <span className="text-2xl">{currentBadge.icon}</span>
                  <span className="font-bold">{currentBadge.name}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-100 to-green-200 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-emerald-700">{points.toLocaleString()}</div>
                  <div className="text-sm text-emerald-600">Total Points</div>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-700">#{rank || '?'}</div>
                  <div className="text-sm text-blue-600">Global Rank</div>
                </div>
              </div>

              {/* Progress to Next Level */}
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Next Level</span>
                  <span className="text-sm text-gray-500">{levelProgress.remaining} points to go</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 animate-fade-in-up">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FiUser className="mr-3" />
                Profile Information
              </h3>

              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Enter your username"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-300 ${
                        isEditing 
                          ? 'border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-12 py-3 rounded-xl border border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white transition-all duration-300"
                        placeholder="Enter new password (optional)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                  </div>
                )}

                {isEditing && (
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <FiSave />
                    <span>{saving ? "Saving..." : "Save Changes"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 animate-fade-in-up">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FiAward className="mr-3" />
                Achievements
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.length > 0 ? (
                  achievements.map((achievement, index) => (
                    <div key={index} className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-2xl p-6 border border-amber-200">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div>
                          <h4 className="font-bold text-amber-800">{achievement.name}</h4>
                          <p className="text-sm text-amber-600">{achievement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500">
                    <FiTrendingUp className="mx-auto text-4xl mb-4 opacity-50" />
                    <p>Start earning points to unlock achievements!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/30 animate-fade-in-up">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Account Actions</h3>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <FiLogOut />
                  <span>Logout</span>
                </button>
                
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <FiTrash2 />
                  <span>Delete Account</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(15px) rotate(-1deg); }
        }
        
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 8s ease-in-out infinite; }
        .animate-slide-down { animation: slide-down 0.8s ease-out; }
        .animate-fade-in { animation: fade-in 1s ease-out 0.2s both; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out 0.4s both; }
      `}</style>
    </div>
  );
}