import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminGrievanceDashboard from "./AdminGrievanceDashboard";
import AdminGrievanceDetailPage from "./AdminGrievanceDetailPage";
import GrievanceReplyComponent from "./GrievanceReplayComponent";
import Navbar from "./Navbar";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Redirect root to admin dashboard */}
            <Route path="/" element={<Navigate to="/admin/grievances" replace />} />
            
            {/* Admin Dashboard Route */}
            <Route path="/admin/grievances" element={<AdminGrievanceDashboard />} />
            
            {/* Admin Grievance Detail Route */}
            <Route path="/admin/grievance/:id" element={<AdminGrievanceDetailPage />} />
            
            {/* Fallback for any other routes */}
            <Route path="*" element={<Navigate to="/admin/grievances" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;