import smtplib

from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587

SENDER_EMAIL = "nguyenanhkhoa5115@gmail.com"
SENDER_PASSWORD = "cvvtyiykvadmevdt"

SENDER_PASSWORD = "".join(SENDER_PASSWORD.split())


def send_notification(data):
    receiver_email = data.get("receiver_email")
    subject = data.get("subject")
    message = data.get("message")

    email = MIMEMultipart()

    email["From"] = SENDER_EMAIL
    email["To"] = receiver_email
    email["Subject"] = subject

    email.attach(
        MIMEText(
            message,
            "plain",
            "utf-8"
        )
    )

    with smtplib.SMTP(
        SMTP_SERVER,
        SMTP_PORT
    ) as server:

        server.starttls()

        server.login(
            SENDER_EMAIL,
            SENDER_PASSWORD
        )

        server.send_message(email)

    print(f"Đã gửi email đến {receiver_email}")