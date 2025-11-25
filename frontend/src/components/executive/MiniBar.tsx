interface MiniBarProps {
  value: number;
  maxValue: number;
  color?: "profit" | "loss" | "neutral";
  height?: number;
}

export const MiniBar = ({ value, maxValue, color = "neutral", height = 40 }: MiniBarProps) => {
  const percentage = maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;
  const barHeight = (percentage / 100) * height;

  const colorMap = {
    profit: "#10b981",
    loss: "#ef4444",
    neutral: "#6b7280"
  };

  return (
    <svg width="12" height={height} className="inline-block">
      <rect
        x="0"
        y={height - barHeight}
        width="12"
        height={barHeight}
        fill={colorMap[color]}
        rx="2"
      />
    </svg>
  );
};
