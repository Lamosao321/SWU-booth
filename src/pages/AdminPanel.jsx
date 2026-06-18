import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from '../firebase.js';
import { QRCodeSVG } from 'qrcode.react';

// SUB-COMPONENT: Participant Row
function ParticipantRow({ p }) {
  const [wpm, setWpm] = useState(p.wpm || '');
  const [acc, setAcc] = useState(p.accuracy || '');
  const [isSaving, setIsSaving] = useState(false);
  const isLocked = p.finalized || (p.wpm > 0);

  const handleConfirm = async () => {
    if (!wpm || !acc) return alert("Enter both WPM and Accuracy!");
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "participants", p.id), {
        wpm: Number(wpm), accuracy: Number(acc), finalized: true
      });
    } catch (e) {
      console.error(e); alert("Database link failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`flex flex-col sm:flex-row gap-4 p-4 rounded-2xl items-center justify-between border transition-all duration-300
      ${isLocked ? 'bg-slate-50/50 border-slate-200/60 opacity-75' : 'bg-white border-slate-100 shadow-sm'}`}>
      <span className={`font-black text-lg flex-grow truncate ${isLocked ? 'text-slate-400' : 'text-slate-700'}`}>{p.name}</span>
      <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase">WPM</span>
          <input type="number" placeholder="0" value={isLocked ? p.wpm : wpm} disabled={isLocked} onChange={(e) => setWpm(e.target.value)}
            className={`w-20 p-2.5 rounded-xl border font-black text-center text-lg focus:outline-none 
              ${isLocked ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-red-400'}`} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase">ACC%</span>
          <input type="number" placeholder="0" value={isLocked ? p.accuracy : acc} disabled={isLocked} onChange={(e) => setAcc(e.target.value)}
            className={`w-20 p-2.5 rounded-xl border font-black text-center text-lg focus:outline-none 
              ${isLocked ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-50 border-slate-200 focus:border-red-400'}`} />
        </div>
        {isLocked ? (
          <span className="px-4 py-2.5 rounded-xl bg-slate-200/60 text-slate-500 font-black text-xs uppercase select-none">🔒 Locked</span>
        ) : (
          <button onClick={handleConfirm} disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-500 text-white font-black text-xs uppercase shadow-md hover:shadow-lg transition-all active:scale-95 disabled:opacity-50">
            {isSaving ? "..." : "Confirm"}
          </button>
        )}
      </div>
    </div>
  );
}

// MAIN DASHBOARD
export default function AdminPanel() {
  const [participants, setParticipants] = useState([]);
  const [isEventEnded, setIsEventEnded] = useState(false);
  const registrationUrl = window.location.origin; // Automatically gets your local or Vercel URL!

  useEffect(() => {
    // Listen to participants
    const q = collection(db, "participants");
    const unsubParticipants = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (a.finalized === b.finalized) ? 0 : a.finalized ? 1 : -1);
      setParticipants(list);
    });

    // Listen to event status
    const unsubEvent = onSnapshot(doc(db, "settings", "event"), (docSnap) => {
      if (docSnap.exists()) setIsEventEnded(docSnap.data().isEnded);
    });

    return () => { unsubParticipants(); unsubEvent(); };
  }, []);

  const toggleEvent = async () => {
    const confirmMsg = isEventEnded 
      ? "Re-open the booth? This will hide the certificates." 
      : "END EVENT? This locks the booth and releases the certificates to the Top 3!";
    
    if (window.confirm(confirmMsg)) {
      await setDoc(doc(db, "settings", "event"), { isEnded: !isEventEnded }, { merge: true });
    }
  };

  return (
    <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
      
      {/* SIDEBAR: QR CODE & EVENT CONTROLS */}
      <div className="w-full md:w-64 flex flex-col gap-4">
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-sm flex flex-col items-center text-center">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">Scan to Join</h2>
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 mb-4">
            <QRCodeSVG value={registrationUrl} size={150} />
          </div>
          <p className="text-[10px] text-slate-400 font-bold">{registrationUrl}</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[2rem] border border-white shadow-sm">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4 text-center">Event Status</h2>
          <button 
            onClick={toggleEvent}
            className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${isEventEnded ? 'bg-slate-800 text-white shadow-lg' : 'bg-red-600 text-white shadow-lg shadow-red-600/20 animate-pulse'}`}
          >
            {isEventEnded ? "Event Ended" : "Close Booth Now"}
          </button>
        </div>
      </div>

      {/* MAIN DASHBOARD */}
      <div className="flex-1 p-6 sm:p-8 bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white">
        <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight uppercase">⚡ Master Console ⚡</h1>
          </div>
          <span className="px-3 py-1 bg-red-50 text-red-600 font-black text-xs rounded-full border border-red-100 animate-pulse">LIVE</span>
        </div>

        <div className="grid gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {participants.map(p => <ParticipantRow key={p.id} p={p} />)}
        </div>
      </div>
    </div>
  );
}