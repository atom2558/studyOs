"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, CheckSquare, MessageSquare, LogOut, BookOpen, Calendar, Target, Brain } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide sidebar on landing page, login, or register
  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const links = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "To-Do List", href: "/todo", icon: CheckSquare },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Smart Planner", href: "/planner", icon: Brain },
    { name: "Focus Mode", href: "/focus", icon: Target },
    { name: "AI Tutor", href: "/tutor", icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col fixed left-0 top-0 text-white z-50">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-gradient-to-tr from-blue-500 to-purple-500 p-2 rounded-xl">
          <BookOpen size={24} className="text-white" />
        </div>
        <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          studyOs
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">ออกจากระบบ</span>
        </button>
      </div>
    </aside>
  );
}
