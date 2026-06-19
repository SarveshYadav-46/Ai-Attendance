from fastapi import APIRouter, UploadFile, File
from database import students_collection, attendance_collection
from services.face_service import generate_embedding, compare_faces
from datetime import datetime
import numpy as np
import cv2

router = APIRouter(prefix="/api")

VALID_COURSES = ["MCA AI&ML", "MCA", "MBA", "BCA", "BBA"]

@router.post("/attendance")
async def mark_attendance(file: UploadFile = File(...)):
    today = datetime.now().strftime("%Y-%m-%d")

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        return {"success": False, "message": "Invalid image format"}

    new_embedding = generate_embedding(image)
    if new_embedding is None:
        return {"success": False, "message": "No face detected"}

    students = list(students_collection.find({}))
    if not students:
        return {"success": False, "message": "No students registered"}

    best_match = None
    highest_similarity = -1

    for student in students:
        stored_embedding = np.array(student["embedding"])
        similarity = compare_faces(new_embedding, stored_embedding)
        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = student

    if best_match and highest_similarity > 0.4:
        uid = best_match["uid"]
        already_marked = attendance_collection.find_one({
            "uid": uid,
            "date": today
        })

        if already_marked:
            return {
                "success": False,
                "message": f"Attendance already marked for {best_match['name']}",
                "student": {
                    "name": best_match["name"],
                    "uid": uid,
                    "course": best_match.get("course", "N/A")
                }
            }

        attendance_collection.insert_one({
            "uid": uid,
            "name": best_match["name"],
            "course": best_match.get("course", "N/A"),
            "date": today,
            "time": datetime.now().strftime("%H:%M:%S"),
            "status": "Present"
        })
        return {
            "success": True,
            "message": f"Attendance marked for {best_match['name']}",
            "student": {
                "name": best_match["name"],
                "uid": uid,
                "course": best_match.get("course", "N/A")
            }
        }

    return {"success": False, "message": "Face not recognized. Please try again."}


@router.get("/attendance")
def get_attendance(course: str = None, date: str = None):
    query = {}
    if course and course != "All":
        query["course"] = course
    if date:
        query["date"] = date

    records = list(attendance_collection.find(query, {"_id": 0}))
    return records



@router.get("/history")
def get_history(name: str = None, uid: str = None, course: str = None, date: str = None):
    query = {}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    if uid:
        query["uid"] = {"$regex": uid, "$options": "i"}
    if course and course != "All":
        query["course"] = course
    if date:
        query["date"] = date

    records = list(attendance_collection.find(query, {"_id": 0}))
    # Sort by date and time descending
    records.sort(key=lambda x: (x.get("date", ""), x.get("time", "")), reverse=True)
    return records