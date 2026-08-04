import requests
import json

url = "http://localhost:8000/api/register"
image_path = r"C:\Users\Sarvesh Yadav\.gemini\antigravity\brain\be7b4c79-0c68-44f9-b10e-213d918e0f24\test_face_1785833039632.png"

with open(image_path, "rb") as f:
    files = {"file": ("test_face.png", f, "image/png")}
    data = {
        "name": "Test User",
        "uid": "TEST001",
        "course": "MCA AI&ML"
    }
    response = requests.post(url, data=data, files=files)
    print("Registration Response:")
    print(response.status_code)
    print(response.json())
