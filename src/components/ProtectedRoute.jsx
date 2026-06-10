import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--nx-bg)]">
        <div className="font-mono text-xs tracking-widest uppercase text-gray-500">
          Authenticating<span className="animate-pulse">...</span>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;

  // Force password change when flagged
  if (user.must_change_password && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }
  return children;
}
