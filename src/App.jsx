import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import UserRegistration from './pages/UserRegistration';
import Leaderboard from './pages/Leaderboard';
import AdminPanel from './pages/AdminPanel'; // <-- 1. Import your Admin Panel

export default function App() {
  return (
    // Moved <Router> to the top level so links can be used anywhere in the layout
    <Router>
      <div className="relative min-h-screen bg-[#f1f5f9] text-slate-800 font-sans flex flex-col justify-between p-4 sm:p-8 overflow-hidden selection:bg-red-600 selection:text-white">
        
        {/* LAYER 1: DRIFTING LIQUID BLOBS */}
        <div className="absolute top-[-15%] left-[-10%] w-[65vw] h-[65vw] bg-red-500/10 rounded-full blur-[120px] pointer-events-none animate-float-1"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-rose-400/15 rounded-full blur-[120px] pointer-events-none animate-float-2"></div>
        <div className="absolute top-[30%] right-[10%] w-[40vw] h-[40vw] bg-amber-400/10 rounded-full blur-[100px] pointer-events-none animate-float-1"></div>

        {/* LAYER 2: GEN-Z INFINITE MARQUEE TICKER */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04] select-none overflow-hidden z-0">
          <div className="whitespace-nowrap flex text-[12vw] font-black uppercase tracking-tighter animate-marquee">
            <span>
              SWUDEVS • GRAND FRESHMEN MEETUP • SPEED TYPING ARENA • CHIP THE KEYS •&nbsp;
            </span>
            <span>
              SWUDEVS • GRAND FRESHMEN MEETUP • SPEED TYPING ARENA • CHIP THE KEYS •&nbsp;
            </span>
          </div>
        </div>

        {/* LAYER 3: INTERACTIVE APPS & LOGOS */}
        
        {/* TOP: Grand Freshmen Logo */}
        <header className="relative z-10 flex justify-center items-center py-4 sm:py-6">
          <img 
            src="/grand-freshmen-logo.png" 
            alt="Grand Freshmen Meetup" 
            className="h-28 sm:h-44 md:h-52 object-contain drop-shadow-[0_20px_35px_rgba(185,28,28,0.12)] transform hover:scale-105 transition-transform duration-300" 
          />
        </header>

        {/* MIDDLE: Content Area */}
        <main className="relative z-10 flex-grow flex items-center justify-center max-w-5xl mx-auto w-full py-4 px-2">
          <Routes>
            <Route path="/" element={<UserRegistration />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            {/* <-- 2. Added secure Admin Route */}
            <Route path="/admin-booth-secret" element={<AdminPanel />} /> 
          </Routes>
        </main>

        {/* BOTTOM: Aligned Tech Footer */}
        <footer className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4 py-8 text-center">
          <span className="text-sm font-black tracking-[0.3em] text-slate-500 uppercase mt-1">
            Courtesy of
          </span>
          
          {/* <-- 3. SECRET EASTER EGG GATEWAY --> */}
          {/* We use cursor-default so the mouse doesn't change to a pointer, keeping it completely hidden from users! */}
          <Link to="/admin-booth-secret" className="cursor-default block">
            <div className="px-6 py-3 bg-white/70 backdrop-blur-md rounded-2xl border border-white shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:bg-white hover:scale-105 transition-all duration-300 flex items-center justify-center">
              <img 
                src="/swudevs-logo.png" 
                alt="SWUdevs" 
                className="h-12 sm:h-16 md:h-20 object-contain drop-shadow-sm" 
              />
            </div>
          </Link>
        </footer>

      </div>
    </Router>
  );
}