"use client";
import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Target, Coffee, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function FocusModePage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUserId(session.user.id);
      }
    };
    fetchSession();
  }, [router]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer finished
      handleTimerComplete();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = async () => {
    setIsActive(false);
    
    if (!isBreak) {
      // Finished a focus session (25 mins)
      setSessionCount(prev => prev + 1);
      setShowReward(true);
      
      if (userId) {
        // Save to database
        const { data: profile } = await supabase
          .from("profiles")
          .select("total_focus_minutes")
          .eq("id", userId)
          .single();
          
        const currentMins = profile?.total_focus_minutes || 0;
        
        await supabase
          .from("profiles")
          .update({ total_focus_minutes: currentMins + 25 })
          .eq("id", userId);
      }
      
      // Auto-switch to break (5 mins)
      setTimeout(() => {
        setIsBreak(true);
        setTimeLeft(5 * 60);
        setShowReward(false);
      }, 3000);
      
    } else {
      // Finished a break, switch back to focus
      setIsBreak(false);
      setTimeLeft(25 * 60);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
  };

  const setMode = (mode: "focus" | "break") => {
    setIsActive(false);
    setIsBreak(mode === "break");
    setTimeLeft(mode === "break" ? 5 * 60 : 25 * 60);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <main className="ml-64 min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: isBreak ? '#0f172a' : '#020617' }}>
      
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-1000 ${isBreak ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>

      <div className="z-10 text-center">
        {showReward ? (
          <div className="animate-bounce flex flex-col items-center text-emerald-400 mb-8">
            <CheckCircle2 size={64} className="mb-4" />
            <h2 className="text-2xl font-bold">เก่งมาก! ได้เวลาพักผ่อน 5 นาที</h2>
          </div>
        ) : (
          <div className="flex justify-center gap-4 mb-12">
            <button 
              onClick={() => setMode("focus")}
              className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${!isBreak ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Target size={18} /> โหมดโฟกัส
            </button>
            <button 
              onClick={() => setMode("break")}
              className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${isBreak ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Coffee size={18} /> พักผ่อน
            </button>
          </div>
        )}

        <div className="relative inline-flex items-center justify-center mb-12">
          {/* Circular progress could go here, for MVP we just show text */}
          <div className={`text-[12rem] font-black tracking-tighter leading-none ${isBreak ? 'text-emerald-400' : 'text-blue-500'}`}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
        </div>

        <div className="flex items-center justify-center gap-6">
          <button 
            onClick={resetTimer}
            className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-all"
          >
            <RotateCcw size={28} />
          </button>
          
          <button 
            onClick={toggleTimer}
            className={`w-24 h-24 rounded-3xl flex items-center justify-center transition-all shadow-xl hover:scale-105 ${isBreak ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-blue-600 text-white shadow-blue-600/20'}`}
          >
            {isActive ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
          </button>
        </div>
        
        <p className="mt-12 text-slate-500 font-medium">
          รอบการอ่านวันนี้: <span className="text-white">{sessionCount}</span> รอบ ({(sessionCount * 25) / 60} ชั่วโมง)
        </p>
      </div>
    </main>
  );
}
