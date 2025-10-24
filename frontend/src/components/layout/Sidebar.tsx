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
import { MoreVertical, LogOut, User as UserIcon } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export const Sidebar = () => {
  const { activeView, setActiveView } = useUI();
  const { user, setUser, loading, logout } = useAuthContext();
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
    {/* Bottom Card */}
<div className="p-4">
  <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-4 text-white shadow-lg">
    {/* Left Side: Avatar + Info */}
    <div className="flex items-center min-w-0"> {/* min-w-0 ensures truncate works */}
      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
        <Avatar className="w-full h-full rounded-full">
          <AvatarImage src={preview || undefined} alt="User Avatar" />
          <AvatarFallback className="rounded-full bg-gradient-to-r from-[#7C3AED] to-[#DB2777] text-white text-xl">
            {user.name?.charAt(0) || user.email.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="ml-4 flex flex-col overflow-hidden">
        <div className="text-lg font-semibold leading-tight">
          {formData.name || "Unnamed User"}
        </div>
        <div className="text-sm text-white/80 truncate max-w-[130px] sm:max-w-[150px]">
          {user.email}
        </div>
      </div>
    </div>

    {/* Right Side: Popover Menu */}
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
          <MoreVertical className="w-5 h-5 text-white" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        className="w-40 bg-[#17193C] text-white border border-white/10 shadow-lg rounded-xl p-2"
      >
        <button
          onClick={() => setActiveView("profile")}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
        >
          <UserIcon className="w-4 h-4 text-white/80" />
          <span className="text-sm">Profile</span>
        </button>
        <button
          onClick={() => {
            logout;
            setUser(null);
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
        >
          <LogOut className="w-4 h-4 text-white/80" />
          <span className="text-sm">Logout</span>
        </button>
      </PopoverContent>
    </Popover>
  </div>
</div>
    </aside>
  );
};

