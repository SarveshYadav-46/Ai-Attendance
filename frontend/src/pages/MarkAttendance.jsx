import { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import Webcam from "react-webcam";
import { markAttendance } from "../services/api";

function MarkAttendance() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("System Ready. Please look at the camera.");
  const [statusType, setStatusType] = useState("info"); // 'info' | 'success' | 'warning' | 'error'
  const [scannedStudent, setScannedStudent] = useState(null);
  const [paused, setPaused] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    let intervalId;

    const performAutoScan = async () => {
      // Skip if loading, paused, or if the webcam is not mounted/ready
      if (loading || paused || !webcamRef.current) return;

      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        // Webcam might not be fully loaded yet
        return;
      }

      setLoading(true);
      setStatusMessage("Analyzing facial features...");
      setStatusType("scanning");

      try {
        const res = await fetch(imageSrc);
        const blob = await res.blob();
        const formData = new FormData();
        formData.append("file", blob, "attendance.jpg");

        const response = await markAttendance(formData);
        
        if (response.success) {
          setStatusMessage(response.message || "Attendance marked successfully!");
          setStatusType("success");
          setScannedStudent(response.student);
          
          // Pause scanning for 4 seconds to show success card, then resume
          setPaused(true);
          setTimeout(() => {
            setPaused(false);
            setScannedStudent(null);
            setStatusMessage("System Ready. Please look at the camera.");
            setStatusType("info");
          }, 4000);

        } else {
          // If already marked, pause and show info
          if (response.message && response.message.toLowerCase().includes("already marked")) {
            setStatusMessage(response.message);
            setStatusType("warning");
            if (response.student) {
              setScannedStudent(response.student);
            }
            setPaused(true);
            setTimeout(() => {
              setPaused(false);
              setScannedStudent(null);
              setStatusMessage("System Ready. Please look at the camera.");
              setStatusType("info");
            }, 4000);
          } else {
            // Unrecognized or other error (no face detected) - try again shortly without locking
            setStatusMessage(response.message || "Face not recognized. Adjust positioning.");
            setStatusType("error");
          }
        }
      } catch (err) {
        console.error("Auto-attendance error:", err);
        setStatusMessage("Connection failed. Retrying...");
        setStatusType("error");
      } finally {
        setLoading(false);
      }
    };

    // Trigger auto-scan loop every 3 seconds
    intervalId = setInterval(performAutoScan, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [loading, paused]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        {/* Page Title */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Automated Attendance Terminal
          </h1>
          <p className="text-slate-400 mt-2">
            Step in front of the camera. The system will automatically detect your face and record attendance.
          </p>
        </div>

        {/* Responsive Layout Grid */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Live Webcam Scanner */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 overflow-hidden shadow-2xl">
              
              {/* Header inside webcam card */}
              <div className="flex justify-between items-center mb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${paused ? "bg-amber-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {paused ? "Scanner Paused" : "Scanner Active"}
                  </span>
                </div>
                <span className="text-xs text-indigo-400 font-mono">Live Feed</span>
              </div>

              {/* Webcam Viewport */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-black/40 border border-slate-800">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover scale-x-[-1]" // mirror image for natural user interaction
                />

                {/* Interactive Laser Scanning Line */}
                {!paused && (
                  <div className={loading ? "scan-line-scanning" : "scan-line"} />
                )}

                {/* Corner Accents for high-tech HUD look */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-indigo-500" />
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-indigo-500" />
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-indigo-500" />
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-indigo-500" />
              </div>
            </div>
          </div>

          {/* Right Column: Status Panel & Profiles */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* Status Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-slate-200">Terminal Status</h2>
              
              <div className={`p-4 rounded-2xl flex items-start gap-3 border transition-all duration-300 ${
                statusType === "success" 
                  ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-300"
                  : statusType === "warning"
                  ? "bg-amber-950/40 border-amber-800/60 text-amber-300"
                  : statusType === "error"
                  ? "bg-rose-950/40 border-rose-800/60 text-rose-300"
                  : statusType === "scanning"
                  ? "bg-indigo-950/40 border-indigo-800/60 text-indigo-300"
                  : "bg-slate-800/40 border-slate-700/60 text-slate-300"
              }`}>
                {/* Status Icons */}
                <div className="mt-0.5">
                  {statusType === "success" && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {statusType === "warning" && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                  {statusType === "error" && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {statusType === "scanning" && (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {statusType === "info" && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm leading-relaxed">{statusMessage}</p>
                </div>
              </div>
            </div>

            {/* Student Profile Card (displays details upon successful detection or warning) */}
            {scannedStudent ? (
              <div className={`bg-slate-900 border rounded-3xl p-6 shadow-2xl transform transition-all duration-300 scale-100 ${
                statusType === "success" ? "border-emerald-800/80 shadow-emerald-950/20" : "border-amber-800/80 shadow-amber-950/20"
              }`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-2xl ${statusType === "success" ? "bg-emerald-950/60 text-emerald-400" : "bg-amber-950/60 text-amber-400"}`}>
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-100">{scannedStudent.name}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">UID: {scannedStudent.uid}</p>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Course</span>
                    <span className="font-semibold text-slate-200">{scannedStudent.course}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Time Recorded</span>
                    <span className="font-mono font-medium text-slate-200">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                      Present
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Scanning HUD/Radar graphic when waiting */
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[220px] text-center">
                <div className="relative mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border border-dashed border-indigo-500/40 animate-spin" style={{ animationDuration: '8s' }} />
                  <div className="absolute w-12 h-12 rounded-full border border-indigo-500/20 animate-pulse" />
                  <div className="absolute text-indigo-400">
                    <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-400">Scanner Standby</p>
                <p className="text-xs text-slate-500 mt-1 max-w-[200px]">Waiting for a student to step within detection range</p>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}

export default MarkAttendance;