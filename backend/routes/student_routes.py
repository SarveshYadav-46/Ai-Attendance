from fastapi import APIRouter, UploadFile, File, Form
from database import students_collection
from services.face_service import generate_embedding
import numpy as np
import cv2

router = APIRouter(prefix="/api")

VALID_COURSES = ["MCA AI&ML", "MCA", "MBA", "BCA", "BBA"]

@router.post("/register")
async def register_student(
    name: str = Form(...),
    uid: str = Form(...),
    course: str = Form(...),
    file: UploadFile = File(...)
):
    if course not in VALID_COURSES:
        return {"success": False, "message": f"Invalid course. Must be one of: {', '.join(VALID_COURSES)}"}

    existing = students_collection.find_one({"uid": uid})
    if existing:
        return {"success": False, "message": "Student already registered with this UID"}

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        return {"success": False, "message": "Invalid image format"}

    embedding = generate_embedding(image)
    if embedding is None:
        return {"success": False, "message": "No face detected in the image"}

    from datetime import datetime
    student = {
        "uid": uid,
        "name": name,
        "course": course,
        "embedding": embedding.tolist(),
        "createdAt": datetime.now().isoformat()
    }

    students_collection.insert_one(student)
    return {"success": True, "message": f"{name} registered successfully"}

@router.get("/students")
def get_students():
    students = list(students_collection.find({}, {"_id": 0, "embedding": 0}))
    return students

@router.delete("/students/{uid}")
def delete_student(uid: str):
    res = students_collection.delete_one({"uid": uid})
    if res.deleted_count > 0:
        return {"success": True, "message": "Student deleted successfully"}
    return {"success": False, "message": "Student not found"}