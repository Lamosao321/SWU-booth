import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot, where, doc } from "firebase/firestore";
import { db } from '../firebase.js';
import { FaTrophy, FaDownload, FaGraduationCap } from 'react-icons/fa';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const [isEventEnded, setIsEventEnded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Get the current player's name from their device
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

  // Determine user status
  const isCurrentUserTop3 = leaders.slice(0, 3).some(player => player.name === currentPlayer);
  const showGoodLuckMessage = isEventEnded && currentPlayer && !isCurrentUserTop3 && leaders.length > 0;

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
    if (index === 0) return "bg-gradient-to-br from-amber-200 to-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)] border-yellow-300 text-yellow-900";
    if (index === 1) return "bg-gradient-to-br from-slate-100 to-slate-300 shadow-[0_0_15px_rgba(148,163,184,0.4)] border-slate-200 text-slate-700";
    if (index === 2) return "bg-gradient-to-br from-orange-200 to-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.4)] border-orange-300 text-orange-950";
    return "bg-slate-100 border-slate-200 text-slate-500 font-black";
  };

  return (
    <div className="w-full max-w-2xl p-6 sm:p-8 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
      
      {/* PERSONALIZED GOOD LUCK MESSAGE FOR NON-WINNERS */}
      {showGoodLuckMessage && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-xl transform transition-all animate-[float-slow_5s_ease-in-out_infinite]">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-2">
              <FaGraduationCap className="text-3xl text-amber-400 drop-shadow-md" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Great run, {currentPlayer}!
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-sm">
              You crushed it in the Arena. The SWUdevs team wishes you the absolute best of luck as you start your 1st year of college. Keep chipping those keys!
            </p>
          </div>
        </div>
      )}

      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">⚡ ARENA RANKINGS ⚡</h1>
        {isEventEnded && !showGoodLuckMessage && leaders.length > 0 && (
          <p className="text-red-600 font-black uppercase tracking-widest mt-2 animate-bounce">🏆 Event Concluded 🏆</p>
        )}
      </div>

      {leaders.length === 0 ? (
        <div className="text-center py-8"><p className="text-slate-400 font-bold animate-pulse text-lg">WAITING FOR THE FIRST CHALLENGER...</p></div>
      ) : (
        <div className="flex flex-col gap-3">
          {leaders.map((player, index) => {
            
            // THE FIX: If the event is ended AND this row is NOT the current player, return null (hide it!)
            if (isEventEnded && player.name !== currentPlayer) return null;

            return (
              <div key={player.id} className={`flex flex-col p-4 rounded-xl border transition-all duration-300 hover:scale-[1.01] ${index < 3 ? 'bg-red-50/80 border-red-100 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}>
                
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 ${getRankStyle(index)}`}>
                      {index < 3 ? <FaTrophy className="drop-shadow-sm text-lg" /> : index + 1}
                    </div>
                    <span className={`text-base sm:text-lg font-black tracking-wide truncate max-w-[140px] sm:max-w-[240px] ${index === 0 ? 'text-amber-600' : index === 1 ? 'text-slate-600' : index === 2 ? 'text-orange-700' : 'text-slate-800'}`}>
                      {player.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 sm:gap-8 text-right">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">WPM</span>
                      <span className={`text-xl sm:text-2xl font-black ${index < 3 ? 'text-red-600 drop-shadow-sm' : 'text-slate-800'}`}>{player.wpm}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">ACC</span>
                      <span className="text-sm sm:text-base font-bold text-slate-500">{player.accuracy}%</span>
                    </div>
                  </div>
                </div>

                {/* DYNAMIC CERTIFICATE DOWNLOAD BUTTON */}
                {isEventEnded && index < 3 && player.name === currentPlayer && (
                  <button 
                    onClick={() => generateCertificate(player.name)}
                    disabled={isDownloading}
                    className="mt-4 w-full py-2.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-white font-black text-xs tracking-widest uppercase rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <FaDownload /> {isDownloading ? "Generating..." : "Claim My Certificate"}
                  </button>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}