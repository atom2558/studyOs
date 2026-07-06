"use client";
import { useState, useEffect, useRef } from "react";
import { Target, Calendar as CalendarIcon, CheckCircle2, Loader2, Image as ImageIcon, X, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function PlannerPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  
  // Form State
  const [goal, setGoal] = useState("");
  const [goalDate, setGoalDate] = useState("");
  const [subject, setSubject] = useState("");
  const [hours, setHours] = useState("");
  const [details, setDetails] = useState("");
  
  // Image State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Status
  const [isGenerating, setIsGenerating] = useState(false);
  const [scheduleSuccess, setScheduleSuccess] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUserId(session.user.id);
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

  // Handle Paste Event for Image
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelect(file);
          }
          break;
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !hours || !userId) return;
    setIsGenerating(true);

    let uploadedImageUrl = null;
    
    // 1. Upload Image (if any)
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${userId}/planner_${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('schedule_images')
        .upload(filePath, selectedFile);

      if (!uploadError && uploadData) {
        const { data: { publicUrl } } = supabase.storage
          .from('schedule_images')
          .getPublicUrl(filePath);
        uploadedImageUrl = publicUrl;
      }
    }

    // 2. Save Plan to study_plans table
    await supabase.from("study_plans").insert([{
      user_id: userId,
      goal: goal,
      target_date: goalDate || null,
      subject: subject,
      hours: parseInt(hours),
      additional_details: details,
      image_url: uploadedImageUrl
    }]);

    // 3. Update Profiles Goal cache
    if (goal || goalDate) {
      await supabase.from("profiles").update({ 
        study_goal: goal, 
        goal_date: goalDate || null 
      }).eq("id", userId);
    }

    // 4. Generate Mock Schedule Blocks
    // In the future, this is where we send data to Gemini/OpenAI!
    const numHours = parseInt(hours);
    const sessions = Math.ceil(numHours / 2);
    
    const newSchedules = [];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    for (let i = 0; i < sessions; i++) {
      const date = new Date(tomorrow);
      date.setDate(date.getDate() + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      newSchedules.push({
        user_id: userId,
        title: `อ่าน ${subject} (Session ${i+1}) - ตามเป้าหมาย`,
        event_date: dateStr,
        event_time: "18:00",
        image_url: uploadedImageUrl // แนบรูปเข้าตารางเรียนด้วยเลย
      });
    }

    const { error } = await supabase.from("schedules").insert(newSchedules);
    
    setIsGenerating(false);
    if (!error) {
      setScheduleSuccess(true);
      setTimeout(() => router.push("/calendar"), 2500);
    } else {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการสร้างตารางเรียน (คุณได้สร้างตาราง study_plans หรือยัง?)");
    }
  };

  return (
    <main className="ml-64 p-8 min-h-screen">
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
          <Target className="text-blue-500" size={32} />
          AI Smart Planner
        </h1>
        <p className="text-slate-400">ให้ข้อมูลกับ AI อย่างครบถ้วน เพื่อจัดตารางเรียนที่สมบูรณ์แบบสำหรับคุณ</p>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          {scheduleSuccess ? (
            <div className="text-center py-12">
              <CheckCircle2 size={72} className="text-emerald-500 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2">AI ประมวลผลและสร้างตารางสำเร็จ!</h3>
              <p className="text-slate-400 text-lg">กำลังพาคุณไปยังหน้าปฏิทิน เพื่อดูแผนที่จัดให้...</p>
            </div>
          ) : (
            <form onSubmit={handleCreateSchedule} className="space-y-8">
              
              {/* Part 1: Goal */}
              <div className="space-y-5">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Target size={24} className="text-blue-400" />
                  1. ข้อมูลเป้าหมาย
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-slate-300 font-medium mb-2">เป้าหมายของคุณคืออะไร?</label>
                    <input
                      type="text"
                      placeholder="เช่น อยากสอบติดแพทย์, อยากได้เกรด 4, สอบ IELTS 7.0"
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
              </div>

              {/* Part 2: Context / Images / Chat */}
              <div className="space-y-5 pt-6 border-t border-slate-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageSquare size={24} className="text-purple-400" />
                  2. ให้ข้อมูลเชิงลึกกับ AI
                </h3>
                
                {/* Image Upload UI */}
                <div>
                  <label className="block text-slate-300 font-medium mb-2">อัปโหลดรูปตารางสอบ หรือ เนื้อหาวิชา (Syllabus)</label>
                  <div 
                    className="w-full bg-slate-950 border-2 border-dashed border-slate-700 hover:border-purple-500 transition-colors rounded-lg p-6 text-center cursor-pointer" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <div className="relative inline-block">
                        <img src={previewUrl} alt="Preview" className="max-h-48 rounded-md object-contain" />
                        <button 
                          type="button" 
                          onClick={(e) => { e.stopPropagation(); removeFile(); }}
                          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:scale-110 transition-transform"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <ImageIcon size={32} className="mb-3 text-slate-400" />
                        <p className="text-lg mb-1">คลิกเพื่อเลือกไฟล์ หรือ `Ctrl+V` วางรูปที่นี่</p>
                        <p className="text-sm">ให้ AI อ่านตารางสอบและเนื้อหาให้คุณ</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-2">คุยกับ AI / บอกรายละเอียดเพิ่มเติม</label>
                  <textarea
                    rows={3}
                    placeholder="เช่น ช่วยเน้นบทที่ 3 เป็นพิเศษให้หน่อย, วันเสาร์อาทิตย์ไม่ว่างอ่านนะ จัดให้แค่วันธรรมดา"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                  ></textarea>
                </div>
              </div>

              {/* Part 3: Requirement */}
              <div className="space-y-5 pt-6 border-t border-slate-800">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CalendarIcon size={24} className="text-emerald-400" />
                  3. ความต้องการตารางเรียน
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">วิชาหลัก</label>
                    <input
                      type="text"
                      required
                      placeholder="เช่น คณิตศาสตร์, ฟิสิกส์"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-2">ชั่วโมงเป้าหมาย (สัปดาห์นี้)</label>
                    <input
                      type="number"
                      min="1"
                      max="40"
                      required
                      placeholder="เช่น 10 (ชั่วโมง)"
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-5 rounded-lg text-blue-300">
                ✨ <strong>AI Analysis:</strong> ระบบจะนำรูปภาพเป้าหมาย ข้อมูลสอบ และรายละเอียดข้อจำกัดของคุณไปประมวลผล เพื่อสร้างแผนการอ่านหนังสือที่ดีที่สุด
              </div>
              
              <button 
                type="submit"
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg py-4 rounded-xl flex justify-center items-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-purple-500/20"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={24} /> : <Target size={24} />}
                {isGenerating ? "AI กำลังวิเคราะห์และจัดตาราง..." : "ประมวลผลแผนการเรียนด้วย AI"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
