from fastapi import APIRouter, UploadFile, File
from database import students_collection, attendance_collection
from services.face_service import generate_embedding, compare_faces
from datetime import datetime, timedelta
import numpy as np
import cv2
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api")

VALID_COURSES = ["MCA AI&ML", "MCA", "MBA", "BCA", "BBA"]


@router.post("/attendance")
async def mark_attendance(file: UploadFile = File(...)):
    today = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M:%S")

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        return {"success": False, "message": "Invalid image format. Please try again."}

    new_embedding = generate_embedding(image)
    if new_embedding is None:
        return {"success": False, "message": "No face detected. Please look directly at the camera."}

    students = list(students_collection.find({}))
    if not students:
        return {"success": False, "message": "No students registered in the system. Please register students first."}

    best_match = None
    highest_similarity = -1

    for student in students:
        if "embedding" not in student:
            continue
        stored_embedding = np.array(student["embedding"])
        similarity = compare_faces(new_embedding, stored_embedding)
        if similarity > highest_similarity:
            highest_similarity = similarity
            best_match = student

    THRESHOLD = 0.40
    if best_match and highest_similarity > THRESHOLD:
        uid = best_match["uid"]
        already_marked = attendance_collection.find_one({"uid": uid, "date": today})

        if already_marked:
            return {
                "success": False,
                "alreadyMarked": True,
                "message": f"Attendance already marked for {best_match['name']} today at {already_marked.get('time', 'N/A')}",
                "student": {
                    "name": best_match["name"],
                    "uid": uid,
                    "course": best_match.get("course", "N/A"),
                    "image": best_match.get("image", ""),
                    "markedAt": already_marked.get("time", "N/A")
                }
            }

        attendance_collection.insert_one({
            "uid": uid,
            "name": best_match["name"],
            "course": best_match.get("course", "N/A"),
            "date": today,
            "time": now_time,
            "status": "Present",
            "createdAt": datetime.now().isoformat(),
            "confidence": round(float(highest_similarity) * 100, 1)
        })

        return {
            "success": True,
            "message": f"✅ Attendance marked for {best_match['name']}",
            "student": {
                "name": best_match["name"],
                "uid": uid,
                "course": best_match.get("course", "N/A"),
                "image": best_match.get("image", ""),
                "confidence": round(float(highest_similarity) * 100, 1)
            }
        }

    return {
        "success": False,
        "message": f"Face not recognized (confidence: {round(highest_similarity * 100, 1)}%). Please adjust lighting or positioning."
    }


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
def get_history(
    name: str = None,
    uid: str = None,
    course: str = None,
    date: str = None,
    status: str = None,
    page: int = 1,
    limit: int = 50
):
    query = {}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}
    if uid:
        query["uid"] = {"$regex": uid, "$options": "i"}
    if course and course != "All":
        query["course"] = course
    if date:
        query["date"] = date
    if status and status != "All":
        query["status"] = status

    total = attendance_collection.count_documents(query)
    skip = (page - 1) * limit
    records = list(
        attendance_collection.find(query, {"_id": 0})
        .sort([("date", -1), ("time", -1)])
        .skip(skip)
        .limit(limit)
    )

    return {
        "records": records,
        "total": total,
        "page": page,
        "limit": limit,
        "totalPages": (total + limit - 1) // limit
    }

