import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RouteBlocker from "@/components/RouteBlocker";

import Landing from "@/pages/Landing";
import Apply from "@/pages/Apply";
import Login from "@/pages/Login";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import ChangePassword from "@/pages/ChangePassword";
import Forbidden from "@/pages/Forbidden";

import Dashboard from "@/pages/Dashboard";
import Candidates from "@/pages/Candidates";
import CandidateDetail from "@/pages/CandidateDetail";
import Employees from "@/pages/Employees";
import Settings from "@/pages/Settings";
import Users from "@/pages/Users";
import Roles from "@/pages/Roles";
import Invites from "@/pages/Invites";
import Categories from "@/pages/Categories";
import TechStacks from "@/pages/TechStacks";

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/apply/:token" element={<Apply />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
            <Route path="/422" element={<Forbidden />} />

            <Route path="/admin/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="/admin/candidates" element={
              <ProtectedRoute><RouteBlocker module="candidates" action="read"><Candidates /></RouteBlocker></ProtectedRoute>
            } />
            <Route path="/admin/candidates/:id" element={
              <ProtectedRoute><RouteBlocker module="candidates" action="read"><CandidateDetail /></RouteBlocker></ProtectedRoute>
            } />
            <Route path="/admin/employees" element={
              <ProtectedRoute><RouteBlocker module="employees" action="read"><Employees /></RouteBlocker></ProtectedRoute>
            } />

            <Route path="/admin/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin/settings/users" element={
              <ProtectedRoute><RouteBlocker module="users" action="read"><Users /></RouteBlocker></ProtectedRoute>
            } />
            <Route path="/admin/settings/roles" element={
              <ProtectedRoute><RouteBlocker module="roles" action="read"><Roles /></RouteBlocker></ProtectedRoute>
            } />
            <Route path="/admin/settings/invites" element={
              <ProtectedRoute><RouteBlocker module="invites" action="read"><Invites /></RouteBlocker></ProtectedRoute>
            } />
            <Route path="/admin/settings/categories" element={
              <ProtectedRoute><RouteBlocker module="categories" action="read"><Categories /></RouteBlocker></ProtectedRoute>
            } />
            <Route path="/admin/settings/tech-stacks" element={
              <ProtectedRoute><RouteBlocker module="tech_stacks" action="read"><TechStacks /></RouteBlocker></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right"
                 toastOptions={{
                   style: { borderRadius: 0, border: "1px solid rgba(0,0,0,0.1)",
                            fontFamily: "'Plus Jakarta Sans', sans-serif" },
                 }} />
      </AuthProvider>
    </div>
  );
}

export default App;
