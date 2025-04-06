import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import GrievanceReplyComponent from "./GrievanceReplayComponent";
import "./AdminDashboard.css";
import "./AdminGrievanceDetailpage.css"

const AdminGrievanceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [grievance, setGrievance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  
  // Admin info - in a real app, this would come from authentication
  const adminName = "Admin User";
  const adminEmail = "admin@example.com";

  useEffect(() => {
    fetchGrievanceDetails();
  }, [id]);

  const fetchGrievanceDetails = async () => {
    setLoading(true);
    try {
      const grievanceRef = doc(db, "grievances", id);
      const grievanceSnap = await getDoc(grievanceRef);
      
      if (grievanceSnap.exists()) {
        const grievanceData = {
          id: grievanceSnap.id,
          ...grievanceSnap.data(),
          timestamp: grievanceSnap.data().timestamp?.toDate() || new Date(),
          lastUpdated: grievanceSnap.data().lastUpdated?.toDate() || null
        };
        
        setGrievance(grievanceData);
        setCurrentStatus(grievanceData.status);
      } else {
        setError("Grievance not found!");
      }
    } catch (error) {
      console.error("Error fetching grievance details:", error);
      setError("Failed to load grievance details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const grievanceRef = doc(db, "grievances", id);
      await updateDoc(grievanceRef, {
        status: newStatus,
        lastUpdated: serverTimestamp(),
        lastUpdatedBy: adminName
      });
      
      setCurrentStatus(newStatus);
      fetchGrievanceDetails(); // Refresh data
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleString();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "status-pending";
      case "In Progress": return "status-progress";
      case "Resolved": return "status-resolved";
      case "Closed": return "status-closed";
      case "Rejected": return "status-rejected";
      default: return "";
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading grievance details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={() => navigate("/admin/dashboard")} className="retry-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!grievance) {
    return (
      <div className="admin-dashboard-container">
        <div className="error-container">
          <p>Grievance not found</p>
          <button onClick={() => navigate("/admin/dashboard")} className="retry-button">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h2>Grievance Details</h2>
        <div>
          <button onClick={() => navigate("/admin/dashboard")} className="cancel-button">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="grievance-detail-card">
        <div className="grievance-header">
          <h3>Grievance #{grievance.id.substring(0, 8)}</h3>
          <div className="status-container">
            <label htmlFor="status-select">Status: </label>
            <select
              id="status-select"
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className={`status-select ${getStatusClass(currentStatus)}`}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="grievance-info-grid">
          <div className="info-item">
            <span className="info-label">Submitted By:</span>
            <span className="info-value">{grievance.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{grievance.email}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Phone:</span>
            <span className="info-value">{grievance.phone || "N/A"}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Category:</span>
            <span className="info-value">{grievance.category}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Submitted:</span>
            <span className="info-value">{formatDate(grievance.timestamp)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Last Updated:</span>
            <span className="info-value">{grievance.lastUpdated ? formatDate(grievance.lastUpdated) : "N/A"}</span>
          </div>
        </div>

        <div className="grievance-description">
          <h4>Description</h4>
          <div className="description-box">
            {grievance.description}
          </div>
        </div>

        {grievance.attachments && grievance.attachments.length > 0 && (
          <div className="grievance-attachments">
            <h4>Attachments</h4>
            <div className="attachments-list">
              {grievance.attachments.map((attachment, index) => (
                <a 
                  key={index} 
                  href={attachment.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="attachment-link"
                >
                  {attachment.name || `Attachment ${index + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}

        <GrievanceReplyComponent 
          grievanceId={grievance.id} 
          adminName={adminName}
          adminEmail={adminEmail}
          onStatusChange={(newStatus) => setCurrentStatus(newStatus)}
        />
      </div>
    </div>
  );
};

export default AdminGrievanceDetailPage;