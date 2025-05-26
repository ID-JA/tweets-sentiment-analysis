import { useEffect, useMemo, useState } from "react";
import io from "socket.io-client";
import debounce from "lodash.debounce";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SentimentOverTime } from "@/components/sentiment-over-time";
import { SentimentDistribution } from "@/components/sentiment-distribution";
import { TweetList } from "@/components/tweet-list";
import { CandidateComparison } from "@/components/candidate-comparison";
import { TopicFilter } from "@/components/topic-filter";
import { Badge } from "./components/badge";

// Define TypeScript interfaces
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

// Initialize socket connection
const socket = io("http://192.168.1.12:5000", {
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttempts: 10,
  transports: ["websocket"],
  agent: false,
  upgrade: false,
  rejectUnauthorized: false,
});

function App() {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [total, setTotal] = useState(0);
  const [sentimentCounts, setSentimentCounts] = useState({
    positive: 0,
    negative: 0,
    neutral: 0,
  });

  // Calculate percentages
  const getPercentage = (count: number) => {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  const debouncedSetSentimentCounts = useMemo(
    () =>
      debounce((newCounts) => {
        setSentimentCounts(newCounts);
      }, 500),
    []
  );

  useEffect(() => {
    // Socket connection handlers
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to WebSocket");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from WebSocket");
    });

    socket.on("tweet_sentiment", (data: Tweet) => {
      setTweets((prev) => [data, ...prev]);
      setTotal((prevTotal) => prevTotal + 1);

      // Update sentiment counts with debouncing
      const sentiment = data.sentiment.split(":")[0].toLowerCase();
      debouncedSetSentimentCounts((prev) => ({
        ...prev,
        [sentiment]: prev[sentiment] + 1,
      }));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("tweet_sentiment");
      debouncedSetSentimentCounts.cancel();
    };
  }, [debouncedSetSentimentCounts]);
  console.log({ tweets });

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between py-4">
          <Badge variant={isConnected ? "success" : "destructive"}>
            {isConnected ? "Connected" : "Disconnected"}{" "}
          </Badge>
          <h1 className="text-xl font-bold">
            Election Tweet Sentiment Analysis
          </h1>
          <div></div>
        </div>
      </header>
      <main className="flex-1 container py-6 mx-auto">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="candidates">Candidates</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Tweets Analyzed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{total}</div>
                  <p className="text-xs text-muted-foreground">
                    Total tweets analyzed in this session
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Positive Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getPercentage(sentimentCounts.positive)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on {sentimentCounts.positive} tweets
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Neutral Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getPercentage(sentimentCounts.neutral)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on {sentimentCounts.neutral} tweets
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Negative Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {getPercentage(sentimentCounts.negative)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on {sentimentCounts.negative} tweets
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Sentiment Over Time</CardTitle>
                  <CardDescription>
                    Tweet sentiment trends over the past 30 days
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <SentimentOverTime tweets={tweets} />
                </CardContent>
              </Card>
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Sentiment Distribution</CardTitle>
                  <CardDescription>
                    Overall distribution of tweet sentiments
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[350px]">
                  <SentimentDistribution sentimentCounts={sentimentCounts} />
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Recent Tweets</CardTitle>
                <CardDescription>
                  Sample tweets with sentiment analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-scroll">
                <TweetList tweets={tweets} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="candidates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Candidate Sentiment Comparison</CardTitle>
                <CardDescription>
                  Comparing sentiment across major candidates
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <CandidateComparison tweets={tweets} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="topics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Topic Analysis</CardTitle>
                <CardDescription>
                  Sentiment breakdown by election topics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                  Topic analysis visualization would appear here
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
