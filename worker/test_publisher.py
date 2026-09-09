import json
import pika

from rabbitmq import create_connection, QUEUE_NAME


connection = create_connection()
channel = connection.channel()

channel.queue_declare(
    queue=QUEUE_NAME,
    durable=True
)

message = {
    "receiver_email": "nguyenanhkhoa5057@gmail.com",
    "subject": "Test Medication Manager",
    "message": "RabbitMQ đang hoạt động."
}

channel.basic_publish(
    exchange="",
    routing_key=QUEUE_NAME,
    body=json.dumps(message),
    properties=pika.BasicProperties(
        delivery_mode=pika.DeliveryMode.Persistent
    )
)

print("Đã gửi message vào RabbitMQ.")

connection.close()