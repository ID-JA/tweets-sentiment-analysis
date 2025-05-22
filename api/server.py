from flask import Flask
from flask_socketio import SocketIO
from kafka import KafkaConsumer
import threading, json

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

def stream_kafka():
    consumer = KafkaConsumer(
        'election-tweets-processed',
        bootstrap_servers='localhost:9092',
        # Add auto_offset_reset to start from earliest messages when testing
        auto_offset_reset='earliest',
        # Add group_id for consumer group management
        group_id='websocket-consumer-group',
        # Configure key deserializer for tweet_id
        key_deserializer=lambda k: k.decode('utf-8') if k else None,
        value_deserializer=lambda m: json.loads(m.decode('utf-8')) if m else None
    )
    
    for message in consumer:
        try:
            if message.value:
                # Combine key (tweet_id) and value (sentiment data) into one object
                data = {
                    'tweet_id': message.key,
                    **message.value  # Unpack the sentiment data
                }
                print(f"Received message: {data}")  # Debug logging
                socketio.emit('tweet_sentiment', data)
        except json.JSONDecodeError as e:
            print(f"JSON decode error: {e}, Message: {message.value}")
        except Exception as e:
            print(f"Error processing message: {e}")

@app.route('/')
def index():
    return "Tweet Sentiment Analysis WebSocket Server"

if __name__ == '__main__':
    # Start Kafka consumer in a separate thread
    kafka_thread = threading.Thread(target=stream_kafka, daemon=True)
    kafka_thread.start()
    
    # Run Flask-SocketIO server
    socketio.run(app, host='0.0.0.0', port=5000, debug=True)