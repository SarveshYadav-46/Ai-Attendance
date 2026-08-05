from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from database import students_collection, attendance_collection
from services.face_service import generate_embedding
import numpy as np
import cv2
import base64
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

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

    # Duplicate UID check
    existing = students_collection.find_one({"uid": uid})
    if existing:
        return {"success": False, "message": f"UID '{uid}' already exists. Please use a unique ID."}

    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    if image is None:
        return {"success": False, "message": "Invalid image format. Please try again."}

    embedding = generate_embedding(image)
    if embedding is None:
        return {"success": False, "message": "No face detected in the image. Ensure your face is clearly visible."}

    # Duplicate face check - compare with all existing embeddings
    from services.face_service import compare_faces
    all_students = list(students_collection.find({}, {"uid": 1, "name": 1, "embedding": 1}))
    for s in all_students:
        if "embedding" in s:
            stored_emb = np.array(s["embedding"])
            sim = compare_faces(embedding, stored_emb)
            if sim > 0.65:
                return {
                    "success": False,
                    "message": f"This face is already registered as '{s['name']}' (UID: {s['uid']}). Cannot register duplicate face."
                }

    # Store image as base64
    _, buffer = cv2.imencode('.jpg', image)
    image_b64 = base64.b64encode(buffer).decode('utf-8')
    image_data_url = f"data:image/jpeg;base64,{image_b64}"

    student = {
        "uid": uid,
        "name": name.strip(),
        "course": course,
        "embedding": embedding.tolist(),
        "image": image_data_url,
        "faceRegistered": True,
        "createdAt": datetime.now().isoformat(),
        "registrationDate": datetime.now().strftime("%Y-%m-%d"),
    }

    students_collection.insert_one(student)
    return {"success": True, "message": f"✅ {name} registered successfully with face template!"}


@router.get("/students")
def get_students():
    students = list(students_collection.find({}, {"_id": 0, "embedding": 0}))
    today = datetime.now().strftime("%Y-%m-%d")
    
    for s in students:
        # Today's attendance status
        record = attendance_collection.find_one({"uid": s["uid"], "date": today})
        s["todayStatus"] = "Present" if record else "Absent"
        
        # Calculate total attendance
        total_att = attendance_collection.count_documents({"uid": s["uid"]})
        s["totalAttendance"] = total_att
        
        # Calculate attendance percentage (based on working days from registration)
        from datetime import datetime as dt
        try:
            reg_date = dt.fromisoformat(s.get("createdAt", dt.now().isoformat()))
            days_since = (dt.now() - reg_date).days + 1
            s["attendancePercentage"] = round((total_att / days_since) * 100, 1) if days_since > 0 else 0
        except Exception:
            s["attendancePercentage"] = 0
            
        # Last attendance
        last = attendance_collection.find_one({"uid": s["uid"]}, {"_id": 0, "date": 1, "time": 1}, sort=[("date", -1), ("time", -1)])
        s["lastAttendance"] = f"{last['date']} {last['time']}" if last else "Never"
    
    return students


@router.get("/students/{uid}")
def get_student(uid: str):
    student = students_collection.find_one({"uid": uid}, {"_id": 0, "embedding": 0})
    if not student:
        raise HTTPException(status_code=404, detail=f"Student with UID '{uid}' not found")
    
    today = datetime.now().strftime("%Y-%m-%d")
    record = attendance_collection.find_one({"uid": uid, "date": today})
    student["todayStatus"] = "Present" if record else "Absent"
    
    total_att = attendance_collection.count_documents({"uid": uid})
    student["totalAttendance"] = total_att
    
    last = attendance_collection.find_one({"uid": uid}, {"_id": 0, "date": 1, "time": 1}, sort=[("date", -1), ("time", -1)])
    student["lastAttendance"] = f"{last['date']} {last['time']}" if last else "Never"
    
    return student


@router.put("/students/{uid}")
async def update_student(
    uid: str,
    name: str = Form(...),
    new_uid: str = Form(...),
    course: str = Form(...)
):
    if course not in VALID_COURSES:
        return {"success": False, "message": f"Invalid course. Must be one of: {', '.join(VALID_COURSES)}"}

    student = students_collection.find_one({"uid": uid})
    if not student:
        return {"success": False, "message": f"Student with UID '{uid}' not found"}

    # If UID is changing, check for conflicts
    if new_uid != uid:
        conflict = students_collection.find_one({"uid": new_uid})
        if conflict:
            return {"success": False, "message": f"UID '{new_uid}' is already taken by another student"}

    # Update student record
    update_data = {
        "name": name.strip(),
        "course": course,
        "uid": new_uid,
        "updatedAt": datetime.now().isoformat()
    }
    students_collection.update_one({"uid": uid}, {"$set": update_data})
    
    # Also update attendance records if UID changed
    if new_uid != uid:
        attendance_collection.update_many(
            {"uid": uid},
            {"$set": {"uid": new_uid, "name": name.strip(), "course": course}}
        )
    else:
        attendance_collection.update_many(
            {"uid": uid},
            {"$set": {"name": name.strip(), "course": course}}
        )

    return {"success": True, "message": f"✅ Student '{name}' updated successfully"}


@router.delete("/students/{uid}")
def delete_student(uid: str):
    student = students_collection.find_one({"uid": uid})
    if not student:
        return {"success": False, "message": f"Student with UID '{uid}' not found"}

    # Delete student record
    students_collection.delete_one({"uid": uid})
    # Delete all attendance records
    deleted_att = attendance_collection.delete_many({"uid": uid})

    return {
        "success": True,
        "message": f"Student deleted. Also removed {deleted_att.deleted_count} attendance record(s)."
    }





@router.delete("/attendance")
def delete_attendance_by_params(uid: str, date: str, time: str):
    """Delete attendance record by uid, date, time"""
    res = attendance_collection.delete_one({"uid": uid, "date": date, "time": time})
    if res.deleted_count > 0:
        return {"success": True, "message": "Attendance record deleted"}
    return {"success": False, "message": "Record not found"}