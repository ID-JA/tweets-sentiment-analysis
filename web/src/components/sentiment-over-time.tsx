import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Sample data for sentiment over time
const data = [
  { date: "May 1", positive: 35, negative: 40, neutral: 25 },
  { date: "May 5", positive: 38, negative: 38, neutral: 24 },
  { date: "May 10", positive: 40, negative: 35, neutral: 25 },
  { date: "May 15", positive: 45, negative: 30, neutral: 25 },
  { date: "May 20", positive: 42, negative: 32, neutral: 26 },
  { date: "May 25", positive: 40, negative: 35, neutral: 25 },
  { date: "May 30", positive: 42, negative: 35, neutral: 23 },
]

export function SentimentOverTime() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="positive" stroke="#4ade80" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="negative" stroke="#f87171" />
        <Line type="monotone" dataKey="neutral" stroke="#94a3b8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
