import json

from rabbitmq import create_connection, QUEUE_NAME
from notification import send_notification


def callback(
    channel,
    method,
    properties,
    body
):
    try:
        data = json.loads(
            body.decode("utf-8")
        )

        print("Đã nhận message từ RabbitMQ.")

        send_notification(data)

        channel.basic_ack(
            delivery_tag=method.delivery_tag
        )

    except Exception as error:
        print(
            f"Lỗi xử lý message: {error}"
        )


def start_worker():
    connection = create_connection()

    channel = connection.channel()

    channel.queue_declare(
        queue=QUEUE_NAME,
        durable=True
    )

    channel.basic_qos(
        prefetch_count=1
    )

    channel.basic_consume(
        queue=QUEUE_NAME,
        on_message_callback=callback
    )

    print(
        "Worker đang chờ notification..."
    )

    channel.start_consuming()


if __name__ == "__main__":
    start_worker()