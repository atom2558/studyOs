"use client";
import { useState, useEffect } from "react";
import { Target, Brain, ArrowRight, Loader2, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Simplified Holland Code (RIASEC) Test
const questions = [
  { id: 'R', text: "ฉันชอบทำงานกับเครื่องยนต์กลไก ซ่อมแซมสิ่งของ หรือสร้างสิ่งต่างๆ ด้วยมือ", type: "Realistic" },
  { id: 'I', text: "ฉันชอบคิดวิเคราะห์ แก้ปัญหาซับซ้อน ทดลอง หรือศึกษาเรื่องวิทยาศาสตร์", type: "Investigative" },
  { id: 'A', text: "ฉันชอบงานศิลปะ ดนตรี การออกแบบ และชอบแสดงออกถึงความคิดสร้างสรรค์", type: "Artistic" },
  { id: 'S', text: "ฉันชอบช่วยเหลือ พูดคุย ให้คำปรึกษา หรือสอนผู้อื่น", type: "Social" },
  { id: 'E', text: "ฉันชอบเป็นผู้นำ โน้มน้าวใจคน ชอบความท้าทาย และสนใจธุรกิจ", type: "Enterprising" },
  { id: 'C', text: "ฉันชอบทำงานที่มีระบบระเบียบ จัดการข้อมูล ตัวเลข หรือเอกสารต่างๆ", type: "Conventional" }
];

const careers = {
  "Realistic": "วิศวกรรมศาสตร์, สถาปัตยกรรม, ช่างเทคนิค",
  "Investigative": "แพทยศาสตร์, วิทยาศาสตร์, ทันตแพทย์",
  "Artistic": "นิเทศศาสตร์, ศิลปกรรม, อักษรศาสตร์",
  "Social": "ครุศาสตร์, พยาบาลศาสตร์, สังคมสงเคราะห์",
  "Enterprising": "บริหารธุรกิจ, นิติศาสตร์, รัฐศาสตร์",
  "Conventional": "บัญชี, เศรษฐศาสตร์, โลจิสติกส์"
};

export default function PlannerPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"intro" | "test" | "result" | "planner">("intro");
  const [scores, setScores] = useState<Record<string, number>>({ R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [resultType, setResultType] = useState<string>("");
  
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
        // Check if user already has a goal set (skipping for MVP, we let them retake)
      }
    };
    fetchSession();
  }, [router]);

  const handleAnswer = (score: number) => {
    const q = questions[currentQuestion];
    setScores(prev => ({ ...prev, [q.id]: prev[q.id] + score }));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(curr => curr + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    // Find highest score
    let maxScore = -1;
    let maxTrait = "R";
    
    Object.entries(scores).forEach(([trait, score]) => {
      if (score > maxScore) {
        maxScore = score;
        maxTrait = trait;
      }
    });

    const typeName = questions.find(q => q.id === maxTrait)?.type || "Investigative";
    setResultType(typeName);
    setCurrentStep("result");
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !hours || !userId) return;
    setIsGenerating(true);

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
          <Brain className="text-purple-500" size={32} />
          Smart Planner & Assessment
        </h1>
        <p className="text-slate-400">แบบประเมินความถนัด (อ้างอิงทฤษฎี Holland Code) และระบบจัดตารางเรียน AI</p>
      </header>

      <div className="max-w-3xl mx-auto">
        {currentStep === "intro" && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
            <div className="w-20 h-20 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">ค้นหาเป้าหมายที่แท้จริงของคุณ</h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              เพื่อให้ AI Coach สามารถแนะนำคุณได้อย่างแม่นยำ เราจะใช้แบบทดสอบบุคลิกภาพ Holland Code (RIASEC) 
              ซึ่งเป็นทฤษฎีที่ได้รับการยอมรับระดับสากลในการค้นหาความถนัดและอาชีพที่เหมาะสม
            </p>
            <button 
              onClick={() => setCurrentStep("test")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-8 rounded-full transition-colors inline-flex items-center gap-2"
            >
              เริ่มทำแบบประเมิน <ArrowRight size={20} />
            </button>
          </div>
        )}

        {currentStep === "test" && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
            <div className="mb-8">
              <div className="flex justify-between text-sm text-slate-400 mb-2">
                <span>คำถามที่ {currentQuestion + 1} จาก {questions.length}</span>
                <span>{Math.round(((currentQuestion) / questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${((currentQuestion) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-8 text-center leading-relaxed">
              "{questions[currentQuestion].text}"
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => handleAnswer(1)} className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-700 hover:border-slate-500 transition-all text-slate-300">
                ไม่ตรงเลย
              </button>
              <button onClick={() => handleAnswer(3)} className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 transition-all text-blue-400 font-medium">
                ค่อนข้างตรง
              </button>
              <button onClick={() => handleAnswer(5)} className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all text-emerald-400 font-bold">
                ตรงมากที่สุด!
              </button>
            </div>
          </div>
        )}

        {currentStep === "result" && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center">
            <h2 className="text-xl font-medium text-slate-400 mb-2">ผลการประเมินของคุณคือบุคลิกภาพแบบ</h2>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
              {resultType}
            </h1>
            
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-xl mb-8 text-left">
              <h3 className="font-bold text-white mb-2">คณะ/สาขาที่แนะนำ:</h3>
              <p className="text-blue-400 text-lg mb-4">{careers[resultType as keyof typeof careers]}</p>
              <p className="text-slate-400 text-sm">
                AI ได้วิเคราะห์ข้อมูลของคุณเรียบร้อยแล้ว ต่อไปเรามากำหนดตารางเรียนกันครับ
              </p>
            </div>

            <button 
              onClick={() => setCurrentStep("planner")}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-8 rounded-full transition-colors inline-flex items-center gap-2"
            >
              ให้ AI จัดตารางเรียนให้ <CalendarIcon size={20} />
            </button>
          </div>
        )}

        {currentStep === "planner" && (
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">AI จัดตารางเรียนอัตโนมัติ</h2>
            
            {scheduleSuccess ? (
              <div className="text-center py-8">
                <CheckCircle2 size={64} className="text-emerald-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">จัดตารางเรียนสำเร็จ!</h3>
                <p className="text-slate-400">กำลังพาคุณไปยังหน้าปฏิทิน...</p>
              </div>
            ) : (
              <form onSubmit={handleCreateSchedule} className="space-y-6">
                <div>
                  <label className="block text-slate-300 font-medium mb-2">วิชาที่ต้องการให้จัดตาราง</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น คณิตศาสตร์, ชีววิทยา, ฟิสิกส์"
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
                <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg text-sm text-blue-400">
                  💡 ระบบจะแบ่งการอ่านเป็นบล็อกละ 2 ชั่วโมง และกระจายลงปฏิทินของคุณในสัปดาห์นี้ให้โดยอัตโนมัติ
                </div>
                <button 
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 rounded-lg flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <CalendarIcon size={20} />}
                  สร้างตารางเรียน
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
