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
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: BarChart3, label: "Dashboard", active: true },
  { icon: BookOpen, label: "Daily Journal" },
  { icon: Users, label: "Trades" },
  { icon: Notebook, label: "Notebook" },
  { icon: Book, label: "Playbook" },
  { icon: FileText, label: "Reports" },
  { icon: Zap, label: "Insights" },
  { icon: User, label: "Backtesting", badge: "PRO" },
  { icon: FileText, label: "Trade Replay" },
  { icon: GraduationCap, label: "Challenges", badge: "PRO" },
  { icon: User, label: "Mentor Mode" },
  { icon: GraduationCap, label: "University" },
  { icon: Globe, label: "Resource Center" },
];

export const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-sidebar text-black flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-black font-bold text-sm">T</span>
          </div>
          <span className="text-xl font-bold text-black">TRADEZELLA</span>
        </div>
      </div>

      {/* Add Trade Button */}
      <div className="px-4 mb-6">
        <Button className="w-full bg-primary hover:bg-primary/90 text-black">
          <Plus className="h-4 w-4 mr-2" />
          Add Trade
        </Button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-4 space-y-1">
        {menuItems.map((item, index) => (
          <div key={index} className="relative">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
              item.active ? 'bg-primary text-black' : 'hover:bg-sidebar-foreground/10'
            }`}>
              <item.icon className="h-5 w-5 text-black" />
              <span className="font-medium text-black">{item.label}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </div>
          </div>
        ))}
      </nav>

      {/* Trading Queen */}
      <div className="p-4">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-4 text-center">
          <div className="w-10 h-10 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center">
            <span className="text-black font-bold">👑</span>
          </div>
          <div className="text-black text-sm font-medium">Trading Queen</div>
        </div>
      </div>
    </div>
  );
};