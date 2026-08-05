import os
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
db_name = os.getenv("DATABASE_NAME", "AttendanceDB")

if not mongo_uri:
    raise ValueError("MONGO_URI is not set in the environment variables.")

try:
    print("Attempting to connect to MongoDB Atlas...")
    client = MongoClient(mongo_uri, serverSelectionTimeoutMS=3000, tlsCAFile=certifi.where())
    client.admin.command('ping')
    print("MongoDB Atlas connected successfully.")
except Exception as e:
    print(f"MongoDB Atlas connection failed: {e}")
    raise e

db = client[db_name]

students_collection = db["students"]
attendance_collection = db["attendance"]