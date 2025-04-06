import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, addDoc, query, where, orderBy, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import "./AdminDashboard.css";

const GrievanceReplyComponent = ({ grievanceId, adminName, adminEmail, onStatusChange }) => {
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch existing replies when component loads
  useEffect(() => {
    fetchReplies();
  }, [grievanceId]);

  const fetchReplies = async () => {
    try {
      const repliesQuery = query(
        collection(db, "grievanceReplies"),
        where("grievanceId", "==", grievanceId),
        orderBy("timestamp", "asc")
      );
      
      const querySnapshot = await getDocs(repliesQuery);
      const repliesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
      setReplies(repliesList);
    } catch (error) {
      console.error("Error fetching replies:", error);
      setError("Failed to load previous replies.");
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    
    setLoading(true);
    try {
      // Add the reply to the grievanceReplies collection
      await addDoc(collection(db, "grievanceReplies"), {
        grievanceId,
        message: replyText,
        senderName: adminName,
        senderEmail: adminEmail,
        senderRole: "admin",
        timestamp: serverTimestamp()
      });
      
      // Update the grievance status to "In Progress" if it's currently "Pending"
      const grievanceRef = doc(db, "grievances", grievanceId);
      await updateDoc(grievanceRef, {
        status: "In Progress",
        lastUpdated: serverTimestamp(),
        lastReplyBy: adminName
      });
      
      // Notify parent component about status change
      if (onStatusChange) {
        onStatusChange("In Progress");
      }
      
      // Clear the reply text and refresh the replies list
      setReplyText("");
      await fetchReplies();
      
      // Close the modal
      setShowReplyModal(false);
    } catch (error) {
      console.error("Error sending reply:", error);
      setError("Failed to send reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleString();
  };

  return (
    <>
      <div className="reply-section">
        <button 
          onClick={() => setShowReplyModal(true)} 
          className="view-button"
          style={{ marginTop: "20px" }}
        >
          Reply to Grievance
        </button>
        
        {replies.length > 0 && (
          <div className="reply-history">
            <h3>Communication History</h3>
            {replies.map((reply) => (
              <div key={reply.id} className="reply-item">
                <div className="reply-header">
                  <span className="reply-sender">
                    {reply.senderRole === "admin" ? `${reply.senderName} (Admin)` : reply.senderName}
                  </span>
                  <span className="reply-date">{formatDate(reply.timestamp)}</span>
                </div>
                <div className="reply-content">{reply.message}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReplyModal && (
        <div className="reply-modal">
          <div className="reply-modal-content">
            <div className="reply-modal-header">
              <h3>Reply to Grievance</h3>
              <button 
                className="close-button" 
                onClick={() => setShowReplyModal(false)}
              >
                &times;
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="reply-form">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your response here..."
                disabled={loading}
              />
              
              <div className="reply-form-buttons">
                <button 
                  className="cancel-button" 
                  onClick={() => setShowReplyModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="send-button" 
                  onClick={handleSendReply}
                  disabled={loading || !replyText.trim()}
                >
                  {loading ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GrievanceReplyComponent;