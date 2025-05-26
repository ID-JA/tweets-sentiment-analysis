import { memo, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SentimentDistributionProps {
  sentimentCounts: {
    positive: number;
    negative: number;
    neutral: number;
  }
}

const COLORS = ["#4ade80", "#f87171", "#94a3b8"];

function SentimentDistributionBase({ sentimentCounts }: SentimentDistributionProps) {
  const data = useMemo(() => [
    { name: "Positive", value: sentimentCounts.positive },
    { name: "Negative", value: sentimentCounts.negative },
    { name: "Neutral", value: sentimentCounts.neutral },
  ], [sentimentCounts.positive, sentimentCounts.negative, sentimentCounts.neutral]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export const SentimentDistribution = memo(SentimentDistributionBase);