import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'; // Import query, orderBy, limit, getDocs
import { db } from '../firebase'; // Assuming your firebase config is in a file named firebase.js in the src directory

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch top users from Firestore
  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        // Create a query to order by currentBalance descending and limit to a certain number (e.g., top 10)
        const q = query(usersCollection, orderBy('currentBalance', 'desc'), limit(10));
        const userSnapshot = await getDocs(q);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTopUsers(userList);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch leaderboard.");
        setLoading(false);
        console.error("Error fetching leaderboard: ", err);
      }
    };

    fetchTopUsers();
  }, []); // Empty dependency array means this effect runs once on mount

  const styles = `
    .leaderboard-container {
        padding: 20px;
        font-family: sans-serif;
        background-color: #f8f9fa; /* Light background */
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin-bottom: 20px; /* Space below the component */
    }

    .leaderboard-container h3 {
        color: #333;
        margin-bottom: 15px;
        text-align: center;
    }

    .leaderboard-container ol {
        list-style: none;
        padding: 0;
    }

    .leaderboard-container li {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px 15px;
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .leaderboard-container li span {
        font-weight: bold;
        color: #007bff;
    }

     .error-message {
      color: red;
      font-weight: bold;
    }
  `;

  return (
    <div className="leaderboard-container">
      <style>{styles}</style> {/* Inject the styles */}
      <h3>Leaderboard</h3>

      {loading && <p>Loading leaderboard...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <ol>
          {topUsers.length === 0 ? (
            <p>No users on the leaderboard yet.</p>
          ) : (
            topUsers.map((user, index) => (
              <li key={user.id}>
                <span>{index + 1}. {user.email || 'Anonymous'}</span> {/* Display rank and email/identifier */}
                <span>{user.currentBalance || 0} points</span> {/* Display points */}
              </li>
            ))
          )}
        </ol>
      )}
    </div>
  );
}
