import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, doc } from "firebase/firestore";
import { db } from '../firebase.js';
import { FaTrophy, FaDownload, FaGraduationCap } from 'react-icons/fa';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [isEventEnded, setIsEventEnded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const currentPlayer = localStorage.getItem('swudevs_player_name');

  useEffect(() => {
    const q = query(collection(db, "participants"), where("wpm", ">", 0), orderBy("wpm", "desc"), limit(10));
    const unsubLeaders = onSnapshot(q, (snapshot) => {
      let fetchedLeaders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      fetchedLeaders.sort((a, b) => b.wpm !== a.wpm ? b.wpm - a.wpm : b.accuracy - a.accuracy);
      setLeaders(fetchedLeaders);
    });

    const unsubEvent = onSnapshot(doc(db, "settings", "event"), (docSnap) => {
      if (docSnap.exists()) setIsEventEnded(docSnap.data().isEnded);
    });
    
    return () => { unsubLeaders(); unsubEvent(); };
  }, []);

  const currentPlayerIndex = leaders.findIndex(player => player.name === currentPlayer);
  const currentPlayerData = currentPlayerIndex !== -1 ? leaders[currentPlayerIndex] : null;
  const isCurrentUserTop3 = currentPlayerIndex !== -1 && currentPlayerIndex < 3;
  
  const showGoodLuckMessage = isEventEnded && currentPlayer && !isCurrentUserTop3;

  const generateCertificate = (name) => {
    setIsDownloading(true);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = '/certificate-template.png'; 
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      ctx.font = 'bold 80px Arial'; 
      ctx.fillStyle = '#1e293b'; 
      ctx.textAlign = 'center';
      ctx.fillText(name.toUpperCase(), canvas.width / 2, canvas.height / 2); 
      
      const link = document.createElement('a');
      link.download = `SWUdevs-Certificate-${name.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsDownloading(false);
    };
  };

  const getRankStyle = (index) => {
    if (index === 0) return "bg-gradient-to-br from-amber-200 to-yellow-400 border-yellow-300 text-yellow-900";
    if (index === 1) return "bg-gradient-to-br from-slate-100 to-slate-300 border-slate-200 text-slate-700";
    if (index === 2) return "bg-gradient-to-br from-orange-200 to-amber-600 border-orange-300 text-orange-950";
    return "bg-slate-100 border-slate-200 text-slate-500 font-black";
  };

  // Renders a single clean player row with precise spacing
  const renderPlayerCard = (player, index) => {
    if (!player) return null;
    return (
      <div key={player.id} className={`flex flex-col p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 ${index < 3 ? 'bg-red-50/60 border-red-100/80 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex items-center justify-between w-full gap-2">
          
          {/* Left: Rank badge & Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center rounded-xl border-2 font-black text-sm sm:text-base ${getRankStyle(index)}`}>
              {index < 3 ? <FaTrophy className="text-sm sm:text-base" /> : index + 1}
            </div>
            <span className={`text-sm sm:text-lg font-black tracking-wide truncate ${index === 0 ? 'text-amber-600' : index === 1 ? 'text-slate-600' : index === 2 ? 'text-orange-700' : 'text-slate-800'}`}>
              {player.name}
            </span>
          </div>

          {/* Right: Cleanly spaced Stats numbers */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            <div className="text-center min-w-[42px]">
              <p className="text-[9px] font-black tracking-wider text-slate-400 uppercase mb-0.5 leading-none">WPM</p>
              <p className={`text-lg sm:text-2xl font-black leading-none ${index < 3 ? 'text-red-600' : 'text-slate-800'}`}>{player.wpm}</p>
            </div>
            <div className="text-center min-w-[42px]">
              <p className="text-[9px] font-black tracking-wider text-slate-400 uppercase mb-0.5 leading-none">ACC</p>
              <p className="text-xs sm:text-base font-bold text-slate-500 leading-none">{player.accuracy}%</p>
            </div>
          </div>
        </div>

        {isEventEnded && index < 3 && player.name === currentPlayer && (
          <button 
            onClick={() => generateCertificate(player.name)}
            disabled={isDownloading}
            className="mt-3.5 w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-black text-xs tracking-widest uppercase rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <FaDownload /> {isDownloading ? "Generating..." : "Claim My Certificate"}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-xl p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
      
      {/* PERSONALIZED GOOD LUCK MESSAGE FOR NON-WINNERS */}
      {showGoodLuckMessage && (
        <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-xl">
          <div className="flex flex-col items-center text-center gap-2.5">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center mb-1">
              <FaGraduationCap className="text-2xl text-amber-400" />
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide">
              Great run, {currentPlayer}!
            </h2>
            <p className="text-xs sm:text-base text-slate-300 font-medium leading-relaxed max-w-sm">
              You crushed it in the Arena. The SWUdevs team wishes you the absolute best of luck as you start your 1st year of college. Keep chipping those keys!
            </p>
          </div>
        </div>
      )}

      {/* FIXED TITLE WRAPPING REGION */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 font-black text-slate-900 tracking-tight uppercase">
          <span className="text-lg sm:text-2xl shrink-0">⚡</span>
          <h1 className="text-lg sm:text-2xl md:text-3xl whitespace-nowrap">
            {isEventEnded && currentPlayerData ? "YOUR PLACEMENT" : "ARENA RANKINGS"}
          </h1>
          <span className="text-lg sm:text-2xl shrink-0">⚡</span>
        </div>
        {isEventEnded && isCurrentUserTop3 && (
          <p className="text-red-600 font-black text-xs sm:text-sm uppercase tracking-widest mt-1.5 animate-bounce">🏆 Top 3 Finisher! 🏆</p>
        )}
      </div>

      {/* CORE CONTENTS */}
      {isEventEnded ? (
        currentPlayerData ? (
          <div className="flex flex-col gap-3">
            {renderPlayerCard(currentPlayerData, currentPlayerIndex)}
          </div>
        ) : null
      ) : (
        <div>
          {leaders.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-400 font-bold animate-pulse text-sm sm:text-base tracking-wider">WAITING FOR THE FIRST CHALLENGER...</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {leaders.map((player, index) => renderPlayerCard(player, index))}
            </div>
          )}
        </div>
      )}
      
    </div>
  );
}