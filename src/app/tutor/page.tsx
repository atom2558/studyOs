"use client";
import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function TutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "สวัสดีครับ! ผมคือ AI Tutor ประจำ studyOs มีอะไรให้ผมช่วยแนะนำเกี่ยวกับการเรียน วันนี้บอกได้เลยนะครับ 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response");
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || "ขออภัยครับ เกิดข้อผิดพลาดในการตอบกลับ";
      
      setMessages((prev) => [...prev, { role: "assistant", content: aiResponse }]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "ขออภัยครับ ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ AI ได้ในขณะนี้ โปรดลองใหม่อีกครั้ง" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="ml-64 p-8 h-screen flex flex-col bg-slate-950">
      <header className="mb-6 flex-shrink-0">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Bot className="text-blue-500" size={32} />
          AI Tutor Chat
        </h1>
        <p className="text-slate-400">ถามคำถาม อธิบายบทเรียน หรือขอคำปรึกษาการเรียนได้ตลอด 24 ชั่วโมง</p>
      </header>

      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl flex flex-col overflow-hidden shadow-lg">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Bot size={20} className="text-blue-400" />
                </div>
              )}
              
              <div
                className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
              </div>

              {msg.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-slate-300" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 justify-start">
              <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                <Bot size={20} className="text-blue-400" />
              </div>
              <div className="bg-slate-800 rounded-2xl rounded-tl-none p-4 border border-slate-700 flex items-center gap-2">
                <Loader2 size={16} className="text-blue-400 animate-spin" />
                <span className="text-slate-400 text-sm">AI กำลังคิด...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-900 border-t border-slate-800">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="พิมพ์คำถามของคุณที่นี่..."
              disabled={isLoading}
              className="w-full bg-slate-800 border border-slate-700 rounded-full pl-6 pr-14 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white p-2.5 rounded-full transition-colors flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-xs text-slate-500">
              AI สามารถให้ข้อมูลที่คลาดเคลื่อนได้ โปรดตรวจสอบความถูกต้องอีกครั้ง
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
