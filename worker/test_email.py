import smtplib

EMAIL = "nguyenanhkhoa5057@gmail.com"
APP_PASSWORD = "cvvtyiykvadmevdt"

APP_PASSWORD = "".join(APP_PASSWORD.split())

with smtplib.SMTP("smtp.gmail.com", 587) as server:
    server.starttls()
    server.login(EMAIL, APP_PASSWORD)

print("SMTP login OK")