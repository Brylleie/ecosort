import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore'; // Import getDoc
import { db } from '../firebase'; // Assuming your firebase config is in a file named firebase.js in the src directory

export default function AdminPointManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(userList);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users.");
        setLoading(false);
        console.error("Error fetching users: ", err);
      }
    };

    fetchUsers();
  }, []);

  // Function to handle point changes
  const handlePointChange = async (userId, amount, type) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef); // Get the latest user document

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const currentBalance = userData.currentBalance || 0;
        let newBalance = currentBalance;
        let transactionDescription = '';
        let transactionAmount = amount; // Amount for the transaction record

        if (type === 'add') {
          newBalance = currentBalance + amount;
          transactionDescription = `Points added by admin`;
        } else if (type === 'deduct') {
          // Prevent negative balance if deducting more points than the user has
          if (currentBalance < amount) {
            alert("Cannot deduct more points than the user has.");
            return;
          }
          newBalance = currentBalance - amount;
          transactionDescription = `Points deducted by admin`;
          transactionAmount = -amount; // Store deducted amount as negative
        } else {
          console.error("Invalid transaction type:", type);
          return;
        }

        // Update user's point balance
        await updateDoc(userRef, { currentBalance: newBalance });

        // Add transaction history entry
        const transactionsCollection = collection(userRef, 'transactions');
        await addDoc(transactionsCollection, {
          type: type === 'add' ? 'earned' : 'redeemed', // Use 'earned' for added, 'redeemed' for deducted by admin
          amount: transactionAmount,
          timestamp: new Date(),
          description: transactionDescription,
          // Optionally add admin user ID here
        });

        // Update the local state to reflect the change in the UI
        setUsers(users.map(user =>
          user.id === userId ? { ...user, currentBalance: newBalance } : user
        ));

        alert(`Points ${type === 'add' ? 'added to' : 'deducted from'} user ${userId} successfully.`);

      } else {
        console.error("User document not found for ID:", userId);
        alert("Error: User not found.");
      }

    } catch (error) {
      console.error("Error changing points: ", error);
      alert("Error changing points. Please try again.");
    }
  };


  const styles = `
    .admin-point-management-container {
        padding: 20px;
        font-family: sans-serif;
    }

    .admin-point-management-container h2 {
        color: #333;
        margin-bottom: 20px;
    }

    .admin-point-management-container table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
    }

    .admin-point-management-container th,
    .admin-point-management-container td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: left;
    }

    .admin-point-management-container th {
        background-color: #f2f2f2;
        color: #555;
    }

    .admin-point-management-container tr:nth-child(even) {
        background-color: #f9f9f9;
    }

    .admin-point-management-container tr:hover {
        background-color: #e9e9e9;
    }

    .admin-point-management-container .point-controls input {
        width: 60px;
        margin-right: 5px;
        padding: 5px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }

    .admin-point-management-container .point-controls button {
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-right: 5px;
    }

    .admin-point-management-container .point-controls .add-button {
        background-color: #5cb85c;
        color: white;
    }

    .admin-point-management-container .point-controls .deduct-button {
        background-color: #d9534f;
        color: white;
    }

     .admin-point-management-container .point-controls button:hover {
        opacity: 0.9;
    }

    .error-message {
      color: red;
      font-weight: bold;
    }
  `;

  return (
    <div className="admin-point-management-container">
      <style>{styles}</style> {/* Inject the styles */}
      <h2>Admin Point Management</h2>

      {loading && <p>Loading users...</p>}
      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <table>
          <thead>
            <tr>
              <th>User ID</th>
              <th>Email (or Identifier)</th> {/* Use email or another identifier */}
              <th>Current Points</th>
              <th>Manage Points</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email || 'N/A'}</td> {/* Display email or N/A */}
                <td>{user.currentBalance || 0}</td> {/* Display current points or 0 */}
                <td className="point-controls">
                  {/* Input for point amount */}
                  <input
                    type="number"
                    min="0"
                    defaultValue="0" // Set a default value
                    id={`points-${user.id}`} // Unique ID for each input
                  />
                  <button
                    className="add-button"
                    onClick={() => {
                      const amount = parseInt(document.getElementById(`points-${user.id}`).value);
                      if (!isNaN(amount) && amount > 0) {
                         handlePointChange(user.id, amount, 'add');
                      } else {
                         alert("Please enter a valid positive number of points.");
                      }
                    }}
                  >
                    Add
                  </button>
                   <button
                    className="deduct-button"
                     onClick={() => {
                      const amount = parseInt(document.getElementById(`points-${user.id}`).value);
                       if (!isNaN(amount) && amount > 0) {
                          handlePointChange(user.id, amount, 'deduct');
                       } else {
                         alert("Please enter a valid positive number of points.");
                       }
                    }}
                  >
                    Deduct
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
