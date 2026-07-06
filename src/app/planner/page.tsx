"use client";
import { useState, useEffect } from "react";
import { Target, Calendar as CalendarIcon, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PlannerPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Goal State
  const [goal, setGoal] = useState("");
  const [goalDate, setGoalDate] = useState("");
  
  // Planner State
  const [subject, setSubject] = useState("");
  const [hours, setHours] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUserId(session.user.id);
        // Load existing goal if any
        const { data: profile } = await supabase
          .from("profiles")
          .select("study_goal, goal_date")
          .eq("id", session.user.id)
          .single();
          
        if (profile) {
          if (profile.study_goal) setGoal(profile.study_goal);
          if (profile.goal_date) setGoalDate(profile.goal_date);
        }
      }
    };
    fetchSession();
  }, [router]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !hours || !userId) return;
    setIsGenerating(true);

    // Save Goal to Profile
    if (goal || goalDate) {
      await supabase
        .from("profiles")
        .update({ 
          study_goal: goal, 
          goal_date: goalDate 
        })
        .eq("id", userId);
    }

    const numHours = parseInt(hours);
    const sessions = Math.ceil(numHours / 2); // Break down into 2-hour blocks
    
    // Create schedules starting from tomorrow
    const newSchedules = [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    for (let i = 0; i < sessions; i++) {
      const date = new Date(tomorrow);
      date.setDate(date.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      newSchedules.push({
        user_id: userId,
        title: `ติว ${subject} (Session ${i+1})`,
        event_date: dateStr,
        event_time: "18:00"
      });
    }

    const { error } = await supabase.from("schedules").insert(newSchedules);
    
    setIsGenerating(false);
    if (!error) {
      setScheduleSuccess(true);
      setTimeout(() => router.push("/calendar"), 2000);
    }
  };

  return (
    <main className="ml-64 p-8 min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
          <Target className="text-blue-500" size={32} />
          ตั้งเป้าหมาย & จัดตารางเรียน
        </h1>
        <p className="text-slate-400">กำหนดเป้าหมายของคุณ แล้วให้ AI ช่วยกระจายเวลาอ่านหนังสือลงปฏิทิน</p>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          {scheduleSuccess ? (
            <div className="text-center py-8">
              <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">จัดตารางเรียนสำเร็จ!</h3>
              <p className="text-slate-400">กำลังพาคุณไปยังหน้าปฏิทิน...</p>
            </div>
          ) : (
            <form onSubmit={handleCreateSchedule} className="space-y-6">
              
              <div className="pb-6 border-b border-slate-800 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Target size={20} className="text-blue-400" />
                  1. กำหนดเป้าหมายหลัก
                </h3>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">เป้าหมายของคุณคืออะไร?</label>
                  <input
                    type="text"
                    placeholder="เช่น อยากสอบติดแพทย์, อยากได้เกรด 4 ฟิสิกส์, สอบ IELTS 7.0"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">สอบวันไหน? (Target Date)</label>
                  <input
                    type="date"
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="pt-2 space-y-6">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CalendarIcon size={20} className="text-emerald-400" />
                  2. ให้ AI จัดตารางเรียนสัปดาห์นี้
                </h3>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">วิชาที่ต้องการให้อ่าน</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คณิตศาสตร์, ชีววิทยา, ทบทวนแกรมม่า"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-2">เป้าหมายจำนวนชั่วโมงในสัปดาห์นี้</label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    required
                    placeholder="เช่น 10 (ชั่วโมง)"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-400">
                💡 ระบบจะแบ่งการอ่านเป็นบล็อกละ 2 ชั่วโมง และกระจายลงปฏิทินของคุณโดยอัตโนมัติ
              </div>
              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <CalendarIcon size={20} />}
                บันทึกเป้าหมาย & สร้างตารางเรียน
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
