import React from "react";
import { Navigate } from "react-router-dom";
import { usePermission } from "@/lib/permissions";
import { useAuth } from "@/context/AuthContext";

/**
 * Block a route if the user does not have the required permission.
 * Renders /422 if denied.
 */
export default function RouteBlocker({ module, action, children }) {
  const { user, checking } = useAuth();
  const allowed = usePermission(module, action);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--nx-bg)]">
        <div className="font-mono text-xs tracking-widest uppercase text-gray-500">Authenticating...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed) return <Navigate to="/422" replace />;
  return children;
}
