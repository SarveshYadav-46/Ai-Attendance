from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from routes.student_routes import router as student_router
from routes.attendance_routes import router as attendance_router
from database import students_collection, attendance_collection

app = FastAPI(
    title="AI Face Attendance System",
    description="MCA AI&ML Minor Project - Face Recognition Attendance System",
    version="2.0.0"
)

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
    return {
        "message": "AI Face Attendance System - Backend v2.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/dashboard")
def dashboard_stats():
    total_students = students_collection.count_documents({})
    today = datetime.now().strftime("%Y-%m-%d")
    present_today = attendance_collection.count_documents({"date": today, "status": "Present"})
    absent_today = max(total_students - present_today, 0)
    attendance_pct = round((present_today / total_students * 100), 1) if total_students > 0 else 0.0

    # Total attendance records
    total_records = attendance_collection.count_documents({})

    # Total distinct courses with students
    total_courses = 5

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
        "totalCourses": total_courses,
        "totalRecords": total_records,
        "recentAttendance": recent_attendance,
        "date": today
    }


@app.get("/health")
def health_check():
    try:
        # Test MongoDB connection
        students_collection.find_one({})
        return {"status": "healthy", "database": "connected", "timestamp": datetime.now().isoformat()}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}