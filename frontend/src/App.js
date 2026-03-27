import React, { useRef } from 'react';
import MovieManager from './components/MovieManager';
import HeroCarousel from './components/HeroCarousel';
import './App.css';

function App() {
  const movieManagerRef = useRef(null);

  return (
    <div className="min-h-screen relative selection:bg-yellow-500/30">
      {/* Motion Background */}
      <div className="motion-bg-container">
        <div className="mesh-gradient" />
        <div className="floating-node w-64 h-64 top-1/4 -left-32" />
        <div className="floating-node w-96 h-96 -bottom-48 -right-48" style={{ animationDelay: '-10s' }} />
        <div className="floating-node w-48 h-48 top-3/4 left-1/2" style={{ animationDuration: '40s' }} />
      </div>

      {/* Header */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-white/5 sticky top-0 z-[100] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div 
              className="flex items-center gap-4 group cursor-pointer"
              onClick={() => movieManagerRef.current?.viewCollections()}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎬</span>
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-yellow-200 to-yellow-600 bg-clip-text text-transparent tracking-tighter">
                  CineHub
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] text-yellow-500/50 font-bold">Premium Movie Archive</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
              <span 
                onClick={() => movieManagerRef.current?.viewTrending()}
                className="hover:text-yellow-400 cursor-pointer transition-colors"
              >
                Trending
              </span>
              <span 
                onClick={() => movieManagerRef.current?.viewCollections()}
                className="hover:text-yellow-400 cursor-pointer transition-colors"
              >
                Collections
              </span>
              <span 
                onClick={() => movieManagerRef.current?.showAbout()}
                className="hover:text-yellow-400 cursor-pointer transition-colors"
              >
                About
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <HeroCarousel />
        <MovieManager ref={movieManagerRef} />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-bold text-white">CineHub</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 CineHub. All cinematic rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

