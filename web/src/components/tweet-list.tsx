import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

// Sample tweet data
const tweets = [
  {
    id: 1,
    user: {
      name: "Alex Johnson",
      handle: "@alexj",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "The new policy proposal from Candidate A seems promising for economic growth! #Election2024",
    timestamp: "2 hours ago",
    sentiment: "positive",
    score: 0.87,
  },
  {
    id: 2,
    user: {
      name: "Sam Rivera",
      handle: "@samr",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Disappointed by the debate performance last night. No real solutions offered. #Election2024",
    timestamp: "5 hours ago",
    sentiment: "negative",
    score: 0.72,
  },
  {
    id: 3,
    user: {
      name: "Jordan Lee",
      handle: "@jlee",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Just watched the candidates discuss climate policy. Interesting perspectives from both sides. #Election2024",
    timestamp: "1 day ago",
    sentiment: "neutral",
    score: 0.51,
  },
  {
    id: 4,
    user: {
      name: "Taylor Morgan",
      handle: "@tmorgan",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "The infrastructure plan announced today could create thousands of jobs! This is exactly what we need. #Election2024",
    timestamp: "1 day ago",
    sentiment: "positive",
    score: 0.92,
  },
  {
    id: 5,
    user: {
      name: "Casey Kim",
      handle: "@ckim",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Tax policy proposals from both candidates are terrible. Middle class will suffer either way. #Election2024",
    timestamp: "2 days ago",
    sentiment: "negative",
    score: 0.88,
  },
];

export function TweetList({ tweets }) {
  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <div key={tweet.tweet_id} className="border rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage
                src={"placeholder.svg?height=40&width=40"}
                alt={tweet.user_name}
              />
              <AvatarFallback>{tweet.user_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{tweet.user_name}</span>
                <span className="text-sm text-muted-foreground">
                  @{tweet.user_handle}
                </span>
                <span className="text-xs text-muted-foreground">
                  • {timeAgo(tweet.processed_at, { withAgo: true })}
                </span>
              </div>
              <p>{tweet.tweet}</p>
              <div className="flex items-center gap-2 pt-1">
                <Badge
                  variant={
                    tweet.sentiment.split(":")[0].toLowerCase() === "positive"
                      ? "success"
                      : tweet.sentiment.split(":")[0].toLowerCase() ===
                        "negative"
                      ? "destructive"
                      : "secondary"
                  }
                  className={
                    tweet.sentiment.split(":")[0].toLowerCase() === "positive"
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : tweet.sentiment.split(":")[0].toLowerCase() ===
                        "negative"
                      ? "bg-red-100 text-red-800 hover:bg-red-100"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                  }
                >
                  {tweet.sentiment.split(":")[0]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Score: {tweet.sentiment.split(":")[1]}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
