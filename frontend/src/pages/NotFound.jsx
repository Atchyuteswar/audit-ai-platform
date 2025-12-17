import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft, FileSearch } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Main Content Card */}
      <div className="relative z-10 max-w-2xl w-full text-center">
        
        {/* Animated Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-2xl relative">
              <ShieldAlert className="w-16 h-16 text-blue-500" />
            </div>
            
            <div className="absolute -top-4 -right-6 bg-slate-800 p-2 rounded-lg border border-slate-700 transform rotate-12">
              <FileSearch className="w-6 h-6 text-slate-400" />
            </div>
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-600 tracking-tighter mb-4">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Access Denied / Page Not Found
        </h2>

        <p className="text-slate-400 text-lg mb-10 max-w-md mx-auto leading-relaxed">
          The resource you are trying to access has been moved, deleted, or does not exist within the AuditAI perimeter.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-slate-800 text-white font-medium border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <Link 
            to="/" 
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
          >
            <Home className="w-4 h-4" />
            Return to Dashboard
          </Link>
        </div>

        {/* Footer info */}
        <div className="mt-16 pt-8 border-t border-slate-800/50">
          <p className="text-slate-600 text-sm font-mono">
            Error Code: 404_NOT_FOUND • Ref ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>

      </div>
    </div>
  );
};

export default NotFound;