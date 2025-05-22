package org.octopustech.bolts;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.storm.task.OutputCollector;
import org.apache.storm.task.TopologyContext;
import org.apache.storm.topology.OutputFieldsDeclarer;
import org.apache.storm.topology.base.BaseRichBolt;
import org.apache.storm.tuple.Fields;
import org.apache.storm.tuple.Tuple;
import org.apache.storm.tuple.Values;


import com.fasterxml.jackson.core.json.JsonReadFeature;

public class JsonParsingBolt extends BaseRichBolt {
    private static final Logger LOGGER = Logger.getLogger(JsonParsingBolt.class.getName());
    private OutputCollector collector;
    private final List<String> fields;
    private ObjectMapper mapper;

    public JsonParsingBolt(String fields) {
        this.fields = Arrays.asList(fields.split(","));
    }

    @Override
    public void prepare(Map<String, Object> config, TopologyContext context, OutputCollector collector) {
        this.collector = collector;
        // Configure ObjectMapper to handle NaN values
        this.mapper = new ObjectMapper()
            .enable(JsonReadFeature.ALLOW_NON_NUMERIC_NUMBERS.mappedFeature());
    }

    @Override
    public void execute(Tuple tuple) {
        try {
            String record = tuple.getStringByField("value");
            System.out.println("❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️❤️");
            // Parse JSON with configured mapper
            Map<String, Object> map = mapper.readValue(record, new TypeReference<Map<String, Object>>() {});

            // Build the tuple values
            List<Object> outputValues = new ArrayList<>();
            for (String field : fields) {
                outputValues.add(map.get(field));
            }

            collector.emit(new Values(outputValues.toArray()));
            collector.ack(tuple);
        } catch (Exception e) {
            LOGGER.log(Level.SEVERE, "Error parsing JSON: " + e.getMessage(), e);
            this.collector.fail(tuple);
        }
    }

    @Override
    public void declareOutputFields(OutputFieldsDeclarer declarer) {
        declarer.declare(new Fields(fields));
    }
}