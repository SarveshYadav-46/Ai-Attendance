from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from routes.student_routes import router as student_router
from routes.attendance_routes import router as attendance_router
from database import students_collection, attendance_collection

app = FastAPI(title="AI Attendance System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(student_router)
app.include_router(attendance_router)

@app.get("/")
def home():
    return {"message": "AI Attendance Backend Running"}

@app.get("/api/dashboard")
def dashboard_stats():
    total_students = students_collection.count_documents({})
    today = datetime.now().strftime("%Y-%m-%d")
    present_today = attendance_collection.count_documents({"date": today})
    absent_today = max(total_students - present_today, 0)
    attendance_pct = round((present_today / total_students * 100), 1) if total_students > 0 else 0.0

    # Course Summary for MCA AI&ML, MCA, MBA, BCA, BBA
    courses_summary = []
    valid_courses = ["MCA AI&ML", "MCA", "MBA", "BCA", "BBA"]
    for c in valid_courses:
        if c == "MCA":
            total = students_collection.count_documents({"$or": [{"course": c}, {"course": {"$exists": False}}]})
            present = attendance_collection.count_documents({"$or": [{"course": c}, {"course": {"$exists": False}}], "date": today})
        else:
            total = students_collection.count_documents({"course": c})
            present = attendance_collection.count_documents({"course": c, "date": today})
        
        absent = max(total - present, 0)
        courses_summary.append({
            "course": c,
            "totalStudents": total,
            "presentToday": present,
            "absentToday": absent
        })

    # Recent 10 attendance records
    recent_attendance = list(
        attendance_collection.find({}, {"_id": 0})
        .sort([("date", -1), ("time", -1)])
        .limit(10)
    )

    return {
        "totalStudents": total_students,
        "presentToday": present_today,
        "absentToday": absent_today,
        "attendancePercentage": attendance_pct,
        "courses": courses_summary,
        "recentAttendance": recent_attendance
    }