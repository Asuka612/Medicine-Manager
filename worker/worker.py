import json
import time

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
    while True:
        connection = None

        try:
            print(
                "Worker đang kết nối tới RabbitMQ..."
            )

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

        except KeyboardInterrupt:
            print(
                "Worker đã dừng."
            )
            break

        except Exception as error:
            print(
                f"Lỗi kết nối/Worker: {error}"
            )
            print(
                "RabbitMQ chưa sẵn sàng hoặc kết nối bị mất."
            )
            print(
                "Worker sẽ thử kết nối lại sau 5 giây..."
            )

            if connection is not None:
                try:
                    connection.close()
                except Exception:
                    pass

            time.sleep(5)


if __name__ == "__main__":
    start_worker()