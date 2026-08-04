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


@router.get("/calendar")
def get_calendar_data(month: int = None, year: int = None, course: str = None):
    """Get daily attendance counts for the calendar view"""
    now = datetime.now()
    if not month:
        month = now.month
    if not year:
        year = now.year

    # Build date range for the month
    from calendar import monthrange
    _, days_in_month = monthrange(year, month)
    
    query = {}
    if course and course != "All":
        query["course"] = course

    # Get all attendance records for this month
    month_str = f"{year}-{month:02d}"
    query["date"] = {"$regex": f"^{month_str}"}
    
    records = list(attendance_collection.find(query, {"_id": 0, "date": 1, "uid": 1}))
    
    # Group by date
    daily_counts = {}
    for rec in records:
        d = rec.get("date", "")
        if d not in daily_counts:
            daily_counts[d] = 0
        daily_counts[d] += 1
    
    total_students = students_collection.count_documents({})
    
    # Build result
    calendar_data = []
    for day in range(1, days_in_month + 1):
        date_str = f"{year}-{month:02d}-{day:02d}"
        count = daily_counts.get(date_str, 0)
        calendar_data.append({
            "date": date_str,
            "day": day,
            "count": count,
            "totalStudents": total_students,
            "percentage": round((count / total_students * 100), 1) if total_students > 0 else 0
        })
    
    # Monthly summary
    all_counts = [d["count"] for d in calendar_data if d["count"] > 0]
    return {
        "month": month,
        "year": year,
        "daysInMonth": days_in_month,
        "data": calendar_data,
        "summary": {
            "workingDays": len(all_counts),
            "avgAttendance": round(sum(all_counts) / len(all_counts), 1) if all_counts else 0,
            "highestDay": max(all_counts) if all_counts else 0,
            "lowestDay": min(all_counts) if all_counts else 0,
            "highestDate": calendar_data[all_counts.index(max(all_counts))]["date"] if all_counts else None,
        }
    }


@router.get("/analytics")
def get_analytics():
    """Get analytics data for charts"""
    today = datetime.now()
    
    # Last 7 days attendance trend
    last_7_days = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        date_str = d.strftime("%Y-%m-%d")
        count = attendance_collection.count_documents({"date": date_str, "status": "Present"})
        last_7_days.append({
            "date": date_str,
            "day": d.strftime("%a"),
            "present": count
        })

    # Last 30 days for monthly trend
    last_30_days = []
    for i in range(29, -1, -1):
        d = today - timedelta(days=i)
        date_str = d.strftime("%Y-%m-%d")
        count = attendance_collection.count_documents({"date": date_str, "status": "Present"})
        last_30_days.append({
            "date": date_str,
            "present": count
        })

    # Course-wise attendance
    course_analytics = []
    for course in ["MCA AI&ML", "MCA", "MBA", "BCA", "BBA"]:
        total = students_collection.count_documents({"course": course})
        total_att = attendance_collection.count_documents({"course": course})
        today_present = attendance_collection.count_documents({"course": course, "date": today.strftime("%Y-%m-%d")})
        course_analytics.append({
            "course": course,
            "totalStudents": total,
            "totalAttendance": total_att,
            "todayPresent": today_present,
            "todayAbsent": max(total - today_present, 0)
        })

    # Present vs Absent today
    total_students = students_collection.count_documents({})
    present_today = attendance_collection.count_documents({"date": today.strftime("%Y-%m-%d"), "status": "Present"})
    absent_today = max(total_students - present_today, 0)

    # AI Insights
    insights = []
    
    # Top performing course
    if course_analytics:
        sorted_courses = sorted(
            [c for c in course_analytics if c["totalStudents"] > 0],
            key=lambda x: x["todayPresent"] / x["totalStudents"] if x["totalStudents"] > 0 else 0,
            reverse=True
        )
        if sorted_courses:
            top_c = sorted_courses[0]
            pct = round(top_c["todayPresent"] / top_c["totalStudents"] * 100, 1) if top_c["totalStudents"] > 0 else 0
            insights.append({
                "type": "top_course",
                "icon": "🏆",
                "title": "Top Performing Course Today",
                "value": top_c["course"],
                "detail": f"{pct}% attendance rate ({top_c['todayPresent']}/{top_c['totalStudents']} present)"
            })
            if len(sorted_courses) > 1:
                low_c = sorted_courses[-1]
                low_pct = round(low_c["todayPresent"] / low_c["totalStudents"] * 100, 1) if low_c["totalStudents"] > 0 else 0
                insights.append({
                    "type": "low_course",
                    "icon": "⚠️",
                    "title": "Needs Attention",
                    "value": low_c["course"],
                    "detail": f"Only {low_pct}% attendance today ({low_c['todayPresent']}/{low_c['totalStudents']} present)"
                })

    # Students below 75% attendance
    all_students = list(students_collection.find({}, {"uid": 1, "name": 1, "course": 1, "createdAt": 1}))
    below_75 = []
    for s in all_students:
        total_att = attendance_collection.count_documents({"uid": s["uid"]})
        try:
            from datetime import datetime as dt
            reg_date = dt.fromisoformat(s.get("createdAt", dt.now().isoformat()))
            days = (dt.now() - reg_date).days + 1
            pct = round((total_att / days) * 100, 1) if days > 0 else 0
            if pct < 75:
                below_75.append({"name": s["name"], "uid": s["uid"], "percentage": pct})
        except Exception:
            pass

    insights.append({
        "type": "below_75",
        "icon": "📉",
        "title": "Students Below 75% Attendance",
        "value": str(len(below_75)),
        "detail": f"{len(below_75)} student(s) have attendance below the 75% threshold",
        "students": below_75[:5]
    })

    # Average daily attendance (last 7 days)
    avg_daily = round(sum(d["present"] for d in last_7_days) / 7, 1)
    insights.append({
        "type": "avg_daily",
        "icon": "📊",
        "title": "Average Daily Attendance (7 Days)",
        "value": str(avg_daily),
        "detail": f"Average of {avg_daily} students marked present per day"
    })

    return {
        "last7Days": last_7_days,
        "last30Days": last_30_days,
        "courseAnalytics": course_analytics,
        "pieData": [
            {"name": "Present", "value": present_today, "color": "#10b981"},
            {"name": "Absent", "value": absent_today, "color": "#f43f5e"}
        ],
        "insights": insights,
        "totalStudents": total_students,
        "presentToday": present_today,
        "absentToday": absent_today
    }