import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, runTransaction, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from "react-router-dom";
// import { useNavigate } from 'react-router-dom';
// Custom icon components to replace lucide-react

const ArrowLeft = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const Gift = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75L12 21m0 0c1.472 0 2.882.265 4.185.75L12 21m-7.5-9h15m-15 0l1.5 1.5m13.5-1.5l-1.5 1.5m-7.5 3v3h3v-3m0 0h3" />
  </svg>
);

const Star = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const ShoppingBag = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
  </svg>
);

const AlertCircle = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const CheckCircle2 = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const Coins = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [redeemedReward, setRedeemedReward] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  // const navigate = useNavigate();

  const categories = [
    { id: 'all', name: 'All Rewards', icon: Gift },
    { id: 'food', name: 'Food & Groceries', icon: ShoppingBag },
    { id: 'education', name: 'Education', icon: Star },
    { id: 'hygiene', name: 'Personal Care', icon: CheckCircle2 }
  ];

  useEffect(() => {
    const fetchData = async () => {
      const rewardsRef = collection(db, 'rewards');

      const dummyRewards = [
        {
          name: "Premium Rice 5kg",
          description: "High-quality local rice perfect for family meals",
          pointCost: 100,
          stockQuantity: 10,
          category: 'food',
          imageUrl: "https://images.unsplash.com/photo-1606990191101-7c6e2c6e2449",
          popular: true
        },
        {
          name: "Student Notebook Pack",
          description: "5 premium notebooks with lined pages for school use",
          pointCost: 70,
          stockQuantity: 15,
          category: 'education',
          imageUrl: "https://images.unsplash.com/photo-1588776814546-5b7d6cc30989",
          popular: false
        },
        {
          name: "Complete Oral Care Kit",
          description: "Toothbrush, toothpaste, and mouthwash for complete oral hygiene",
          pointCost: 50,
          stockQuantity: 20,
          category: 'hygiene',
          imageUrl: "https://images.unsplash.com/photo-1588774069273-07e602c2d56e",
          popular: false
        },
        {
          name: "Family Grocery Bundle",
          description: "Essential groceries including noodles, canned goods, and rice",
          pointCost: 120,
          stockQuantity: 8,
          category: 'food',
          imageUrl: "https://images.unsplash.com/photo-1602762485614-f3d71a30f059",
          popular: true
        }
      ];

      try {
        const rewardsSnapshot = await getDocs(rewardsRef);

        if (rewardsSnapshot.empty) {
          for (let reward of dummyRewards) {
            await addDoc(rewardsRef, reward);
          }
        }

        const updatedSnapshot = await getDocs(rewardsRef);
        setRewards(updatedSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        if (currentUser) {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          setUserPoints(userDoc.exists() ? userDoc.data().currentBalance || 0 : 0);
        }

      } catch (err) {
        console.error("Error loading rewards:", err);
      }

      setLoading(false);
    };

    fetchData();
  }, [currentUser]);

  const handleRedeemReward = async (reward) => {
    if (!currentUser) return alert('Please log in to redeem rewards.');
    if (userPoints < reward.pointCost) return alert('Not enough points.');
    if (reward.stockQuantity <= 0) return alert('Reward out of stock.');

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', currentUser.uid);
        const rewardRef = doc(db, 'rewards', reward.id);

        const userDoc = await transaction.get(userRef);
        const rewardDoc = await transaction.get(rewardRef);

        if (!userDoc.exists() || !rewardDoc.exists()) throw new Error('Data missing');

        const newPoints = (userDoc.data().currentBalance || 0) - reward.pointCost;
        const newStock = (rewardDoc.data().stockQuantity || 0) - 1;

        transaction.update(userRef, { currentBalance: newPoints });
        transaction.update(rewardRef, { stockQuantity: newStock });
      });

      setUserPoints(prev => prev - reward.pointCost);
      setRewards(prev => prev.map(r => r.id === reward.id ? { ...r, stockQuantity: r.stockQuantity - 1 } : r));
      setRedeemedReward(reward);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Redemption failed:', err);
      alert('Redemption failed, please try again.');
    }
  };

  const filteredRewards = selectedCategory === 'all' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory);

  const canRedeem = (reward) => {
    return currentUser && userPoints >= reward.pointCost && reward.stockQuantity > 0;
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' };
    if (quantity <= 5) return { text: 'Low Stock', color: 'text-orange-600 bg-orange-50' };
    return { text: 'In Stock', color: 'text-green-600 bg-green-50' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p className="text-purple-700 font-medium">Loading amazing rewards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/dashboard")} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Dashboard</span>
            </button>
            
            {currentUser && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg">
                <Coins className="w-5 h-5" />
                <span className="font-bold text-lg">{userPoints.toLocaleString()}</span>
                <span className="text-amber-100 text-sm font-medium">points</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 bg-white/60 backdrop-blur-sm px-6 py-3 rounded-full mb-4">
            <Gift className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Reward Store
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Exchange your earned points for amazing rewards and make a positive impact in your community
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full transition-all duration-200 font-medium ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'bg-white/80 text-gray-700 hover:bg-white hover:shadow-md hover:scale-105'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Rewards Grid */}
        {filteredRewards.length === 0 ? (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No rewards available</h3>
            <p className="text-gray-500">Check back later for new rewards!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRewards.map(reward => {
              const stockStatus = getStockStatus(reward.stockQuantity);
              const affordable = canRedeem(reward);
              
              return (
                <div key={reward.id} className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2">
                  {/* Popular Badge */}
                  {reward.popular && (
                    <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Popular
                    </div>
                  )}

                  {/* Stock Status Badge */}
                  <div className={`absolute top-4 right-4 z-10 px-3 py-1 rounded-full text-xs font-semibold ${stockStatus.color}`}>
                    {stockStatus.text}
                  </div>

                  {/* Image */}
                  <div className="relative overflow-hidden h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                    {reward.imageUrl ? (
                      <img
                        src={reward.imageUrl}
                        alt={reward.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Gift className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                      {reward.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {reward.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-4 h-4 text-amber-500" />
                        <span className="font-bold text-lg text-gray-800">{reward.pointCost}</span>
                        <span className="text-sm text-gray-500">points</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Stock: <span className="font-medium">{reward.stockQuantity}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {!currentUser ? (
                      <button
                        onClick={() => console.log('Navigate to login')}
                        className="w-full py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-semibold transition-all duration-200 hover:from-gray-500 hover:to-gray-600"
                      >
                        Login to Redeem
                      </button>
                    ) : affordable ? (
                      <button
                        onClick={() => handleRedeemReward(reward)}
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold transition-all duration-200 hover:from-green-600 hover:to-emerald-700 hover:shadow-lg transform hover:scale-105"
                      >
                        Redeem Now
                      </button>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                      >
                        {userPoints < reward.pointCost ? 'Insufficient Points' : 'Out of Stock'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Success Modal */}
      {showSuccessModal && redeemedReward && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full transform scale-100 animate-pulse">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
              <p className="text-gray-600 mb-6">
                You've successfully redeemed <span className="font-semibold text-purple-600">{redeemedReward.name}</span>
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}