
import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Facebook, History, ArrowRight, Star, Heart, TrendingUp, Zap } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-[#0F172A] shadow-2xl shadow-indigo-200/50 group">
        {/* Animated Background Elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-[30rem] h-[30rem] bg-indigo-500/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-[25rem] h-[25rem] bg-pink-500/20 rounded-full blur-[80px] animate-pulse delay-700"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
        
        <div className="relative z-10 p-10 md:p-20 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-pink-200 text-xs font-bold uppercase tracking-widest mb-8 shadow-inner">
                    <Star size={14} className="fill-pink-200 animate-spin-slow" /> AI-Powered Growth for SHGs
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
                Showcase Your <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-indigo-300">Handmade Products</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-lg leading-relaxed font-light">
                Empowering artisans and self-help groups to create stunning social media posts, find product alternatives, and grow their business with one click.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <Link 
                        to="/generate" 
                        className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] flex items-center gap-3 group/btn hover:-translate-y-1"
                    >
                        <Zap size={20} className="fill-slate-900" /> Create New Post
                    </Link>
                    <Link 
                        to="/history" 
                        className="px-8 py-4 rounded-2xl font-bold text-white border border-white/20 hover:bg-white/10 transition-all flex items-center gap-3 backdrop-blur-sm hover:border-white/40"
                    >
                        View Gallery <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
            
            {/* Decorative Image/Icon Area */}
            <div className="hidden md:block relative perspective-1000">
                <div className="w-72 h-72 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-[3rem] rotate-6 shadow-2xl flex items-center justify-center transform group-hover:rotate-3 transition-transform duration-700 ease-out border border-white/20 relative z-10">
                    <Heart size={100} className="text-white fill-white/20 drop-shadow-lg" />
                    
                    {/* Floating elements */}
                    <div className="absolute top-6 right-6 w-12 h-12 bg-white/20 rounded-full backdrop-blur-md border border-white/30"></div>
                    <div className="absolute bottom-10 left-10 w-8 h-8 bg-indigo-900/20 rounded-full backdrop-blur-md"></div>
                </div>
                
                {/* Stats Card */}
                <div className="absolute -bottom-10 -left-12 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] flex items-center gap-4 animate-bounce-slow z-20 border border-white/50">
                    <div className="bg-green-100 p-3 rounded-2xl text-green-600 shadow-inner">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Engagement</p>
                        <p className="text-2xl font-black text-slate-800">+125%</p>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="group bg-white p-10 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-white/50 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors relative z-10 shadow-sm">
            <Sparkles size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">Instant Branding</h3>
          <p className="text-slate-500 mb-8 leading-relaxed relative z-10">
            AI instantly generates a catchy name, alternatives, and captions.
          </p>
          <Link to="/generate" className="inline-flex items-center gap-2 text-indigo-600 font-bold group-hover:gap-4 transition-all relative z-10">
            Try Generator <ArrowRight size={18} />
          </Link>
        </div>

        <div className="group bg-white p-10 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-white/50 hover:shadow-xl hover:shadow-blue-100/50 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-colors relative z-10 shadow-sm">
            <Facebook size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">Direct Reach</h3>
          <p className="text-slate-500 mb-8 leading-relaxed relative z-10">
             Connect your Facebook Page and publish your products to the world.
          </p>
          <Link to="/upload" className="inline-flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all relative z-10">
            Connect Page <ArrowRight size={18} />
          </Link>
        </div>

        <div className="group bg-white p-10 rounded-[2.5rem] shadow-lg shadow-slate-200/50 border border-white/50 hover:shadow-xl hover:shadow-emerald-100/50 hover:-translate-y-2 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[100px] -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500"></div>
          <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-colors relative z-10 shadow-sm">
            <History size={32} />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4 relative z-10">Product Library</h3>
          <p className="text-slate-500 mb-8 leading-relaxed relative z-10">
             Keep a history of all your generated posts.
          </p>
          <Link to="/history" className="inline-flex items-center gap-2 text-emerald-600 font-bold group-hover:gap-4 transition-all relative z-10">
            View Library <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
