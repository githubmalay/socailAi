
import React from 'react';
import { Sparkles, Menu } from 'lucide-react';
import GeneratePost from './pages/GeneratePost';

const App: React.FC = () => {
  return (
    // Structure:
    // Mobile: min-h-screen (grows with content), standard scrolling.
    // Desktop: h-screen (fixed), flex-col, overflow-hidden (internal scrolling).
    <div className="w-full min-h-screen lg:h-screen font-['Plus_Jakarta_Sans'] flex flex-col text-slate-800 lg:overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Header */}
      <header className="flex-none relative z-50 px-4 py-3 lg:px-6 lg:py-4">
        <div className="max-w-[1800px] mx-auto">
            <div className="bg-white/40 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20 text-white ring-1 ring-white/20">
                  <Sparkles size={20} fill="currentColor" />
                </div>
                <div>
                  <h1 className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                    Social<span className="text-indigo-600">Studio</span>
                  </h1>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AI Creator</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/50 backdrop-blur-md rounded-full border border-white/40 shadow-sm">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                     <span className="text-xs font-semibold text-slate-600">Online</span>
                  </div>
              </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 px-4 pb-4 min-h-0 lg:overflow-hidden flex flex-col">
        <div className="w-full h-full max-w-[1800px] mx-auto">
            <GeneratePost />
        </div>
      </main>
      
    </div>
  );
};

export default App;
