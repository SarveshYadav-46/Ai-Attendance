import requests
import json

url = "http://localhost:8000/api/attendance"
image_path = r"C:\Users\Sarvesh Yadav\.gemini\antigravity\brain\be7b4c79-0c68-44f9-b10e-213d918e0f24\test_face_1785833039632.png"

with open(image_path, "rb") as f:
    files = {"file": ("test_face.png", f, "image/png")}
    response = requests.post(url, files=files)
    print("Attendance Response:")
    print(response.status_code)
    print(response.json())
