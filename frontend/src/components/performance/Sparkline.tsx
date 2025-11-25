interface SparklineProps {
  data: number[];
  color?: "profit" | "loss" | "primary" | "default";
  height?: number;
  width?: number;
}

export const Sparkline = ({ data, color = "default", height = 40, width = 100 }: SparklineProps) => {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");

  const colorMap = {
    profit: "#10b981",
    loss: "#ef4444",
    primary: "#ec4899",
    default: "#6b7280"
  };

  const gradientId = `gradient-${color}-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colorMap[color]} stopOpacity="0.3" />
          <stop offset="100%" stopColor={colorMap[color]} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#${gradientId})`}
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={colorMap[color]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
