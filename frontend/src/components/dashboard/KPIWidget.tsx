import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPIWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  type?: 'profit' | 'loss' | 'neutral' | 'primary';
  icon?: React.ReactNode;
}

export const KPIWidget = ({ title, value, subtitle, type = 'neutral', icon }: KPIWidgetProps) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'profit':
        return 'text-profit border-profit/20 bg-profit/5';
      case 'loss':
        return 'text-loss border-loss/20 bg-loss/5';
      case 'primary':
        return 'text-primary border-primary/20 bg-primary/5';
      default:
        return 'text-foreground border-border bg-card';
    }
  };

  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'profit':
        return <TrendingUp className="h-5 w-5" />;
      case 'loss':
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Minus className="h-5 w-5" />;
    }
  };

  return (
    <Card className={`widget-card p-6 transition-all hover:scale-105 ${getTypeStyles()}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <div className="ml-4 opacity-60">
          {getIcon()}
        </div>
      </div>
    </Card>
  );
};