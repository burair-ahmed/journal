import { createContext, useContext, useState, ReactNode } from "react";

type View =
  | "dashboard"
  | "dailyJournal"
  | "trades"
  | "notebook"
  | "playbook"
  | "reports"
  | "insights"
  | "backtesting"
  | "tradeReplay"
  | "challenges"
  | "mentorMode"
  | "menteeView"
  | "university"
  | "resourceCenter"
  | "addAccount"
  | "profile"
  | "addTrade"
  | "adminDashboard"
  | "adminUsers"
  | "adminUserDetail"
  | "adminAnalytics";

interface UIContextType {
  activeView: View;
  setActiveView: (view: View) => void;
  menteeViewId: string | null;
  setMenteeViewId: (id: string | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [menteeViewId, setMenteeViewId] = useState<string | null>(null);

  return (
    <UIContext.Provider value={{ activeView, setActiveView, menteeViewId, setMenteeViewId }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};
