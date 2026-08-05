import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import StudentTable from "../components/StudentTable";
import { getAttendanceHistory, deleteAttendanceRecord } from "../services/api";
import toast from "react-hot-toast";


function History() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, total: 0 });

  // Filter States
  const [name, setName] = useState("");
  const [uid, setUid] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [status, setStatus] = useState("All");

  const courses = ["All", "MCA AI&ML", "MCA", "MBA", "BCA", "BBA"];
  const statuses = ["All", "Present", "Absent"];

  const fetchHistory = async (page = 1) => {
    setLoading(true);
    try {
      const filters = { page, limit: pagination.limit };
      if (name.trim()) filters.name = name.trim();
      if (uid.trim()) filters.uid = uid.trim();
      if (selectedCourse !== "All") filters.course = selectedCourse;
      if (selectedDate) filters.date = selectedDate;
      if (status !== "All") filters.status = status;

      const data = await getAttendanceHistory(filters);
      setRecords(data.records || []);
      setPagination({
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        total: data.total
      });
    } catch (err) {
      console.error("Failed to load attendance history", err);
      toast.error(err.userMessage || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(pagination.page);
  }, [pagination.page, selectedCourse, selectedDate, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory(1);
  };

  const handleClearFilters = () => {
    setName("");
    setUid("");
    setSelectedCourse("All");
    setSelectedDate("");
    setStatus("All");
    setPagination(p => ({ ...p, page: 1 }));
  };

  const handleDelete = async (deleteUid, date, time) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteAttendanceRecord(deleteUid, date, time);
        toast.success("Record deleted successfully");
        fetchHistory(pagination.page);
      } catch (err) {
        toast.error(err.userMessage || "Failed to delete record");
      }
    }
  };



  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Attendance History
            </h1>
            <p className="text-slate-400 mt-1">
              Search, filter, and export attendance records.
            </p>
          </div>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-6">
            <h2 className="text-lg font-bold text-slate-200">Search Filters</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</label>
                <input type="text" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">UID</label>
                <input type="text" placeholder="e.g. MCA2409" value={uid} onChange={(e) => setUid(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Course</label>
                <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                  {courses.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500">
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-800/60 pt-5">
              <button type="button" onClick={handleClearFilters} className="px-5 py-2.5 rounded-xl border border-slate-850 hover:border-slate-700 text-sm font-semibold hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-all">Clear Filters</button>
              <button type="submit" disabled={loading} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-all">Search Logs</button>
            </div>
          </form>
        </div>

        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            <p className="font-semibold text-slate-300">Filtering history records...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <StudentTable students={records} onDelete={handleDelete} />
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between bg-slate-900 p-4 rounded-xl border border-slate-800">
                <span className="text-sm text-slate-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
                </span>
                <div className="flex gap-2">
                  <button 
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded text-sm transition-colors border border-slate-700"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded text-sm transition-colors border border-slate-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default History;
