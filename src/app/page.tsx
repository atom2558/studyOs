import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-[family-name:var(--font-geist-sans)]">
      <main className="flex-grow flex flex-col items-center justify-center p-8 sm:p-20 relative overflow-hidden">
        {/* Background gradient decorative element */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

        <div className="text-center z-10 flex flex-col items-center max-w-3xl">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 drop-shadow-sm">
            studyOs
          </h1>
          <p className="text-lg sm:text-2xl text-slate-300 mb-10 font-light leading-relaxed">
            ระบบปฏิบัติการสำหรับการเรียนแห่งอนาคต 
            <br /> <span className="text-blue-400 font-medium">AI Study Operating System</span> ที่รู้ใจคุณที่สุด
          </p>

          <div className="flex gap-4 items-center flex-col sm:flex-row mb-16">
            <a
              className="rounded-full border border-solid border-transparent transition-all flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 text-lg sm:text-xl h-14 px-8 font-semibold shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              href="#"
            >
              เริ่มต้นใช้งานฟรี
            </a>
            <a
              className="rounded-full border-2 border-solid border-slate-700 transition-all flex items-center justify-center hover:bg-slate-800 hover:border-slate-600 text-lg sm:text-xl h-14 px-8 font-medium"
              href="#"
            >
              ดูฟีเจอร์ทั้งหมด
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mt-8">
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col items-center hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 text-2xl">🧠</div>
              <h3 className="text-xl font-semibold mb-2">AI Coach</h3>
              <p className="text-sm text-slate-400 text-center">โค้ชส่วนตัวช่วยวางแผนการเรียนและวิเคราะห์จุดอ่อน</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col items-center hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 text-2xl">📅</div>
              <h3 className="text-xl font-semibold mb-2">Smart Planner</h3>
              <p className="text-sm text-slate-400 text-center">จัดตารางเรียนอัตโนมัติ ให้คุณมีเวลาพักผ่อนมากขึ้น</p>
            </div>
            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm flex flex-col items-center hover:bg-slate-800 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 text-2xl">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Focus Mode</h3>
              <p className="text-sm text-slate-400 text-center">ระบบช่วยตัดสิ่งรบกวน เพื่อสมาธิสูงสุดในการเรียน</p>
            </div>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center py-6 text-sm text-slate-500 border-t border-slate-800">
        <p>© 2026 studyOs. All rights reserved.</p>
      </footer>
    </div>
  );
}
