import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft } from "lucide-react";

export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-6" data-testid="forbidden-page">
      <div className="bg-white border border-black/10 p-10 max-w-lg w-full nx-fade-up">
        <ShieldOff size={48} className="text-red-500 mb-4" />
        <div className="text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-2">Error 422 · Access Denied</div>
        <h1 className="font-display font-black tracking-tighter text-4xl mb-3">No permission.</h1>
        <p className="text-gray-700 mb-6 leading-relaxed">
          You don't have access to this section. If you believe this is wrong, please ask your admin to grant the required permission on your role.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-black/20 text-sm font-medium hover:border-black"
            data-testid="forbidden-back-btn"
          >
            <ArrowLeft size={14} /> Go back
          </button>
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-black/80"
            data-testid="forbidden-home-btn"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
