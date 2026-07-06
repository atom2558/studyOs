"use client";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Schedule = {
  id: string;
  user_id: string;
  title: string;
  event_date: string;
  event_time?: string;
  created_at: string;
};

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTime, setNewTime] = useState("");

  useEffect(() => {
    const fetchSessionAndSchedules = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .eq("user_id", session.user.id)
        .order("event_date", { ascending: true })
        .order("event_time", { ascending: true });

      if (data) {
        setSchedules(data);
      }
      setIsLoading(false);
    };

    fetchSessionAndSchedules();
  }, [router]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const addSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !userId) return;

    // YYYY-MM-DD
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    const newScheduleData = {
      user_id: userId,
      title: newTitle,
      event_date: dateStr,
      event_time: newTime || null,
    };

    const tempId = Date.now().toString();
    const tempSchedule = { ...newScheduleData, id: tempId, created_at: new Date().toISOString() };
    setSchedules([...schedules, tempSchedule]);
    setNewTitle("");
    setNewTime("");
    setShowAddForm(false);

    const { data, error } = await supabase.from("schedules").insert([newScheduleData]).select().single();
    if (error) {
      console.error(error);
      setSchedules(schedules.filter(s => s.id !== tempId));
    } else if (data) {
      setSchedules(prev => prev.map(s => s.id === tempId ? data : s));
    }
  };

  const deleteSchedule = async (id: string) => {
    const prev = [...schedules];
    setSchedules(schedules.filter(s => s.id !== id));
    
    const { error } = await supabase.from("schedules").delete().eq("id", id);
    if (error) {
      console.error(error);
      setSchedules(prev);
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = [];

    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-4 border border-slate-800/50 bg-slate-900/20"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const hasEvents = schedules.some(s => s.event_date === dateStr);
      const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

      days.push(
        <div
          key={i}
          onClick={() => setSelectedDate(new Date(year, month, i))}
          className={`p-4 border border-slate-800/50 min-h-[100px] cursor-pointer transition-all flex flex-col items-center ${
            isSelected ? "bg-blue-600/20 border-blue-500/50" : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          <span className={`w-8 h-8 flex items-center justify-center rounded-full ${isSelected ? "bg-blue-600 text-white font-bold" : "text-slate-300"}`}>
            {i}
          </span>
          {hasEvents && (
            <div className="mt-2 w-2 h-2 rounded-full bg-blue-400"></div>
          )}
        </div>
      );
    }

    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronLeft />
          </button>
          <h2 className="text-xl font-bold text-white">
            {monthNames[month]} {year + 543}
          </h2>
          <button onClick={handleNextMonth} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
            <ChevronRight />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center border-b border-slate-800 bg-slate-800/50">
          {["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."].map(day => (
            <div key={day} className="py-3 text-sm font-medium text-slate-400">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days}
        </div>
      </div>
    );
  };

  const selectedDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const dayEvents = schedules.filter(s => s.event_date === selectedDateStr);

  if (isLoading) {
    return (
      <main className="ml-64 p-8 min-h-screen flex items-center justify-center text-slate-400">
        <Loader2 size={32} className="animate-spin" />
      </main>
    );
  }

  return (
    <main className="ml-64 p-8 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white flex items-center gap-3">
            <CalendarIcon className="text-blue-500" size={32} />
            ตารางเรียน (Calendar)
          </h1>
          <p className="text-slate-400">วางแผนตารางเรียน วันสอบ หรือกิจกรรมสำคัญต่างๆ ของคุณ</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View */}
          <div className="lg:col-span-2">
            {renderCalendar()}
          </div>

          {/* Daily Schedule */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl h-fit">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                ตารางวันที่ {selectedDate.getDate()}
              </h3>
              <button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
              >
                <Plus size={20} />
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={addSchedule} className="mb-6 p-4 border border-slate-700 bg-slate-800/50 rounded-lg space-y-3">
                <input
                  type="text"
                  required
                  placeholder="เช่น ติวฟิสิกส์ หรือ สอบกลางภาค"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-2 text-sm text-slate-400 hover:text-white">ยกเลิก</button>
                  <button type="submit" className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-500">บันทึก</button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {dayEvents.length === 0 ? (
                <div className="text-center p-6 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                  ไม่มีตารางในวันนี้
                </div>
              ) : (
                dayEvents.map(event => (
                  <div key={event.id} className="p-4 bg-slate-800 rounded-lg border border-slate-700 flex justify-between items-center group">
                    <div>
                      <h4 className="text-white font-medium">{event.title}</h4>
                      {event.event_time && (
                        <p className="text-sm text-blue-400 mt-1">{event.event_time}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => deleteSchedule(event.id)}
                      className="text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
