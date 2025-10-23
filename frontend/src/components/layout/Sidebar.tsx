import {
  BarChart3,
  BookOpen,
  Users,
  Notebook,
  Book,
  FileText,
  Zap,
  User,
  GraduationCap,
  Globe,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUI } from "@/contexts/UIContext";
import { useAuthContext } from "@/contexts/AuthContext";
import  {useRef, useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export const Sidebar = () => {
  const { activeView, setActiveView } = useUI();
  const { user, setUser, loading } = useAuthContext();
  const [formData, setFormData] = useState({
    name: user?.name ?? "",
    username: user?.username ?? "",
    phone: user?.phone ?? "",
    bio: user?.bio ?? "",
  });
    const [preview, setPreview] = useState<string | null>(user?.profile_picture || null);
  
  useEffect(() => {
      setFormData({
        name: user?.name ?? "",
        username: user?.username ?? "",
        phone: user?.phone ?? "",
        bio: user?.bio ?? "",
      });
      setPreview(user?.profile_picture || null);
    }, [user]);
  const menuItems = [
    { icon: BarChart3, label: "Dashboard", view: "dashboard" },
    { icon: BookOpen, label: "Daily Journal", view: "dailyJournal" },
    { icon: Users, label: "Trades", view: "trades" },
    { icon: Notebook, label: "Notebook", view: "notebook" },
    { icon: Book, label: "Playbook", view: "playbook" },
    { icon: FileText, label: "Reports", view: "reports" },
    { icon: Zap, label: "Insights", view: "insights" },
    { icon: User, label: "Backtesting", view: "backtesting", badge: "NEW" },
    { icon: FileText, label: "Trade Replay", view: "tradeReplay" },
    { icon: GraduationCap, label: "Challenges", view: "challenges", badge: "NEW" },
    { icon: User, label: "Mentor Mode", view: "mentorMode" },
    { icon: GraduationCap, label: "University", view: "university" },
    { icon: Globe, label: "Resource Center", view: "resourceCenter" },
  ];

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-gradient-to-b from-[#0B0D29] to-[#17193C] text-white flex flex-col shadow-xl z-40">
      {/* Logo */}
      <div className="p-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
          T
        </div>
        <span className="text-xl font-bold tracking-wide">Tradlyn</span>
      </div>

      {/* Add Trade & Add Account */}
      <div className="px-4 mb-6 space-y-3">
        <Button className="w-full bg-gradient-to-r from-[#7C3AED] to-[#DB2777] text-white font-semibold rounded-lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Trade
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveView("addAccount")}
          className="w-full border border-white/20 text-black hover:bg-white/10 font-semibold rounded-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <div key={index}>
            <div
              onClick={() => setActiveView(item.view as any)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                activeView === item.view
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-[10px] font-semibold bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Card */}
      <div className="p-4">
<div className="flex items-center bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-4 text-white shadow-lg">
  {/* Left column - 20% width */}
  <div className="w-1/5 flex justify-center">
    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
      <Avatar className="w-full h-full rounded-full">
        <AvatarImage src={preview || undefined} alt="User Avatar" />
        <AvatarFallback className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#DB2777] text-white text-xl">
          {user.name?.charAt(0) || user.email.charAt(0)}
        </AvatarFallback>
      </Avatar>
    </div>
  </div>

  {/* Right column - 80% width */}
  <div className="w-4/5 flex flex-col justify-center pl-4">
    <div className="text-lg font-semibold leading-tight">{formData.name || "Unnamed User"}</div>
    <div className="text-sm text-white/80 truncate">{user.email}</div>
  </div>
</div>

      </div>
    </aside>
  );
};

