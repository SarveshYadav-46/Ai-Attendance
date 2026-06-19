import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import StudentTable from "../components/StudentTable";
import { getAttendanceHistory } from "../services/api";

function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter States
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");

  const courses = ["All", "MCA AI&ML", "MCA", "MBA", "BCA", "BBA"];

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (name.trim()) filters.name = name.trim();
      if (uid.trim()) filters.uid = uid.trim();
      if (selectedCourse !== "All") filters.course = selectedCourse;
      if (selectedDate) filters.date = selectedDate;

      const data = await getAttendanceHistory(filters);
      setRecords(data);
    } catch (err) {
      console.error("Failed to load attendance history", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when page loads or filters change
  useEffect(() => {
    fetchHistory();
  }, [selectedCourse, selectedDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleClearFilters = () => {
    setName("");
    setUid("");
    setSelectedCourse("All");
    setSelectedDate("");
    // Re-fetch with clean filters immediately
    setLoading(true);
    getAttendanceHistory({})
      .then((data) => setRecords(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        
        {/* Header Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Attendance History
          </h1>
          <p className="text-slate-400 mt-1">
            Search, filter, and review historical attendance records across all student cohorts.
          </p>
        </div>

        {/* Filter Control Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-200">Search Filters</h2>
            
            {/* Input Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Search by Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Search by UID */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Student UID</label>
                <input
                  type="text"
                  placeholder="e.g. MCA2409"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              {/* Course Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Course</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-800/60 pt-5">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-5 py-2.5 rounded-xl border border-slate-850 hover:border-slate-700 text-sm font-semibold hover:bg-slate-800 text-slate-400 hover:text-slate-200 active:scale-[0.98] transition-all"
              >
                Clear Filters
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all"
              >
                Search Logs
              </button>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <svg className="w-8 h-8 animate-spin mx-auto mb-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="font-semibold text-slate-300">Filtering history records...</p>
          </div>
        ) : (
          <StudentTable students={records} />
        )}

      </main>
    </div>
  );
}

export default History;
