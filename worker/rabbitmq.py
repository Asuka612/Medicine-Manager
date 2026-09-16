import pika

RABBITMQ_HOST = "rabbitmq"
RABBITMQ_PORT = 5672

QUEUE_NAME = "medication_notifications"


def create_connection():
    credentials = pika.PlainCredentials(
        "guest",
        "guest"
    )

    parameters = pika.ConnectionParameters(
        host=RABBITMQ_HOST,
        port=RABBITMQ_PORT,
        credentials=credentials
    )

    return pika.BlockingConnection(parameters)