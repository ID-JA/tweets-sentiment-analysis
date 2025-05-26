import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Tweet {
  tweet_id: string;
  tweet: string;
  user_name: string;
  user_handle: string;
  createdAt: string;
  processed_at: number;
  sentiment: string;
  sentiment_score: number;
  candidate: string;
}

interface SentimentOverTimeProps {
  tweets: Tweet[];
}

export function SentimentOverTime({ tweets }: SentimentOverTimeProps) {
  const chartData = useMemo(() => {
    // Group tweets by minute intervals
    const groupedByTime = tweets.reduce(
      (acc: { [key: string]: any }, tweet) => {
        const date = new Date(tweet.createdAt);
        // Format as "YYYY-MM-DD HH:mm" for minute-level precision
        const timeKey = `${date.toISOString().slice(0, 16).replace("T", " ")}`;

        if (!acc[timeKey]) {
          acc[timeKey] = {
            timestamp: timeKey,
            positive: 0,
            negative: 0,
            neutral: 0,
            total: 0,
          };
        }

        const sentiment = tweet.sentiment.split(":")[0].toLowerCase();
        acc[timeKey][sentiment]++;
        acc[timeKey].total++;

        return acc;
      },
      {}
    );

    // Convert counts to percentages and sort by timestamp
    return Object.values(groupedByTime)
      .map((point) => ({
        timestamp: point.timestamp,
        positive: (point.positive / point.total) * 100,
        negative: (point.negative / point.total) * 100,
        neutral: (point.neutral / point.total) * 100,
      }))
      .sort(
        (a: any, b: any) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
  }, [tweets]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(timestamp) => {
            const date = new Date(timestamp);
            return `${date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })} ${date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          }}
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 11 }} // Add this line to make font smaller
        />
        <YAxis tickFormatter={(value) => `${Math.round(value)}%`} />
        <Tooltip
          formatter={(value: number) => `${Math.round(value)}%`}
          labelFormatter={(timestamp) => {
            const date = new Date(timestamp);
            return `${date.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })} ${date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}`;
          }}
        />
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(date) =>
            new Date(date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
          }
        />
        <YAxis tickFormatter={(value) => `${Math.round(value)}%`} />
        <Tooltip formatter={(value: number) => `${Math.round(value)}%`} />
        <Legend
          verticalAlign="top"
          height={36}
          wrapperStyle={{
            paddingBottom: "10px",
          }}
        />
        <Line
          type="monotone"
          dataKey="positive"
          stroke="#4ade80"
          name="Positive"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="negative"
          stroke="#f87171"
          name="Negative"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="neutral"
          stroke="#94a3b8"
          name="Neutral"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
