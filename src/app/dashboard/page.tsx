"use client";
import { CheckCircle2, Flame, Target, BookOpen, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const router = useRouter();
  const [nickname, setNickname] = useState("นักเรียน");
  const [todos, setTodos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Fetch Profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("nickname")
        .eq("id", session.user.id)
        .single();
        
      if (profile?.nickname) {
        setNickname(profile.nickname);
      }

      // Fetch Todos for preview
      const { data: todosData } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(5); // Show top 5 tasks

      if (todosData) {
        setTodos(todosData);
      }

      setIsLoading(false);
    };

    fetchDashboardData();
  }, [router]);

  if (isLoading) {
    return (
      <main className="ml-64 p-8 min-h-screen flex items-center justify-center text-slate-400">
        <Loader2 size={32} className="animate-spin" />
      </main>
    );
  }

  const completedCount = todos.filter(t => t.completed).length;
  const totalCount = todos.length;

  return (
    <main className="ml-64 p-8 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">สวัสดี, {nickname}! 👋</h1>
        <p className="text-slate-400">มาดูภาพรวมการเรียนของคุณในวันนี้กัน</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-400">งานที่เสร็จแล้ว</h3>
            <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-500">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">{completedCount}<span className="text-lg text-slate-500 font-normal">/{totalCount || 0}</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-400">ความต่อเนื่อง (Streak)</h3>
            <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500">
              <Flame size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">0<span className="text-lg text-slate-500 font-normal"> วัน</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-400">เวลาที่อ่านแล้ว</h3>
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
              <BookOpen size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">0<span className="text-lg text-slate-500 font-normal"> ชม.</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-400">เป้าหมายสอบติด</h3>
            <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
              <Target size={20} />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-500">รอเก็บข้อมูล...</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-blue-500" /> To-Do List ของวันนี้
          </h2>
          <div className="space-y-3">
            {todos.length === 0 ? (
              <p className="text-slate-500">ไม่มีงานค้าง เยี่ยมมาก! 🎉</p>
            ) : (
              todos.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${task.completed ? "bg-blue-500 border-blue-500" : "border-slate-500"}`}>
                      {task.completed && <CheckCircle2 size={14} className="text-white" />}
                    </div>
                    <span className={task.completed ? "line-through text-slate-500" : "text-white font-medium"}>
                      {task.title}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-purple-500" /> แผนการอ่านจาก AI Coach
          </h2>
          <div className="p-4 bg-slate-800/50 border border-slate-700 rounded-lg flex flex-col items-center justify-center h-32 text-center text-slate-500">
            <p>ระบบ AI Coach ต้องการข้อมูลการเรียนของคุณเพิ่มเติม</p>
            <p className="text-sm">กรุณาบันทึก To-Do หรือใช้งานแอปสักระยะหนึ่ง</p>
          </div>
        </div>
      </div>
    </main>
  );
}
