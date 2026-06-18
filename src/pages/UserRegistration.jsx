import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from '../firebase.js';

export default function UserRegistration() {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const registerUser = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "participants"), {
        name: name.trim(), // Trimmed to remove accidental spaces
        wpm: 0,
        accuracy: 0,
        createdAt: serverTimestamp()
      });
      
      // THIS IS THE NEW LINE: Save their name locally to their device!
      localStorage.setItem('swudevs_player_name', name.trim());
      
      navigate('/leaderboard'); 
    } catch (e) {
      console.error("Error:", e);
      alert("System jam! Please try again.");
      setIsSubmitting(false);
    } 
  };

  return (
    // Light Frosted Glass Card
    <div className="w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] bg-white/70 backdrop-blur-xl border border-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] flex flex-col items-center text-center group transition-all duration-300 hover:border-red-200">
      
      {/* Tech Keyboard Icon Badge */}
      <div className="mb-5 w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-400 flex items-center justify-center shadow-[0_8px_20px_rgba(220,38,38,0.2)] transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
        <span className="text-2xl text-white">⌨️</span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-2">
        Speed Typing <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-500">Challenge</span>
      </h1>
      <p className="text-slate-500 mb-8 font-medium text-sm">Enter your alias to claim your spot in the arena</p>

      <form onSubmit={registerUser} className="w-full flex flex-col gap-5">
        <input 
          type="text"
          placeholder="Enter your full name..." 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-6 py-4 rounded-2xl bg-white border border-slate-200 text-slate-800 font-bold placeholder:text-slate-400 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-500/10 transition-all text-lg shadow-sm"
          required
        />
        
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white font-black tracking-widest uppercase transition-all duration-300 shadow-[0_10px_20px_rgba(225,29,72,0.2)] hover:shadow-[0_15px_25px_rgba(225,29,72,0.3)] active:scale-[0.98] disabled:opacity-50 text-sm sm:text-base"
        >
          {isSubmitting ? "ENROLLING..." : "START JOURNEY 🚀"}
        </button>
      </form>
    </div>
  );
}