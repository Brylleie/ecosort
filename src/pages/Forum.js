/* global __firebase_config, __app_id, __initial_auth_token */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { 
  initializeApp 
} from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  doc, 
  serverTimestamp, 
  arrayUnion, 
  arrayRemove 
} from 'firebase/firestore';
// Custom Icons (re-using your provided SVG icons)
const ThumbsUpIcon = ({ className = "w-5 h-5", filled = false }) => (
  <svg className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4l-2 2m5-6h7" />
  </svg>
);

const MessageCircleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const MapPinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UserIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const AlertTriangleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const SendIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const XIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
export default function ReportForum() {
  const [reports, setReports] = useState([]);
  const [commentText, setCommentText] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [showReportModal, setShowReportModal] = useState(false);
  const [newReportLocation, setNewReportLocation] = useState('');
  const [newReportDescription, setNewReportDescription] = useState('');
  const [newReportSeverity, setNewReportSeverity] = useState('medium');
  const [newReportCategory, setNewReportCategory] = useState('illegal_dumping');
  const [newReportMediaUrl, setNewReportMediaUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();;

  // Firebase state variables
    const [firestoreDb, setFirestoreDb] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

  const handleReportClick = () => {
    navigate("/report"); // Navigate to the Report component
  };

    // Initialize Firebase and set up auth listener
    useEffect(() => {
      try {
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
        if (!firebaseConfig) {
          console.error("Firebase config is not defined. Cannot initialize Firebase.");
          setLoadingAuth(false);
          return;
        }
  
        const appInstance = initializeApp(firebaseConfig);
        const dbInstance = getFirestore(appInstance);
        const authInstance = getAuth(appInstance);
  
        setFirestoreDb(dbInstance);
  
        const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
          setCurrentUser(user);
          setLoadingAuth(false);
  
          if (!user) {
            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
              try {
                await signInWithCustomToken(authInstance, __initial_auth_token);
              } catch (error) {
                console.error("Firebase custom token authentication error:", error);
              }
            } else {
              try {
                await signInAnonymously(authInstance);
              } catch (error) {
                console.error("Firebase anonymous authentication error:", error);
              }
            }
          }
        });
  
        return () => unsubscribe();
      } catch (error) {
        console.error("Error during Firebase initialization:", error);
        setLoadingAuth(false);
        setFirestoreDb(null);
      }
    }, []);
  
    const currentUserId = currentUser?.uid || 'anonymous';
    const currentUserEmail = currentUser?.email || 'anonymous@example.com';
  
    // Fetch reports from Firestore
    useEffect(() => {
      if (!firestoreDb || loadingAuth || !currentUser) {
        return;
      }
  
      setLoading(true);
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const reportsCollectionRef = collection(firestoreDb, `artifacts/${appId}/public/data/reports`);
  
      const qReports = query(reportsCollectionRef, orderBy('submittedAt', 'desc'));
      const unsubscribe = onSnapshot(qReports, (snapshot) => {
        const fetchedReports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to JavaScript Date for consistent handling
          submittedAt: doc.data().submittedAt?.toDate ? doc.data().submittedAt.toDate() : new Date(),
          likes: doc.data().likes || [], // Ensure likes array exists
          comments: doc.data().comments || [] // Ensure comments array exists
        }));
        setReports(fetchedReports);
        setLoading(false);
      }, (err) => {
        setError("Failed to fetch reports. Check permissions and network.");
        console.error("Error fetching reports: ", err);
        setLoading(false);
      });
  
      return () => unsubscribe();
    }, [firestoreDb, loadingAuth, currentUser]); // Re-run when db, auth status, or user changes
  
    const handleLike = async (reportId) => {
      if (!currentUser || !firestoreDb) {
        alert("Please log in to like a report.");
        return;
      }
      const reportRef = doc(firestoreDb, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/public/data/reports`, reportId);
      const report = reports.find(r => r.id === reportId);
  
      if (report) {
        const isLiked = report.likes.includes(currentUser.uid);
        try {
          await updateDoc(reportRef, {
            likes: isLiked ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid)
          });
        } catch (e) {
          console.error("Error updating like: ", e);
          alert("Failed to update like. Please try again.");
        }
      }
    };
  
    const handleCommentSubmit = async (reportId) => {
      if (!currentUser || !firestoreDb) {
        alert("Please log in to comment.");
        return;
      }
      const text = commentText[reportId]?.trim();
      if (!text) return;
  
      const comment = {
        text,
        user: currentUserEmail,
        timestamp: serverTimestamp(), // Use serverTimestamp for new comments
      };
  
      const reportRef = doc(firestoreDb, `artifacts/${typeof __app_id !== 'undefined' ? __app_id : 'default-app-id'}/public/data/reports`, reportId);
  
      try {
        await updateDoc(reportRef, {
          comments: arrayUnion(comment)
        });
        setCommentText((prev) => ({ ...prev, [reportId]: "" }));
      } catch (e) {
        console.error("Error adding comment: ", e);
        alert("Failed to add comment. Please try again.");
      }
    };
  
    const toggleComments = (reportId) => {
      setExpandedComments(prev => ({
        ...prev,
        [reportId]: !prev[reportId]
      }));
    };
  
    const getSeverityColor = (severity) => {
      switch (severity) {
        case 'high': return 'bg-red-100 text-red-800 border-red-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };
  
    const formatTimeAgo = (timestamp) => {
      if (!timestamp) return 'N/A';
      // Ensure timestamp is a Date object
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp.seconds * 1000);
      const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
      if (seconds < 60) return 'Just now';
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      return `${Math.floor(seconds / 86400)}d ago`;
    };
  
    const handleReportSubmit = async (e) => {
      e.preventDefault();
      if (!currentUser || !firestoreDb) {
        alert("Please log in to submit a report.");
        return;
      }
      if (!newReportLocation.trim() || !newReportDescription.trim()) {
        alert("Please fill in all required fields.");
        return;
      }
  
      setLoading(true);
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
  
      try {
        await addDoc(collection(firestoreDb, `artifacts/${appId}/public/data/reports`), {
          location: newReportLocation,
          description: newReportDescription,
          severity: newReportSeverity,
          category: newReportCategory,
          mediaUrl: newReportMediaUrl,
          submittedAt: serverTimestamp(),
          likes: [],
          comments: [],
          authorId: currentUserId,
          authorEmail: currentUserEmail,
        });
        setShowReportModal(false);
        setNewReportLocation('');
        setNewReportDescription('');
        setNewReportSeverity('medium');
        setNewReportCategory('illegal_dumping');
        setNewReportMediaUrl('');
        setLoading(false);
      } catch (error) {
        console.error("Error submitting report:", error);
        setError("Failed to submit report. Please try again.");
        setLoading(false);
      }
    };
  
    const filteredReports = reports.filter(report => {
      if (filterType === 'all') return true;
      return report.category === filterType;
    });
  
    if (loadingAuth || (loading && !error && firestoreDb)) { 
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="ml-4 text-lg text-gray-700">Loading application...</p>
        </div>
      );
    }
  
    if (error && !loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <AlertTriangleIcon className="text-red-500 text-6xl mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Data</h2>
            <p className="text-gray-700">{error}</p>
            <p className="text-sm text-gray-500 mt-4">Please check your Firebase Security Rules and network connection.</p>
          </div>
        </div>
      );
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/profile")}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <UserIcon className="text-slate-600"/>
              </button>
              <div>
                <h1 className="font-bold text-xl text-slate-800">Community Reports</h1>
                <p className="text-sm text-slate-600">T. Alonzo Project</p>
              </div>
            </div>
            
            <button
              onClick={handleReportClick} // Call the new function to navigate to Report
              className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Reports', icon: '📋' },
            { id: 'illegal_dumping', label: 'Illegal Dumping', icon: '🚯' },
            { id: 'littering', label: 'Littering', icon: '🗑️' },
            { id: 'environmental', label: 'Environmental', icon: '🌊' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-200 ${
                filterType === filter.id
                  ? 'bg-indigo-500 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <span>{filter.icon}</span>
              <span className="font-medium">{filter.label}</span>
            </button>
          ))}
        </div>

        {/* Reports Feed */}
        <div className="space-y-6">
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <AlertTriangleIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No reports found</h3>
              <p className="text-slate-500">Be the first to report an issue in your community!</p>
            </div>
          ) : (
            filteredReports.map((report) => {
              const likeCount = report.likes?.length || 0;
              const isLiked = report.likes?.includes(currentUser?.uid); // Check for currentUser existence
              const commentCount = report.comments?.length || 0;
              const isCommentsExpanded = expandedComments[report.id];
              
              return (
                <div key={report.id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  {/* Report Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {report.location.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPinIcon className="text-slate-500" />
                            <span className="font-semibold text-slate-800">{report.location}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(report.severity)}`}>
                              {report.severity?.toUpperCase() || 'REPORTED'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <ClockIcon />
                            <span>{formatTimeAgo(report.submittedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Report Description */}
                    <p className="text-slate-700 leading-relaxed mb-4">{report.description}</p>

                    {/* Media */}
                    {report.mediaUrl && (
                      <div className="mb-4 rounded-xl overflow-hidden">
                        {report.mediaUrl.includes(".mp4") ? (
                          <video controls className="w-full max-h-80 object-cover">
                            <source src={report.mediaUrl} type="video/mp4" />
                          </video>
                        ) : (
                          <img
                            src={report.mediaUrl}
                            alt="Report evidence"
                            className="w-full max-h-80 object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/600x400/E0E7FF/4338CA?text=Image+Error`; }}
                          />
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-6 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleLike(report.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 ${
                          isLiked 
                            ? 'bg-blue-50 text-blue-600' 
                            : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <ThumbsUpIcon filled={isLiked} />
                        <span className="font-medium">{likeCount}</span>
                        <span className="text-sm">Like{likeCount !== 1 ? 's' : ''}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(report.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-50 text-slate-600 transition-colors duration-200"
                      >
                        <MessageCircleIcon />
                        <span className="font-medium">{commentCount}</span>
                        <span className="text-sm">Comment{commentCount !== 1 ? 's' : ''}</span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {(isCommentsExpanded || commentCount > 0) && (
                    <div className="border-t border-slate-100 bg-slate-50/50">
                      {/* Existing Comments */}
                      {commentCount > 0 && (
                        <div className="p-4 space-y-3 max-h-60 overflow-y-auto">
                          {report.comments?.map((comment, index) => (
                            <div key={index} className="flex gap-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {comment.user?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div className="flex-1 bg-white rounded-xl p-3 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-sm text-slate-800">
                                    {comment.user?.split('@')[0] || 'Anonymous'}
                                  </span>
                                  <span className="text-xs text-slate-500">
                                    {formatTimeAgo(comment.timestamp)}
                                  </span>
                                </div>
                                <p className="text-slate-700 text-sm">{comment.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Comment */}
                      <div className="p-4 border-t border-slate-100">
                        <div className="flex gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {currentUser?.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 flex gap-2">
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
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  handleCommentSubmit(report.id);
                                }
                              }}
                              className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                            />
                            <button
                              onClick={() => handleCommentSubmit(report.id)}
                              disabled={!commentText[report.id]?.trim()}
                              className="p-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-full transition-colors duration-200"
                            >
                              <SendIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Load More Button */}
        {filteredReports.length > 0 && (
          <div className="text-center pt-8">
            <button className="px-8 py-3 bg-white text-slate-600 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors duration-200 font-medium">
              Load More Reports
            </button>
          </div>
        )}
      </div>

      {/* Report Submission Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Submit New Report</h2>
              <button onClick={() => setShowReportModal(false)} className="text-slate-500 hover:text-slate-700">
                <XIcon />
              </button>
            </div>
            <form onSubmit={handleReportSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={newReportLocation}
                  onChange={(e) => setNewReportLocation(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Main Street Park"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                <textarea
                  value={newReportDescription}
                  onChange={(e) => setNewReportDescription(e.target.value)}
                  rows="4"
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Describe the issue in detail..."
                  required
                ></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Severity</label>
                <select
                  value={newReportSeverity}
                  onChange={(e) => setNewReportSeverity(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={newReportCategory}
                  onChange={(e) => setNewReportCategory(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="illegal_dumping">Illegal Dumping</option>
                  <option value="littering">Littering</option>
                  <option value="environmental">Environmental</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Media URL (Optional)</label>
                <input
                  type="text"
                  value={newReportMediaUrl}
                  onChange={(e) => setNewReportMediaUrl(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="URL to an image or video"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white p-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors disabled:bg-slate-400"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

