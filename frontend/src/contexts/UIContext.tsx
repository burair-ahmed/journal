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
  | "university"
  | "resourceCenter"
  | "addAccount"
  | "profile"
  | "addTrade"
  ;

interface UIContextType {
  activeView: View;
  setActiveView: (view: View) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [activeView, setActiveView] = useState<View>("dashboard");

  return (
    <UIContext.Provider value={{ activeView, setActiveView }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used within UIProvider");
  return context;
};
