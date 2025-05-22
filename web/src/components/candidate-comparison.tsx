import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

// Sample data for candidate comparison
const data = [
  {
    name: "Candidate A",
    positive: 45,
    negative: 30,
    neutral: 25,
  },
  {
    name: "Candidate B",
    positive: 38,
    negative: 42,
    neutral: 20,
  },
  {
    name: "Candidate C",
    positive: 30,
    negative: 35,
    neutral: 35,
  },
  {
    name: "Candidate D",
    positive: 42,
    negative: 28,
    neutral: 30,
  },
]

export function CandidateComparison() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="positive" stackId="a" fill="#4ade80" name="Positive" />
        <Bar dataKey="negative" stackId="a" fill="#f87171" name="Negative" />
        <Bar dataKey="neutral" stackId="a" fill="#94a3b8" name="Neutral" />
      </BarChart>
    </ResponsiveContainer>
  )
}
