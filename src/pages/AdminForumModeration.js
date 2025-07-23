import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage'; // Import deleteObject
import { db, storage } from '../firebase';
// import { useAuth } from '../contexts/AuthContext'; // Assuming you have an AuthContext to get the current user

export default function AdminForumModeration() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assuming you have a way to get the current authenticated user and check if they are an admin
  // const { currentUser, isAdmin } = useAuth(); // Assuming isAdmin is available from AuthContext

  // Fetch all forum posts from Firestore
  useEffect(() => {
    const postsCollection = collection(db, 'posts');
    const q = query(postsCollection, orderBy('createdAt', 'desc'));

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsList);
      setLoading(false);
    }, (err) => {
      setError("Failed to fetch posts for moderation.");
      setLoading(false);
      console.error("Error fetching posts for moderation: ", err);
    });

    // Clean up the listener
    return () => unsubscribe();

  }, []);

  // Handle deleting a post as admin
  const handleDeletePostAsAdmin = async (postId, mediaFileName) => {
    // Add a check here if the current user is actually an admin
    // if (!isAdmin) {
    //     alert("You do not have permission to moderate the forum.");
    //     return;
    // }

    // Optional: Add a confirmation dialog
    if (!window.confirm("Are you sure you want to delete this post? (Admin Action)")) {
        return;
    }

    try {
      const postRef = doc(db, 'posts', postId);

      // Delete associated media from Storage
      if (mediaFileName) {
        const storageRef = ref(storage, `forum_media/${mediaFileName}`);
        await deleteObject(storageRef).catch((error) => {
           console.warn("Could not delete media file:", error);
        });
      }

      // Delete the post document
      await deleteDoc(postRef);

      // The onSnapshot listener will automatically update the posts list in the UI

    } catch (err) {
      console.error("Error deleting post as admin: ", err);
      alert("Failed to delete post as admin.");
    }
  };

  const styles = `
    .admin-forum-moderation-container {
        padding: 20px;
        font-family: sans-serif;
    }

    .admin-forum-moderation-container h2 {
        color: #333;
        margin-bottom: 20px;
    }

     .admin-forum-moderation-container .posts-list {
        list-style: none;
        padding: 0;
    }

    .admin-forum-moderation-container .post-item {
        background-color: #fff;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    .admin-forum-moderation-container .post-item h4 {
        margin-top: 0;
        margin-bottom: 5px;
        color: #007bff;
    }

     .admin-forum-moderation-container .post-item p {
        margin-bottom: 10px;
        color: #666;
     }

      .admin-forum-moderation-container .post-item .post-meta {
        font-size: 0.9em;
        color: #888;
        margin-bottom: 10px;
      }

       .admin-forum-moderation-container .post-item .post-actions {
         margin-top: 10px;
         text-align: right;
       }

       .admin-forum-moderation-container .post-item .post-actions button {
          background-color: #dc3545; /* Red for delete */
          color: white;
          padding: 5px 10px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-left: 10px;
       }

        .admin-forum-moderation-container .post-item .post-actions button:hover {
          opacity: 0.9;
        }

       .admin-forum-moderation-container .post-item .post-media img,
       .admin-forum-moderation-container .post-item .post-media video {
         max-width: 100%;
         height: auto;
         margin-top: 10px;
         border-radius: 4px;
       }


     .error-message {
      color: red;
      font-weight: bold;
    }
  `;


  return (
    <div className="admin-forum-moderation-container">
       <style>{styles}</style>
      <h2>Admin Forum Moderation</h2>

      {/* Add a check here to only render for admins */}
      {/* {!isAdmin && <p>You do not have permission to view this page.</p>} */}
      {/* {isAdmin && ( */}
        <>
          {loading && <p>Loading posts...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && (
            <ul className="posts-list">
              {posts.length === 0 ? (
                <p>No posts in the forum yet.</p>
              ) : (
                posts.map(post => (
                  <li key={post.id} className="post-item">
                    <h4>{post.title}</h4>
                    <p className="post-meta">Posted by {post.authorEmail || 'Anonymous'} on {post.createdAt?.toDate().toLocaleString() || 'N/A'}</p>
                    <p>{post.content}</p>
                     {post.mediaUrl && (
                       <div className="post-media">
                         {post.mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? (
                            <video controls src={post.mediaUrl}>
                               Your browser does not support the video tag.
                            </video>
                         ) : (
                            <img src={post.mediaUrl} alt="Post media" />
                         )}
                       </div>
                     )}

                    {/* Admin Post Actions (Delete) */}
                    <div className="post-actions">
                        <button onClick={() => handleDeletePostAsAdmin(post.id, post.mediaFileName)}>Delete Post (Admin)</button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </>
      {/* )} */}
    </div>
  );
}
