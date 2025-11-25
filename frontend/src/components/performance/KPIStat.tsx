import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Sparkline } from "./Sparkline";
import { useEffect, useState } from "react";

interface KPIStatProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  sparklineData?: number[];
  color?: "profit" | "loss" | "primary" | "default";
}

export const KPIStat = ({ label, value, icon: Icon, trend, sparklineData, color = "default" }: KPIStatProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === "number" ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, ""));

  useEffect(() => {
    if (isNaN(numericValue)) return;
    
    const duration = 1000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [numericValue]);

  const colorClasses = {
    profit: "text-profit bg-profit/5 border-profit/20",
    loss: "text-loss bg-loss/5 border-loss/20",
    primary: "text-primary bg-primary/5 border-primary/20",
    default: "bg-card border-border"
  };

  const iconColorClasses = {
    profit: "text-profit",
    loss: "text-loss",
    primary: "text-primary",
    default: "text-muted-foreground"
  };

  return (
    <Card className={`px-6 py-4 rounded-2xl hover:scale-105 transition-all duration-200 min-w-[200px] border ${colorClasses[color]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 ${iconColorClasses[color]}`} />
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {typeof value === "string" && value.includes("$") 
              ? `$${displayValue.toFixed(2)}`
              : typeof value === "string" && value.includes("%")
              ? `${displayValue.toFixed(1)}%`
              : typeof value === "number"
              ? displayValue.toFixed(2)
              : value
            }
          </div>
        </div>
        {sparklineData && sparklineData.length > 0 && (
          <div className="flex-shrink-0">
            <Sparkline data={sparklineData} color={color} height={40} width={80} />
          </div>
        )}
      </div>
    </Card>
  );
};
