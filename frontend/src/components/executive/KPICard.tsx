import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEffect, useState } from "react";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  colorScheme?: "profit" | "loss" | "neutral";
  sparklineData?: number[];
}

export const KPICard = ({ label, value, icon: Icon, colorScheme = "neutral", sparklineData }: KPICardProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === "number" ? value : parseFloat(value.toString().replace(/[^0-9.-]/g, ""));

  useEffect(() => {
    if (isNaN(numericValue)) return;
    
    const duration = 1200;
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
    profit: "border-profit/30 bg-gradient-to-br from-profit/5 to-profit/10",
    loss: "border-loss/30 bg-gradient-to-br from-loss/5 to-loss/10",
    neutral: "border-border bg-card"
  };

  const iconColorClasses = {
    profit: "text-profit",
    loss: "text-loss",
    neutral: "text-primary"
  };

  const valueColorClasses = {
    profit: "text-profit",
    loss: "text-loss",
    neutral: "text-foreground"
  };

  const formatValue = () => {
    if (typeof value === "string") {
      if (value.includes("$")) return `$${Math.abs(displayValue).toFixed(2)}`;
      if (value.includes("%")) return `${displayValue.toFixed(1)}%`;
      if (value.includes(":")) return value; // Profit factor ratio
      return value;
    }
    return displayValue.toFixed(2);
  };

  return (
    <Card className={`p-5 rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${colorClasses[colorScheme]}`}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
          <Icon className={`h-5 w-5 ${iconColorClasses[colorScheme]}`} />
        </div>
        
        <div className={`text-3xl font-bold tracking-tight ${valueColorClasses[colorScheme]}`}>
          {formatValue()}
        </div>

        {sparklineData && sparklineData.length > 0 && (
          <div className="h-8">
            <svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
              <polyline
                points={sparklineData.map((val, i) => {
                  const x = (i / (sparklineData.length - 1)) * 100;
                  const max = Math.max(...sparklineData);
                  const min = Math.min(...sparklineData);
                  const range = max - min || 1;
                  const y = 30 - ((val - min) / range) * 30;
                  return `${x},${y}`;
                }).join(" ")}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={iconColorClasses[colorScheme]}
                opacity="0.5"
              />
            </svg>
          </div>
        )}
      </div>
    </Card>
  );
};
