package org.octopustech;

import java.util.Properties;

import org.apache.storm.Config;
import org.apache.storm.LocalCluster;
import org.apache.storm.StormSubmitter;
import org.apache.storm.kafka.spout.KafkaSpout;
import org.apache.storm.kafka.spout.KafkaSpoutConfig;
import org.apache.storm.kafka.bolt.KafkaBolt;
import org.apache.storm.kafka.bolt.mapper.FieldNameBasedTupleToKafkaMapper;
import org.apache.storm.kafka.spout.FirstPollOffsetStrategy;
import org.apache.storm.topology.TopologyBuilder;

import org.octopustech.bolts.SentimentBolt;
import org.octopustech.bolts.JsonParsingBolt;
import org.octopustech.bolts.MongoBolt;

public class TwitterStormTopology {
      public static void main(String[] args) throws Exception {
        String kafkaBootstrapServers = "localhost:9092";
        String kafkaTopic = "election-tweets";
        
        String fields = "created_at,tweet_id,tweet,likes,retweet_count,source," +
                "user_id,user_name,user_screen_name,user_join_date,user_followers_count," +
                "city,country,state,state_code,collected_at";

        // Kafka Spout Config
        KafkaSpoutConfig<String, String> kafkaSpoutConfig = KafkaSpoutConfig.builder(kafkaBootstrapServers, kafkaTopic)
            .setProp("group.id", "storm-consumer-group")
            .setProp("key.deserializer", "org.apache.kafka.common.serialization.StringDeserializer")
            .setProp("value.deserializer", "org.apache.kafka.common.serialization.StringDeserializer")
            .setFirstPollOffsetStrategy(FirstPollOffsetStrategy.LATEST)
            .build();
            // .setMaxUncommittedOffsets(1)
            // .setOffsetCommitPeriodMs(1000)

        KafkaSpout<String, String> kafkaSpout = new KafkaSpout<>(kafkaSpoutConfig);

        // Build the topology
        TopologyBuilder builder = new TopologyBuilder();

        builder.setSpout("kafka-spout", kafkaSpout);  // Increased to 2 for better kafka consumption
        builder.setBolt("json-parser", new JsonParsingBolt(fields)).shuffleGrouping("kafka-spout");
        builder.setBolt("persist-tweets-mongo", new MongoBolt(fields)).shuffleGrouping("json-parser");
        builder.setBolt("sentiment-bolt", new SentimentBolt()).shuffleGrouping("persist-tweets-mongo");
        builder.setBolt("update-tweets-sentiment-mongo", new MongoBolt("")).shuffleGrouping("sentiment-bolt");

        Properties props = new Properties();
        props.put("bootstrap.servers", "localhost:9092");
        props.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
        props.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");

        KafkaBolt<String, String> kafkaBolt = new KafkaBolt<String, String>()
            .withProducerProperties(props)
            .withTopicSelector("election-tweets-processed")
            .withTupleToKafkaMapper(new FieldNameBasedTupleToKafkaMapper<>("key", "value"));

        builder.setBolt("kafka-sink", kafkaBolt).shuffleGrouping("sentiment-bolt");



        Config config = new Config();
        config.setDebug(false);

        if (args != null && args.length > 0) {
            // Cluster deployment
            StormSubmitter.submitTopology(args[0], config, builder.createTopology());
        } else {
            // Local mode (for testing)
            try (LocalCluster cluster = new LocalCluster()) {
                cluster.submitTopology("tweet-sentiment-topology", config, builder.createTopology());
                // // Run for 10 mins then shutdown (optional)
                Thread.sleep(3600000);
                cluster.killTopology("tweet-sentiment-topology");
            }
        }
    }  
}
