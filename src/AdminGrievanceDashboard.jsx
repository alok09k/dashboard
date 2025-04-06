import React, { useState, useEffect } from "react";
import { db } from "./firebaseConfig";
import { collection, query, orderBy, getDocs, doc, getDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";

const AdminGrievanceDashboard = () => {
  const [grievances, setGrievances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const grievancesQuery = query(
        collection(db, "grievances"),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(grievancesQuery);
      const grievanceList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
      setGrievances(grievanceList);
    } catch (error) {
      console.error("Error fetching grievances:", error);
      setError("Failed to load grievances. Please try again later.");
    } finally {
      setLoading(false);
    }
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

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleString();
  };

  const filteredGrievances = grievances.filter(grievance => {
    const matchesFilter = filter === "all" || grievance.status === filter;
    
    const matchesSearch = searchTerm === "" || 
      grievance.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (grievance.name && grievance.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (grievance.email && grievance.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (grievance.category && grievance.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (grievance.description && grievance.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h2>Admin Grievance Dashboard</h2>
        <button onClick={fetchGrievances} className="refresh-button">
          Refresh Data
        </button>
      </div>

      <div className="dashboard-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search grievances..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-container">
          <label htmlFor="filter">Filter by Status:</label>
          <select
            id="filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading grievances...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchGrievances} className="retry-button">
            Try Again
          </button>
        </div>
      ) : filteredGrievances.length === 0 ? (
        <div className="empty-state">
          <p>No grievances found.</p>
          {searchTerm || filter !== "all" ? (
            <button 
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
              }}
              className="clear-filters-button"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grievances-table-container">
          <table className="grievances-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGrievances.map((grievance) => (
                <tr key={grievance.id}>
                  <td>{grievance.id.substring(0, 8)}...</td>
                  <td>{grievance.name}</td>
                  <td>{grievance.category}</td>
                  <td>{formatDate(grievance.timestamp)}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(grievance.status)}`}>
                      {grievance.status}
                    </span>
                  </td>
                  <td>
                    <Link 
                      to={`/admin/grievance/${grievance.id}`} 
                      className="view-button"
                    >
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total</h3>
          <p>{grievances.length}</p>
        </div>
        <div className="summary-card pending">
          <h3>Pending</h3>
          <p>{grievances.filter(g => g.status === "Pending").length}</p>
        </div>
        <div className="summary-card in-progress">
          <h3>In Progress</h3>
          <p>{grievances.filter(g => g.status === "In Progress").length}</p>
        </div>
        <div className="summary-card resolved">
          <h3>Resolved</h3>
          <p>{grievances.filter(g => g.status === "Resolved").length}</p>
        </div>
        <div className="summary-card closed">
          <h3>Closed</h3>
          <p>{grievances.filter(g => g.status === "Closed").length}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminGrievanceDashboard;