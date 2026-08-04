from database import attendance_collection
records = list(attendance_collection.find({"uid": "TEST001"}))
print(f"Total records found: {len(records)}")
for rec in records:
    print(rec)
