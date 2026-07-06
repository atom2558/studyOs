import { CheckCircle2, Flame, Target, BookOpen } from "lucide-react";

export default function Dashboard() {
  return (
    <main className="ml-64 p-8 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">สวัสดี, นักเรียน! 👋</h1>
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
          <p className="text-3xl font-bold">4<span className="text-lg text-slate-500 font-normal">/10</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-400">ความต่อเนื่อง (Streak)</h3>
            <div className="bg-orange-500/10 p-2 rounded-lg text-orange-500">
              <Flame size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">12<span className="text-lg text-slate-500 font-normal"> วัน</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-400">เวลาที่อ่านแล้ว</h3>
            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500">
              <BookOpen size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">2.5<span className="text-lg text-slate-500 font-normal"> ชม.</span></p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-slate-400">เป้าหมายสอบติด</h3>
            <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">
              <Target size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">85%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CheckCircle2 className="text-blue-500" /> To-Do List ของวันนี้
          </h2>
          <div className="space-y-3">
            {[
              { title: "อ่านชีวะ บทที่ 1-2", status: "done" },
              { title: "ทำโจทย์คณิตศาสตร์ 30 ข้อ", status: "pending" },
              { title: "สรุปคำศัพท์ภาษาอังกฤษ", status: "pending" },
            ].map((task, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${task.status === "done" ? "bg-blue-500 border-blue-500" : "border-slate-500"}`}>
                    {task.status === "done" && <CheckCircle2 size={14} className="text-white" />}
                  </div>
                  <span className={task.status === "done" ? "line-through text-slate-500" : ""}>{task.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <BookOpen className="text-purple-500" /> แผนการอ่านจาก AI Coach
          </h2>
          <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
            <h3 className="font-semibold text-purple-300 mb-2">ข้อแนะนำสำหรับวันนี้:</h3>
            <p className="text-slate-300 leading-relaxed text-sm">
              "ดูเหมือนเมื่อวานคุณจะใช้เวลาทำโจทย์คณิตศาสตร์นานกว่าปกติ วันนี้ผมแนะนำให้คุณโฟกัสกับการทบทวนชีววิทยาก่อน เพื่อไม่ให้สมองล้าจนเกินไปครับ สู้ๆ! ✌️"
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
