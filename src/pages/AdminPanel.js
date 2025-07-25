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
  addDoc, 
  deleteDoc,
  serverTimestamp 
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('reports');
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });
  
  // Modals
  const [pointsModal, setPointsModal] = useState({ visible: false, user: null });
  const [rewardModal, setRewardModal] = useState({ visible: false, reward: null, isEdit: false });
  
  // Forms
  const [pointsForm, setPointsForm] = useState({ amount: '', reason: '' });
  const [rewardForm, setRewardForm] = useState({ 
    name: '', 
    description: '', 
    cost: '', 
    stock: '', 
    category: 'electronics' 
  });

  const navigate = useNavigate();

  useEffect(() => {
    const verifyAdminAndLoadData = async () => {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists() || userSnap.data().role !== "admin") {
          showToast("Access denied. Admins only.", "error");
          navigate("/dashboard");
          return;
        }

        await loadAllData();
      } catch (error) {
        console.error("Error loading data:", error);
        showToast("Error loading data", "error");
      }
      setLoading(false);
    };

    verifyAdminAndLoadData();
  }, [navigate]);

  const loadAllData = async () => {
    // Load reports
    const reportsQuery = query(collection(db, "violation_reports"), orderBy("submittedAt", "desc"));
    const reportsSnapshot = await getDocs(reportsQuery);
    setReports(reportsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Load users
    const usersSnapshot = await getDocs(collection(db, "users"));
    setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Load rewards
    const rewardsSnapshot = await getDocs(collection(db, "rewards"));
    setRewards(rewardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Load transactions
    const transactionsQuery = query(collection(db, "transactions"), orderBy("timestamp", "desc"));
    const transactionsSnapshot = await getDocs(transactionsQuery);
    setTransactions(transactionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  };

  const updateReportStatus = async (id, newStatus) => {
    try {
      const reportRef = doc(db, "violation_reports", id);
      await updateDoc(reportRef, { status: newStatus });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
      showToast("Report status updated", "success");
    } catch (error) {
      showToast("Error updating status", "error");
    }
  };

  const givePoints = async () => {
    try {
      const amount = parseInt(pointsForm.amount);
      const userRef = doc(db, "users", pointsModal.user.id);
      const newTotal = (pointsModal.user.totalPoints || 0) + amount;
      
      await updateDoc(userRef, { totalPoints: newTotal });
      
      // Record transaction
      await addDoc(collection(db, "transactions"), {
        type: "points_awarded",
        userId: pointsModal.user.id,
        userName: pointsModal.user.email,
        amount: amount,
        reason: pointsForm.reason,
        adminId: auth.currentUser.uid,
        timestamp: serverTimestamp()
      });

      setUsers(prev => prev.map(u => 
        u.id === pointsModal.user.id ? { ...u, totalPoints: newTotal } : u
      ));

      setPointsModal({ visible: false, user: null });
      setPointsForm({ amount: '', reason: '' });
      showToast(`${amount} points awarded to ${pointsModal.user.email}`, "success");
      await loadAllData(); // Refresh transactions
    } catch (error) {
      showToast("Error awarding points", "error");
    }
  };

  const saveReward = async () => {
    try {
      const rewardData = {
        ...rewardForm,
        cost: parseInt(rewardForm.cost),
        stock: parseInt(rewardForm.stock),
        updatedAt: serverTimestamp()
      };

      if (rewardModal.isEdit) {
        await updateDoc(doc(db, "rewards", rewardModal.reward.id), rewardData);
        showToast("Reward updated successfully", "success");
      } else {
        rewardData.createdAt = serverTimestamp();
        await addDoc(collection(db, "rewards"), rewardData);
        showToast("Reward created successfully", "success");
      }

      setRewardModal({ visible: false, reward: null, isEdit: false });
      setRewardForm({ name: '', description: '', cost: '', stock: '', category: 'electronics' });
      await loadAllData();
    } catch (error) {
      showToast("Error saving reward", "error");
    }
  };

  const deleteReport = async (id) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      try {
        await deleteDoc(doc(db, "violation_reports", id));
        setReports(prev => prev.filter(r => r.id !== id));
        showToast("Report deleted", "success");
      } catch (error) {
        showToast("Error deleting report", "error");
      }
    }
  };

  const deleteReward = async (id) => {
    if (window.confirm("Are you sure you want to delete this reward?")) {
      try {
        await deleteDoc(doc(db, "rewards", id));
        setRewards(prev => prev.filter(r => r.id !== id));
        showToast("Reward deleted", "success");
      } catch (error) {
        showToast("Error deleting reward", "error");
      }
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'pending': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-400' },
      'in review': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-400' },
      'resolved': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-400' }
    };
    const config = statusConfig[status] || statusConfig['pending'];
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
        {status || 'pending'}
      </span>
    );
  };

  const tabs = [
    { id: 'reports', name: 'Reports', icon: '📋', count: reports.length, color: 'text-red-600' },
    { id: 'users', name: 'Users', icon: '👥', count: users.length, color: 'text-blue-600' },
    { id: 'rewards', name: 'Rewards', icon: '🎁', count: rewards.length, color: 'text-purple-600' },
    { id: 'transactions', name: 'Transactions', icon: '💰', count: transactions.length, color: 'text-green-600' }
  ];

  const stats = [
    { name: 'Total Reports', value: reports.length, icon: '📋', color: 'bg-red-500', trend: '+12%' },
    { name: 'Active Users', value: users.length, icon: '👥', color: 'bg-blue-500', trend: '+8%' },
    { name: 'Available Rewards', value: rewards.length, icon: '🎁', color: 'bg-purple-500', trend: '+5%' },
    { name: 'Total Transactions', value: transactions.length, icon: '💰', color: 'bg-green-500', trend: '+15%' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading admin panel...</p>
          <p className="text-slate-400 text-sm mt-1">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                A
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-slate-500 text-sm font-medium">T. Alonzo Project Management</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
                  <p className="text-emerald-600 text-xs font-medium mt-1">{stat.trend} from last month</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-lg shadow-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 mb-8">
          <div className="px-6 pt-6">
            <nav className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-3 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100/70'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activeTab === tab.id 
                      ? 'bg-white/20 text-white' 
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Reports Tab */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Violation Reports</h2>
                    <p className="text-slate-500 text-sm">Manage and track community violation reports</p>
                  </div>
                </div>
                
                {reports.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📋</span>
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 mb-2">No reports found</h3>
                    <p className="text-slate-500">All clear! No violation reports to review.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <h3 className="font-semibold text-slate-800">Report #{report.id.slice(-8)}</h3>
                              {getStatusBadge(report.status)}
                            </div>
                            <p className="text-slate-700 mb-3 leading-relaxed">{report.description}</p>
                            <div className="flex items-center space-x-6 text-sm text-slate-500">
                              <div className="flex items-center space-x-2">
                                <span>📍</span>
                                <span>{report.location}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>🕒</span>
                                <span>{formatTimestamp(report.submittedAt)}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteReport(report.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <div className="flex space-x-3 pt-4 border-t border-slate-100">
                          <button
                            onClick={() => updateReportStatus(report.id, "in review")}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors font-medium"
                          >
                            Mark In Review
                          </button>
                          <button
                            onClick={() => updateReportStatus(report.id, "resolved")}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm hover:bg-emerald-600 transition-colors font-medium"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">User Management</h2>
                    <p className="text-slate-500 text-sm">Manage users and award points</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Points</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {user.email ? user.email.charAt(0).toUpperCase() : "?"}
                                </div>
                                <div className="text-sm font-medium text-slate-800">{user.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                                {user.totalPoints || 0} points
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                                user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {user.role || 'resident'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setPointsModal({ visible: true, user })}
                                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 text-sm font-medium"
                              >
                                Give Points
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Rewards Tab */}
            {activeTab === 'rewards' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Rewards Management</h2>
                    <p className="text-slate-500 text-sm">Create and manage reward items</p>
                  </div>
                  <button
                    onClick={() => setRewardModal({ visible: true, reward: null, isEdit: false })}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg font-medium"
                  >
                    + Add New Reward
                  </button>
                </div>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-slate-800 text-lg">{reward.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setRewardForm(reward);
                              setRewardModal({ visible: true, reward, isEdit: true });
                            }}
                            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteReward(reward.id)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm mb-4 leading-relaxed">{reward.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-indigo-600">{reward.cost} points</span>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          reward.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {reward.stock} in stock
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Transaction History</h2>
                    <p className="text-slate-500 text-sm">Track all point transactions and rewards</p>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">User</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {formatTimestamp(transaction.timestamp)}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                                transaction.type === 'points_awarded' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {transaction.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                              {transaction.userName}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold text-emerald-600">
                                +{transaction.amount} points
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                              {transaction.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Points Modal */}
      {pointsModal.visible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">Award Points</h3>
              <p className="text-slate-500 text-sm mt-1">Give points to {pointsModal.user?.email}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Points Amount</label>
                <input
                  type="number"
                  value={pointsForm.amount}
                  onChange={(e) => setPointsForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter points to award"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Reason</label>
                <input
                  type="text"
                  value={pointsForm.reason}
                  onChange={(e) => setPointsForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Reason for awarding points"
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-b-2xl flex space-x-3">
              <button
                onClick={givePoints}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 px-4 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium"
              >
                Award Points
              </button>
              <button
                onClick={() => {
                  setPointsModal({ visible: false, user: null });
                  setPointsForm({ amount: '', reason: '' });
                }}
                className="flex-1 bg-slate-200 text-slate-700 py-3 px-4 rounded-xl hover:bg-slate-300 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Reward Modal */}
      {rewardModal.visible && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-800">
                {rewardModal.isEdit ? 'Edit Reward' : 'Create New Reward'}
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                {rewardModal.isEdit ? 'Update reward details' : 'Add a new reward to the catalog'}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Reward Name</label>
                <input
                  type="text"
                  value={rewardForm.name}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  placeholder="Enter reward name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                <textarea
                  value={rewardForm.description}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                  rows={3}
                  placeholder="Describe the reward..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Cost (Points)</label>
                  <input
                    type="number"
                    value={rewardForm.cost}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, cost: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Stock Quantity</label>
                  <input
                    type="number"
                    value={rewardForm.stock}
                    onChange={(e) => setRewardForm(prev => ({ ...prev, stock: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
                <select
                  value={rewardForm.category}
                  onChange={(e) => setRewardForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                >
                  <option value="electronics">Electronics</option>
                  <option value="food">Food & Beverages</option>
                  <option value="clothing">Clothing</option>
                  <option value="home">Home & Garden</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="p-6 bg-slate-50 rounded-b-2xl flex space-x-3">
              <button
                onClick={saveReward}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                {rewardModal.isEdit ? 'Update' : 'Create'} Reward
              </button>
              <button
                onClick={() => {
                  setRewardModal({ visible: false, reward: null, isEdit: false });
                  setRewardForm({ name: '', description: '', cost: '', stock: '', category: 'electronics' });
                }}
                className="flex-1 bg-slate-200 text-slate-700 py-3 px-4 rounded-xl hover:bg-slate-300 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Toast Notifications */}
      {toast.visible && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-2xl text-white shadow-2xl transition-all duration-300 z-50 backdrop-blur-sm ${
          toast.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 
          toast.type === 'error' ? 'bg-gradient-to-r from-red-500 to-rose-600' : 
          'bg-gradient-to-r from-blue-500 to-indigo-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
              toast.type === 'success' ? 'bg-white/20' : 
              toast.type === 'error' ? 'bg-white/20' : 
              'bg-white/20'
            }`}>
              {toast.type === 'success' && '✓'}
              {toast.type === 'error' && '✕'}
              {toast.type === 'info' && 'i'}
            </div>
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}