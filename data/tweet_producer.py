from kafka import KafkaProducer
import pandas as pd
import json
import time
import random

KAFKA_BROKER = 'localhost:9092'
TOPIC = 'election-tweets'
BIDEN_FILE = './output_biden/biden_tweets.json'
TRUMP_FILE = './output_trump/trump_tweets.json'

producer = KafkaProducer(
    bootstrap_servers=KAFKA_BROKER,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

def load_and_prepare_data():
    biden_df = pd.read_json(BIDEN_FILE, lines=True, nrows=1500)
    trump_df = pd.read_json(TRUMP_FILE, lines=True, nrows=1500)

    biden_df['candidate'] = 'biden'
    trump_df['candidate'] = 'trump'

    df = pd.concat([biden_df, trump_df], ignore_index=True)
    df = df.sample(frac=1).reset_index(drop=True)

    return df


def convert_date(value):
    if pd.isna(value):
        return NULL
    if isinstance(value, str):
        return value
    if hasattr(value, 'isoformat'):
        return value.isoformat()
    return str(value)


def serialize_row(row):
    row_dict = row.to_dict()
    # Convert datetime objects to ISO format strings
    for key, value in row_dict.items():
        if isinstance(value, (pd.Timestamp, pd.DatetimeTZDtype)):
            row_dict[key] = convert_date(value)
    return row_dict

def stream_tweets(df):
    counter = 0
    # df = pd.read_json("./sample.json", lines=True)
    # NULL = None
    df['user_location'] = "Unknow"
    df['lat'] = 0
    df['long'] = 0
    df['country'] = "Unknow"
    df['continent'] = "Unkonw"
    df['state'] = "Unkonw"
    df['state_code'] = 0
    df['city'] = "Unkonw"
    for _, row in df.iterrows():
        counter += 1
        # Convert the row to a dictionary before sending
        row_data = serialize_row(row)
        print(row_data)
        producer.send(TOPIC, row_data)
        print(f"[SENT] [{row_data.get('candidate', 'N/A').upper()}] {row_data.get('tweet', 'No tweet')}")
        print(f"Item {counter}")
        time.sleep(0.5)


if __name__ == '__main__':
    df = load_and_prepare_data()
    stream_tweets(df)
