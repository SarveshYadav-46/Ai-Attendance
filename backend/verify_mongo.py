from database import students_collection
student = students_collection.find_one({"uid": "TEST001"})
if student:
    print(f"Name: {student.get('name')}")
    print(f"UID: {student.get('uid')}")
    print(f"Course: {student.get('course')}")
    print(f"Embedding type: {type(student.get('embedding'))}, Length: {len(student.get('embedding')) if student.get('embedding') else 0}")
    print(f"CreatedAt: {student.get('createdAt')}")
else:
    print("Student not found!")
