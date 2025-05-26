import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface Tweet {
  tweet_id: string
  tweet: string
  user_name: string
  user_handle: string
  createdAt: string
  processed_at: number
  sentiment: string
  sentiment_score: number
  candidate: string
}

interface CandidateStats {
  name: string
  positive: number
  negative: number
  neutral: number
}

interface CandidateComparisonProps {
  tweets: Tweet[]
}

export function CandidateComparison({ tweets }: CandidateComparisonProps) {
  // Process tweets to get sentiment counts per candidate
  const candidateStats = tweets.reduce((acc: { [key: string]: CandidateStats }, tweet) => {
    const candidate = tweet.candidate.charAt(0).toUpperCase() + tweet.candidate.slice(1)
    if (!acc[candidate]) {
      acc[candidate] = {
        name: candidate,
        positive: 0,
        negative: 0,
        neutral: 0
      }
    }

    const sentiment = tweet.sentiment.split(':')[0].toLowerCase()
    if (sentiment === 'positive') acc[candidate].positive++
    if (sentiment === 'negative') acc[candidate].negative++
    if (sentiment === 'neutral') acc[candidate].neutral++

    return acc
  }, {})

  const data = Object.values(candidateStats)

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