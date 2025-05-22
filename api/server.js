const express = require('express');
const { Server } = require('socket.io');
const { Kafka } = require('kafkajs');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Configure KafkaJS
const kafka = new Kafka({
    clientId: 'websocket-server',
    brokers: ['localhost:9092']
});

const consumer = kafka.consumer({ 
    groupId: 'websocket-consumer-group' 
});

// Function to start consuming messages
async function startKafkaConsumer() {
    try {
        await consumer.connect();
        await consumer.subscribe({ 
            topic: 'election-tweets-processed', 
            fromBeginning: true 
        });

        await consumer.run({
            eachMessage: async ({ topic, partition, message }) => {
                try {
                    const key = message.key ? message.key.toString() : null;
                    const value = message.value ? JSON.parse(message.value.toString()) : null;

                    if (value) {
                        const data = {
                            tweet_id: key,
                            ...value // Spread the sentiment data
                        };
                        console.log('Received message:', data); // Debug logging
                        io.emit('tweet_sentiment', data);
                    }
                } catch (error) {
                    console.error('Error processing message:', error);
                }
            },
        });
    } catch (error) {
        console.error('Error starting Kafka consumer:', error);
    }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Express route
app.get('/', (req, res) => {
    res.send('Tweet Sentiment Analysis WebSocket Server');
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running on port ${PORT}`);
    await startKafkaConsumer();
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Shutting down...');
    await consumer.disconnect();
    process.exit(0);
});