import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Info } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  progress?: number;
  showInfo?: boolean;
  className?: string;
}

export const MetricCard = ({ title, value, subtitle, progress, showInfo, className }: MetricCardProps) => {
  return (
    <Card className={`p-4 border-dashed border-2 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {showInfo && <Info className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="text-2xl font-bold text-profit mb-1">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground">{subtitle}</div>}
      {progress !== undefined && (
        <div className="mt-3">
          <Progress value={progress} className="h-2" />
        </div>
      )}
    </Card>
  );
};