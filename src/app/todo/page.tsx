"use client";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Circle, Trash2, Plus, Camera, Loader2 } from "lucide-react";

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem("studyos_todos");
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Default tasks for MVP demo
      setTodos([
        { id: "1", title: "อ่านชีวะ บทที่ 1-2", completed: true },
        { id: "2", title: "ทำโจทย์คณิตศาสตร์ 30 ข้อ", completed: false },
        { id: "3", title: "สรุปคำศัพท์ภาษาอังกฤษ", completed: false },
      ]);
    }
  }, []);

  // Save to local storage whenever todos change
  useEffect(() => {
    localStorage.setItem("studyos_todos", JSON.stringify(todos));
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    setTodos([
      { id: Date.now().toString(), title: newTask, completed: false },
      ...todos,
    ]);
    setNewTask("");
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result as string;

        // Send to API
        const response = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Image }),
        });

        if (!response.ok) {
          throw new Error("Failed to extract tasks from image");
        }

        const data = await response.json();
        if (data.tasks && Array.isArray(data.tasks)) {
          const newTodos = data.tasks.map((task: any, index: number) => ({
            id: Date.now().toString() + index,
            title: task.title,
            completed: false,
          }));
          
          setTodos((prev) => [...newTodos, ...prev]);
        }
      };
    } catch (error) {
      console.error("Error processing image:", error);
      alert("เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ");
    } finally {
      // Reset input so the same file can be selected again
      e.target.value = "";
      // Note: We use setTimeout to hide loading after a bit so user sees it finish if it was very fast
      setTimeout(() => setIsUploading(false), 500);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <main className="ml-64 p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">To-Do List ✅</h1>
          <p className="text-slate-400">จัดการงานและการเรียนของคุณ (บันทึกอัตโนมัติในเบราว์เซอร์)</p>
        </header>

        <form onSubmit={addTodo} className="mb-8 flex gap-3">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="เพิ่มงานใหม่ เช่น อ่านฟิสิกส์บทที่ 3..."
            disabled={isUploading}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
          />
          
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-4 py-3 rounded-lg font-medium flex items-center justify-center transition-colors disabled:opacity-50"
            title="ให้ AI ดึงงานจากรูปภาพ"
          >
            {isUploading ? <Loader2 size={20} className="animate-spin text-blue-400" /> : <Camera size={20} />}
          </button>

          <button
            type="submit"
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Plus size={20} />
            เพิ่ม
          </button>
        </form>

        {isUploading && (
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center gap-3 text-blue-400">
            <Loader2 size={20} className="animate-spin" />
            <span>AI กำลังวิเคราะห์รูปภาพเพื่อดึงงานออกมา โปรดรอสักครู่...</span>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {todos.length === 0 ? (
            <div className="p-8 text-center text-slate-500">ไม่มีงานค้าง เยี่ยมมาก! 🎉</div>
          ) : (
            <div className="divide-y divide-slate-800">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors group"
                >
                  <div
                    className="flex items-center gap-4 cursor-pointer flex-1"
                    onClick={() => toggleTodo(todo.id)}
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="text-blue-500 flex-shrink-0" />
                    ) : (
                      <Circle className="text-slate-500 flex-shrink-0" />
                    )}
                    <span
                      className={`text-lg transition-all ${
                        todo.completed ? "line-through text-slate-500" : "text-slate-200"
                      }`}
                    >
                      {todo.title}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="text-slate-600 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
