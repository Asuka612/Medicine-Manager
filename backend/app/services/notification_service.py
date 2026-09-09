import json
import pika


RABBITMQ_HOST = "localhost"
RABBITMQ_PORT = 5672

QUEUE_NAME = "medication_notifications"


class NotificationService:

    @staticmethod
    def send_notification(
        receiver_email: str,
        subject: str,
        message: str
    ):
        credentials = pika.PlainCredentials(
            "guest",
            "guest"
        )

        parameters = pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            port=RABBITMQ_PORT,
            credentials=credentials
        )

        connection = pika.BlockingConnection(
            parameters
        )

        channel = connection.channel()

        channel.queue_declare(
            queue=QUEUE_NAME,
            durable=True
        )

        data = {
            "receiver_email": receiver_email,
            "subject": subject,
            "message": message
        }

        channel.basic_publish(
            exchange="",
            routing_key=QUEUE_NAME,
            body=json.dumps(
                data,
                ensure_ascii=False
            ).encode("utf-8"),
            properties=pika.BasicProperties(
                delivery_mode=pika.DeliveryMode.Persistent
            )
        )

        connection.close()

        print(
            f"Đã đưa notification vào RabbitMQ: "
            f"{receiver_email}"
        )