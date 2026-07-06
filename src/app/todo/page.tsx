"use client";
import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Circle, Trash2, Plus, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Todo = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at?: string;
};

export default function TodoPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from Supabase
  useEffect(() => {
    const fetchSessionAndTodos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserId(session.user.id);

      const { data, error } = await supabase
        .from("todos")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching todos:", error);
      } else if (data) {
        setTodos(data);
      }
      setIsLoading(false);
    };

    fetchSessionAndTodos();
  }, [router]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !userId) return;

    const taskData = {
      user_id: userId,
      title: newTask,
      completed: false,
    };

    // Optimistic UI update
    const tempId = Date.now().toString();
    setTodos([{ ...taskData, id: tempId } as Todo, ...todos]);
    setNewTask("");

    // Save to Supabase
    const { data, error } = await supabase.from("todos").insert([taskData]).select().single();
    if (error) {
      console.error("Error inserting todo:", error);
      // Revert if error
      setTodos((prev) => prev.filter((t) => t.id !== tempId));
    } else if (data) {
      // Update with real ID
      setTodos((prev) => prev.map((t) => (t.id === tempId ? data : t)));
    }
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !currentStatus } : todo
      )
    );

    const { error } = await supabase
      .from("todos")
      .update({ completed: !currentStatus })
      .eq("id", id);
      
    if (error) {
      console.error("Error toggling todo:", error);
      // Revert if error
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, completed: currentStatus } : todo
        )
      );
    }
  };

  const deleteTodo = async (id: string) => {
    // Optimistic UI update
    const previousTodos = [...todos];
    setTodos(todos.filter((todo) => todo.id !== id));

    const { error } = await supabase.from("todos").delete().eq("id", id);
    if (error) {
      console.error("Error deleting todo:", error);
      // Revert if error
      setTodos(previousTodos);
    }
  };

  const processImageFile = async (file: File) => {
    if (!userId) return;
    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result as string;

        const response = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Image }),
        });

        if (!response.ok) throw new Error("Failed to extract tasks");

        const data = await response.json();
        if (data.tasks && Array.isArray(data.tasks)) {
          const newTasks = data.tasks.map((task: any) => ({
            user_id: userId,
            title: task.title,
            completed: false,
          }));
          
          // Insert into Supabase
          const { data: insertedData, error } = await supabase.from("todos").insert(newTasks).select();
          
          if (error) {
            console.error("Error saving extracted tasks:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกงาน");
          } else if (insertedData) {
            setTodos((prev) => [...insertedData, ...prev]);
          }
        }
      };
    } catch (error) {
      console.error("Error processing image:", error);
      alert("เกิดข้อผิดพลาดในการวิเคราะห์รูปภาพ");
    } finally {
      setTimeout(() => setIsUploading(false), 500);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await processImageFile(file);
    e.target.value = "";
  };

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
          }
          break;
        }
      }
    };

    window.addEventListener("paste", handleGlobalPaste);
    return () => {
      window.removeEventListener("paste", handleGlobalPaste);
    };
  }, [userId]); // Dependency on userId

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isLoading) {
    return (
      <main className="ml-64 p-8 min-h-screen flex items-center justify-center text-slate-400">
        <Loader2 size={32} className="animate-spin" />
      </main>
    );
  }

  return (
    <main className="ml-64 p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">To-Do List ✅</h1>
          <p className="text-slate-400">จัดการงานและการเรียนของคุณ (บันทึกอัตโนมัติบนคลาวด์)</p>
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
                    onClick={() => toggleTodo(todo.id, todo.completed)}
                  >
                    {todo.completed ? (
                      <CheckCircle2 className="text-blue-500 flex-shrink-0" />
                    ) : (
                      <Circle className="text-slate-500 flex-shrink-0" />
                    )}
                    <span
                      className={`text-lg font-medium transition-all ${
                        todo.completed ? "line-through text-slate-500" : "text-white"
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
