package org.octopustech.bolts;

import edu.stanford.nlp.pipeline.*;
import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.neural.rnn.RNNCoreAnnotations;
import edu.stanford.nlp.sentiment.SentimentCoreAnnotations;
import edu.stanford.nlp.trees.Tree;
import edu.stanford.nlp.util.CoreMap;
import org.apache.storm.tuple.Fields;

import org.apache.storm.task.OutputCollector;
import org.apache.storm.task.TopologyContext;
import org.apache.storm.topology.OutputFieldsDeclarer;
import org.apache.storm.topology.base.BaseRichBolt;
import org.apache.storm.tuple.Tuple;
import org.apache.storm.tuple.Values;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Set;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import org.apache.commons.text.similarity.LevenshteinDistance;

public class SentimentBolt extends BaseRichBolt {
    private static final Logger LOGGER = LoggerFactory.getLogger(SentimentBolt.class);
    private OutputCollector collector;
    private StanfordCoreNLP pipeline;
    private ObjectMapper mapper;

    private static final List<String> candidates = Arrays.asList(
            "Biden", "Trump", "RFK", "Kennedy", "Nikki Haley", "Vivek", "DeSantis", "Donald", "Joe Biden");

    @Override
    public void prepare(Map<String, Object> arg0, TopologyContext arg1, OutputCollector collector) {
        this.collector = collector;

        this.mapper = new ObjectMapper();
        // Setup CoreNLP properties for sentiment
        Properties props = new Properties();
        props.setProperty("annotators", "tokenize,ssplit,pos,parse,sentiment");
        this.pipeline = new StanfordCoreNLP(props);
    }

    @Override
    public void execute(Tuple input) {
        try {
            String tweetId = input.getValueByField("tweet_id").toString();
            String tweet = input.getStringByField("tweet");
            String userName = input.getStringByField("user_name");
            String userHandle = input.getStringByField("user_screen_name");
            String createdAt = input.getStringByField("collected_at");

            String cleaned_tweet = cleanText(tweet);

            String sentiment = getSentiment(cleaned_tweet);
            int sentimentScore = getSentimentScore(cleaned_tweet);
            System.out.printf(
                    "😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶😶");
            String candidate = detectCandidateWithNERAndFuzzy(cleaned_tweet);

            // Create JSON object
            ObjectNode jsonNode = mapper.createObjectNode();
            jsonNode.put("tweet_id", tweetId);
            jsonNode.put("tweet", tweet);
            jsonNode.put("tweet", tweet);
            jsonNode.put("user_name", userName);
            jsonNode.put("user_handle", userHandle);
            jsonNode.put("createdAt", createdAt);
            jsonNode.put("processed_at", System.currentTimeMillis());
            jsonNode.put("sentiment", sentiment);
            jsonNode.put("sentiment_score", sentimentScore);
            jsonNode.put("candidate", candidate);


            String jsonString = mapper.writeValueAsString(jsonNode);

            // Emit the JSON string as the value
            collector.emit(new Values(tweetId, jsonString));
            collector.ack(input);
        } catch (Exception e) {
            LOGGER.error("Failed to process sentiment {}", e.getMessage());
            LOGGER.info("🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁\n🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁🏁");
        }
    }

    private String detectCandidateWithNER(String text) {
        Annotation document = new Annotation(text);
        pipeline.annotate(document);

        Set<String> matchedCandidates = new HashSet<>();

        for (CoreMap sentence : document.get(CoreAnnotations.SentencesAnnotation.class)) {
            for (CoreLabel token : sentence.get(CoreAnnotations.TokensAnnotation.class)) {
                String word = token.word();
                String ner = token.get(CoreAnnotations.NamedEntityTagAnnotation.class);

                if ("PERSON".equals(ner)) {
                    for (String candidate : candidates) {
                        if (word.equalsIgnoreCase(candidate) || candidate.toLowerCase().contains(word.toLowerCase())) {
                            matchedCandidates.add(candidate);
                        }
                    }
                }
            }
        }

        if (!matchedCandidates.isEmpty()) {
            return matchedCandidates.iterator().next(); // Return the first matched candidate
        }

        return "Unknown";
    }

    private String detectCandidateWithNERAndFuzzy(String text) {
        String nerCandidate = detectCandidateWithNER(text);
        if (!"Unknown".equals(nerCandidate)) {
            return nerCandidate;
        }

        LevenshteinDistance distance = LevenshteinDistance.getDefaultInstance();
        int minDistance = Integer.MAX_VALUE;
        String bestMatch = "Unknown";

        for (String candidate : candidates) {
            int dist = distance.apply(candidate.toLowerCase(), text.toLowerCase());
            if (dist < minDistance && dist < 5) { // Threshold
                minDistance = dist;
                bestMatch = candidate;
            }
        }

        return bestMatch;
    }

    @Override
    public void declareOutputFields(OutputFieldsDeclarer declarer) {
        // Declare fields for key and value that KafkaBolt expects
        declarer.declare(new Fields("key", "value"));
    }

    private int getSentimentScore(String text) {
        Annotation annotation = new Annotation(text);
        pipeline.annotate(annotation);

        java.util.List<CoreMap> sentences = annotation.get(CoreAnnotations.SentencesAnnotation.class);

        if (!sentences.isEmpty()) {
            CoreMap sentence = sentences.get(0);
            Tree tree = sentence.get(SentimentCoreAnnotations.SentimentAnnotatedTree.class);
            int sentimentScore = RNNCoreAnnotations.getPredictedClass(tree);
            return sentimentScore; // 0: Very Negative, 1: Negative, 2: Neutral, 3: Positive, 4: Very Positive
        }

        return 2; // Default to Neutral
    }

    private String getSentiment(String text) {
        Annotation annotation = new Annotation(text);
        pipeline.annotate(annotation);

        java.util.List<CoreMap> sentences = annotation.get(CoreAnnotations.SentencesAnnotation.class);

        String sentiment = "neutral";
        double score = 0.0;
        if (!sentences.isEmpty()) {
            CoreMap sentence = sentences.get(0);
            sentiment = sentence.get(SentimentCoreAnnotations.SentimentClass.class);
            edu.stanford.nlp.neural.rnn.RNNCoreAnnotations
                    .getPredictedClass(sentence.get(SentimentCoreAnnotations.SentimentAnnotatedTree.class));
            score = edu.stanford.nlp.neural.rnn.RNNCoreAnnotations.getPredictedClass(
                    sentence.get(SentimentCoreAnnotations.SentimentAnnotatedTree.class)) / 4.0; // Normalize to 0-1
                                                                                                // range
        }

        // Combine sentiment and score
        sentiment = sentiment + ":" + String.format("%.2f", score);

        return sentiment;
    }

    private String cleanText(String text) {
        return text
                .replaceAll("http\\S+|www\\S+", "") // URLs
                .replaceAll("@(?!realDonaldTrump|JoeBiden)\\w+", "") // Mentions except Trump and Biden
                .replaceAll("#", "") // Hashtag symbols
                .replaceAll("[^a-zA-Z\\s]", "") // Non-letter characters
                .replaceAll("\\s+", " ") // Extra whitespace
                .trim()
                .toLowerCase();
    }
}
