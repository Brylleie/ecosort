import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase'; // Assuming your firebase config is in a file named firebase.js in the src directory

export default function AdminRewardManagement() {
  const [rewards, setRewards] = useState([]);
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    pointCost: 0,
    stockQuantity: 0,
    imageUrl: '', // We'll add this later when you have image URLs
  });
  const [editingReward, setEditingReward] = useState(null); // State to hold the reward being edited

  // Fetch rewards from Firestore
  useEffect(() => {
    const fetchRewards = async () => {
      const rewardsCollection = collection(db, 'rewards');
      const rewardSnapshot = await getDocs(rewardsCollection);
      const rewardList = rewardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRewards(rewardList);
    };

    fetchRewards();
  }, []);

  // Handle form input changes for adding and editing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingReward) {
      setEditingReward({ ...editingReward, [name]: value });
    } else {
      setNewReward({ ...newReward, [name]: value });
    }
  };

  // Handle adding a new reward
  const handleAddReward = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'rewards'), newReward);
      // Clear the form and refetch rewards
      setNewReward({
        name: '',
        description: '',
        pointCost: 0,
        stockQuantity: 0,
        imageUrl: '',
      });
      fetchRewards(); // Refetch to update the list
    } catch (error) {
      console.error("Error adding reward: ", error);
      // Handle error
    }
  };

  // Handle editing a reward
  const handleEditReward = (reward) => {
    setEditingReward(reward);
  };

  // Handle canceling edit
  const handleCancelEdit = () => {
    setEditingReward(null);
  };

  // Handle updating a reward
  const handleUpdateReward = async (e) => {
    e.preventDefault();
    if (!editingReward) return;

    try {
      const rewardRef = doc(db, 'rewards', editingReward.id);
      await updateDoc(rewardRef, {
        name: editingReward.name,
        description: editingReward.description,
        pointCost: parseInt(editingReward.pointCost), // Ensure pointCost is a number
        stockQuantity: parseInt(editingReward.stockQuantity), // Ensure stockQuantity is a number
        imageUrl: editingReward.imageUrl,
      });
      setEditingReward(null); // Exit edit mode
      fetchRewards(); // Refetch to update the list
    } catch (error) {
      console.error("Error updating reward: ", error);
      // Handle error
    }
  };

  // Handle deleting a reward
  const handleDeleteReward = async (rewardId) => {
    try {
      const rewardRef = doc(db, 'rewards', rewardId);
      await deleteDoc(rewardRef);
      fetchRewards(); // Refetch to update the list
    } catch (error) {
      console.error("Error deleting reward: ", error);
      // Handle error
    }
  };

  // Helper function to fetch rewards (to avoid code duplication)
  const fetchRewards = async () => {
    const rewardsCollection = collection(db, 'rewards');
    const rewardSnapshot = await getDocs(rewardsCollection);
    const rewardList = rewardSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRewards(rewardList);
  };

  const styles = `
    /* Basic styling for the container */
    .admin-reward-management-container {
        padding: 20px;
        font-family: sans-serif;
    }

    /* Styling for headings */
    .admin-reward-management-container h2,
    .admin-reward-management-container h3 {
        color: #333;
        margin-bottom: 15px;
    }

    /* Styling for forms */
    .admin-reward-management-container form {
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .admin-reward-management-container form div {
        margin-bottom: 15px;
    }

    .admin-reward-management-container form label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        color: #555;
    }

    .admin-reward-management-container form input[type="text"],
    .admin-reward-management-container form input[type="number"],
    .admin-reward-management-container form textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-sizing: border-box;
    }

    .admin-reward-management-container form button {
        background-color: #5cb85c;
        color: white;
        padding: 10px 15px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        margin-right: 10px;
    }

    .admin-reward-management-container form button[type="button"] {
        background-color: #d9534f;
    }

    .admin-reward-management-container form button:hover {
        opacity: 0.9;
    }

    /* Styling for the rewards list */
    .admin-reward-management-container ul {
        list-style: none;
        padding: 0;
    }

    .admin-reward-management-container li {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .admin-reward-management-container li h4 {
        margin-top: 0;
        margin-bottom: 5px;
        color: #007bff;
    }

    .admin-reward-management-container li p {
        margin-bottom: 5px;
        color: #666;
    }

    .admin-reward-management-container li button {
        margin-right: 10px;
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }

    .admin-reward-management-container li button:first-of-type {
        background-color: #ffc107;
        color: #333;
    }

    .admin-reward-management-container li button:last-of-type {
        background-color: #dc3545;
        color: white;
    }

    .admin-reward-management-container li button:hover {
        opacity: 0.9;
    }
  `;

  return (
    <div className="admin-reward-management-container">
      <style>{styles}</style> {/* Inject the styles */}
      <h2>Admin Reward Management</h2>

      {/* Form to add new reward */}
      {!editingReward && (
        <>
          <h3>Add New Reward</h3>
          <form onSubmit={handleAddReward}>
            <div>
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" value={newReward.name} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="description">Description:</label>
              <textarea id="description" name="description" value={newReward.description} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="pointCost">Point Cost:</label>
              <input type="number" id="pointCost" name="pointCost" value={newReward.pointCost} onChange={handleInputChange} required min="0" />
            </div>
            <div>
              <label htmlFor="stockQuantity">Stock Quantity:</label>
              <input type="number" id="stockQuantity" name="stockQuantity" value={newReward.stockQuantity} onChange={handleInputChange} required min="0" />
            </div>
            {/* Add input for image URL later */}
            <button type="submit">Add Reward</button>
          </form>
        </>
      )}

      {/* Form to edit reward */}
      {editingReward && (
        <>
          <h3>Edit Reward</h3>
          <form onSubmit={handleUpdateReward}>
             <div>
              <label htmlFor="name">Name:</label>
              <input type="text" id="name" name="name" value={editingReward.name} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="description">Description:</label>
              <textarea id="description" name="description" value={editingReward.description} onChange={handleInputChange} required />
            </div>
            <div>
              <label htmlFor="pointCost">Point Cost:</label>
              <input type="number" id="pointCost" name="pointCost" value={editingReward.pointCost} onChange={handleInputChange} required min="0" />
            </div>
            <div>
              <label htmlFor="stockQuantity">Stock Quantity:</label>
              <input type="number" id="stockQuantity" name="stockQuantity" value={editingReward.stockQuantity} onChange={handleInputChange} required min="0" />
            </div>
            {/* Add input for image URL later */}
            <button type="submit">Update Reward</button>
            <button type="button" onClick={handleCancelEdit}>Cancel</button>
          </form>
        </>
      )}


      {/* Display existing rewards */}
      <h3>Existing Rewards</h3>
      <ul>
        {rewards.map(reward => (
          <li key={reward.id}>
            <h4>{reward.name}</h4>
            <p>{reward.description}</p>
            <p>Cost: {reward.pointCost} points</p>
            <p>Stock: {reward.stockQuantity}</p>
            {/* Display image later */}
            <button onClick={() => handleEditReward(reward)}>Edit</button>
            <button onClick={() => handleDeleteReward(reward.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
