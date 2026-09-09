from app.services.notification_service import NotificationService


NotificationService.send_notification(
    receiver_email="nguyenanhkhoa5057@gmail.com",
    subject="Test từ Backend",
    message="Backend đã gửi notification qua RabbitMQ."
)

print("Test thành công.")