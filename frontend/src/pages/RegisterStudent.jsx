import { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import Webcam from "react-webcam";
import { registerStudent } from "../services/api";

function RegisterStudent() {
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [course, setCourse] = useState("MCA AI&ML");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [statusType, setStatusType] = useState("info"); // 'info' | 'success' | 'error'
  const webcamRef = useRef(null);

  const courses = ["MCA AI&ML", "MCA", "MBA", "BCA", "BBA"];

  const handleRegister = async () => {
    if (!name.trim() || !uid.trim() || !course) {
      setMessage("Please enter Name, UID and select a Course.");
      setStatusType("error");
      return;
    }
    
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setMessage("Could not capture image. Ensure webcam is active.");
      setStatusType("error");
      return;
    }

    setLoading(true);
    setMessage("Processing registration details...");
    setStatusType("info");

    try {
      const res = await fetch(imageSrc);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("uid", uid.trim());
      formData.append("course", course);
      formData.append("file", blob, "profile.jpg");

      const response = await registerStudent(formData);
      
      if (response.success) {
        setMessage(response.message || "Student registered successfully!");
        setStatusType("success");
        // Clear fields on success
        setName("");
        setUid("");
      } else {
        setMessage(response.message || "Registration failed.");
        setStatusType("error");
      }
    } catch (err) {
      setMessage("Registration failed. Is the backend API running?");
      setStatusType("error");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Page Title */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Student Registration
          </h1>
          <p className="text-slate-400 mt-2">
            Add a new student profile to the database by providing credentials and registering a face template.
          </p>
        </div>

        {/* Form & Camera Grid Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Webcam Capture */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-hidden shadow-2xl relative">
              <div className="flex justify-between items-center mb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Registration Camera
                  </span>
                </div>
                <span className="text-xs text-indigo-400 font-mono">Live</span>
              </div>

              {/* Webcam Frame */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-slate-800">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover scale-x-[-1]"
                />

                {/* Laser/Scan HUD Corners */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-indigo-500" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-indigo-500" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-indigo-500" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-indigo-500" />
              </div>
            </div>
          </div>

          {/* Right Column: Register Details Form */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
              <h2 className="text-xl font-bold text-slate-200">Profile Details</h2>

              {/* Status Alert Banner */}
              {message && (
                <div className={`p-4 rounded-2xl flex items-start gap-2.5 border text-sm leading-relaxed transition-all duration-300 ${
                  statusType === "success" 
                    ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                    : statusType === "error"
                    ? "bg-rose-950/40 border-rose-800/60 text-rose-300"
                    : "bg-indigo-950/40 border-indigo-800/60 text-indigo-300"
                }`}>
                  <div className="mt-0.5">
                    {statusType === "success" ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : statusType === "error" ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                  </div>
                  <span>{message}</span>
                </div>
              )}

              {/* Form Input Fields */}
              <div className="flex flex-col gap-4">
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    placeholder="Enter student full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                {/* Unique ID (UID) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student UID / Roll Number</label>
                  <input
                    type="text"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all font-mono"
                    placeholder="e.g. MCA2409"
                    value={uid}
                    onChange={(e) => setUid(e.target.value)}
                  />
                </div>

                {/* Course Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Enrolled Course</label>
                  <select
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    {courses.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Submit / Capture Button */}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none w-full"
              >
                {loading ? "Registering student..." : "Capture Face & Register"}
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default RegisterStudent;