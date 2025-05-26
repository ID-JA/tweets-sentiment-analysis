package org.octopustech.bolts;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.MongoException;
import com.mongodb.ServerApi;
import com.mongodb.ServerApiVersion;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import org.apache.storm.task.OutputCollector;
import org.apache.storm.task.TopologyContext;
import org.apache.storm.topology.OutputFieldsDeclarer;
import org.apache.storm.topology.base.BaseRichBolt;
import org.apache.storm.tuple.Tuple;
import org.apache.storm.tuple.Values;
import org.bson.Document;

import org.apache.storm.tuple.Fields;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class MongoBolt extends BaseRichBolt {
    private static final Logger LOGGER = LoggerFactory.getLogger(MongoBolt.class);
    private MongoClient mongoClient;
    private MongoCollection<Document> collection;
    private final List<String> fields;
    private OutputCollector collector;

    public MongoBolt(String fields) {
        this.fields = Arrays.asList(fields.split(","));
    }

    @Override
    public void prepare(Map<String, Object> topoConf, TopologyContext context, OutputCollector collector) {
        this.collector = collector;
        String dbName = "tweets_db";
        String collectionName = "election_sentiments";
        String connectionString = "mongodb+srv://username:password@cluster0.example.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

        try {
            // Setup MongoDB connection
            MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(new ConnectionString(connectionString))
                    .serverApi(ServerApi.builder().version(ServerApiVersion.V1).build())
                    .build();

            mongoClient = MongoClients.create(settings);
            MongoDatabase database = mongoClient.getDatabase(dbName);
            collection = database.getCollection(collectionName);

            // Test connection
            database.runCommand(new Document("ping", 1));
            LOGGER.info("✅ Connected to MongoDB Atlas.");
        } catch (MongoException e) {
            LOGGER.error("❌ Failed to connect to MongoDB: " + e.getMessage());
            throw new RuntimeException("MongoDB connection error", e);
        }
    }

    @Override
    public void execute(Tuple input) {
        String compoenentSource = input.getSourceComponent();

        System.out.println(compoenentSource
                + " 💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙💙");

        if (compoenentSource.equals("json-parser")) {
            System.out.println(
                    "🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢🤢");

            try {
            

                Document doc = new Document()
                        .append("created_at", parseDate(input.getValueByField("created_at")))
                        .append("tweet_id", input.getValueByField("tweet_id").toString())
                        .append("tweet", input.getValueByField("tweet").toString())
                        .append("likes", toInt(input.getValueByField("likes")))
                        .append("retweet_count", toInt(input.getValueByField("retweet_count")))
                        .append("source", input.getValueByField("source").toString())
                        .append("user_id", input.getValueByField("user_id").toString())
                        .append("user_name", input.getValueByField("user_name").toString())
                        .append("user_screen_name", input.getValueByField("user_screen_name").toString())
                        .append("user_join_date", parseDate(input.getValueByField("user_join_date")))
                        .append("user_followers_count", toInt(input.getValueByField("user_followers_count")))
                        .append("city", input.getValueByField("city").toString())
                        .append("country", input.getValueByField("country").toString())
                        .append("state", input.getValueByField("state").toString())
                        .append("state_code", input.getValueByField("state_code").toString())
                        .append("collected_at", parseDate(input.getValueByField("collected_at")))
                        .append("candidate", input.getValueByField("candidate").toString())
                        .append("processed_at", new Date());

                collection.insertOne(doc);
                LOGGER.info("✅ Document inserted successfully");
                LOGGER.info(input.getValues().toString());
                collector.emit(new Values(input.getValues().toArray()));
                collector.ack(input);
            } catch (Exception e) {
                LOGGER.error("⚠️ Failed to insert document: " + e.getMessage());
                collector.fail(input);
            }

        } else {
            System.out.println(
                    "💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜💜");

            try {
                String tweetId = input.getValueByField("tweet_id").toString();
                String sentiment = input.getValueByField("sentiment").toString();
                int sentimentScore = input.getIntegerByField("sentiment_score");

                Document filter = new Document("tweet_id", tweetId);
                Document update = new Document("$set", new Document()
                    .append("sentiment", sentiment)
                    .append("sentiment_score", sentimentScore));

                collection.updateOne(filter, update);
                LOGGER.info("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅ Sentiment score updated for tweet: " + tweetId);
                collector.ack(input);
            } catch (Exception e) {
                LOGGER.error("⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️ Failed to update sentiment score: " + e.getMessage());
                collector.fail(input);
            }
        }
    }

    @Override
    public void cleanup() {
        if (mongoClient != null) {
            mongoClient.close();
        }
    }

    @Override
    public void declareOutputFields(OutputFieldsDeclarer declarer) {
        declarer.declare(new Fields(fields));
    }

    private int toInt(Object value) {
        if (value instanceof Integer)
            return (Integer) value;
        if (value instanceof Long)
            return ((Long) value).intValue();
        if (value instanceof Double)
            return ((Double) value).intValue();
        if (value instanceof String)
            return (int) Double.parseDouble((String) value);
        throw new IllegalArgumentException("Cannot convert to int: " + value);
    }

    private Date parseDate(Object value) {
        if (value instanceof String) {
            return Date.from(OffsetDateTime.parse((String) value).toInstant());
        } else if (value instanceof Date) {
            return (Date) value;
        } else {
            throw new IllegalArgumentException("Cannot parse date from: " + value);
        }
    }
}
