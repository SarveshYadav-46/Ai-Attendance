from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))

db = client[os.getenv("DATABASE_NAME")]

students_collection = db["students"]
attendance_collection = db["attendance"]