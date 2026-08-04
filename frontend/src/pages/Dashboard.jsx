import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getDashboardStats, getStudents, deleteStudent, updateStudent } from "../services/api";
import toast from "react-hot-toast";

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendancePercentage: 0,
    totalCourses: 0,
    totalRecords: 0,
    courses: [],
  });
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("All");

  // Modals
  const [viewStudent, setViewStudent] = useState(null);
  const [editStudent, setEditStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, studentsData] = await Promise.all([
        getDashboardStats(),
        getStudents()
      ]);
      setStats(statsData);
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseClick = (courseName) => {
    if (selectedCourseFilter === courseName) {
      setSelectedCourseFilter("All");
      setFilteredStudents(students);
    } else {
      setSelectedCourseFilter(courseName);
      setFilteredStudents(students.filter(s => s.course === courseName));
    }
  };

  const handleDelete = async (uid) => {
    if (window.confirm(`Are you sure you want to delete student ${uid}? This will also remove all their attendance records and face data.`)) {
      try {
        await deleteStudent(uid);
        toast.success("Student deleted successfully");
        setViewStudent(null);
        fetchData();
      } catch (err) {
        toast.error(err.userMessage || "Failed to delete student");
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", editStudent.name);
      formData.append("new_uid", editStudent.uid);
      formData.append("course", editStudent.course);
      await updateStudent(editStudent.oldUid, formData);
      toast.success("Student updated successfully");
      setEditStudent(null);
      fetchData();
    } catch (err) {
      toast.error(err.userMessage || "Failed to update student");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            System overview and student management.
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <p className="font-semibold text-slate-300">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <StatCard title="Total Students" value={stats.totalStudents} color="indigo" />
              <StatCard title="Present Today" value={stats.presentToday} color="emerald" />
              <StatCard title="Absent Today" value={stats.absentToday} color="rose" />
              <StatCard title="Attendance %" value={`${stats.attendancePercentage}%`} color="violet" />
              <StatCard title="Total Courses" value={stats.totalCourses || stats.courses?.length || 0} color="amber" />
              <StatCard title="Total Records" value={stats.totalRecords || 0} color="cyan" />
            </div>

            {/* Course-wise Statistics */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-slate-200">Course-wise Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.courses && stats.courses.map((c) => (
                  <div 
                    key={c.course}
                    onClick={() => handleCourseClick(c.course)}
                    className={`bg-slate-900 border rounded-2xl p-5 shadow-lg flex flex-col justify-between cursor-pointer transition-all ${selectedCourseFilter === c.course ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800 hover:border-slate-700'}`}
                  >
                    <h4 className="text-sm font-extrabold text-indigo-400 uppercase">{c.course}</h4>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-400">Total</span><span className="font-bold">{c.totalStudents}</span></div>
                      <div className="flex justify-between"><span className="text-emerald-400">Present</span><span className="font-bold">{c.presentToday}</span></div>
                      <div className="flex justify-between"><span className="text-rose-400">Absent</span><span className="font-bold">{c.absentToday}</span></div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/60">
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Attendance</span>
                        <span>{c.attendancePercentage}%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${c.attendancePercentage}%` }} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Student Management Table */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-200">Student Management</h2>
                {selectedCourseFilter !== "All" && (
                  <button onClick={() => handleCourseClick("All")} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded-full text-slate-300">
                    Clear Filter ({selectedCourseFilter})
                  </button>
                )}
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-4 px-6">Photo</th>
                      <th className="py-4 px-6">UID</th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Course</th>
                      <th className="py-4 px-6 text-center">Status (Today)</th>
                      <th className="py-4 px-6 text-center">Att %</th>
                      <th className="py-4 px-6">Reg Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {filteredStudents.map((s) => (
                      <tr key={s.uid} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-6">
                          <img src={s.image} alt={s.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                        </td>
                        <td className="py-3 px-6 font-mono text-sm text-slate-300">{s.uid}</td>
                        <td className="py-3 px-6 font-medium text-slate-200">{s.name}</td>
                        <td className="py-3 px-6"><span className="text-xs px-2 py-1 bg-slate-800 rounded text-slate-300 border border-slate-700">{s.course}</span></td>
                        <td className="py-3 px-6 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${s.todayStatus === 'Present' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-rose-900/30 text-rose-400'}`}>
                            {s.todayStatus}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-center font-bold text-slate-200">{s.attendancePercentage}%</td>
                        <td className="py-3 px-6 text-sm text-slate-400">{s.registrationDate}</td>
                        <td className="py-3 px-6 text-right space-x-2">
                          <button onClick={() => setViewStudent(s)} className="text-indigo-400 hover:text-indigo-300 text-xs">View</button>
                          <button onClick={() => setEditStudent({...s, oldUid: s.uid})} className="text-amber-400 hover:text-amber-300 text-xs">Edit</button>
                          <button onClick={() => handleDelete(s.uid)} className="text-rose-400 hover:text-rose-300 text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                    {filteredStudents.length === 0 && (
                      <tr><td colSpan="8" className="text-center py-8 text-slate-500">No students found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* View Modal */}
        {viewStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
              <div className="relative h-32 bg-gradient-to-r from-indigo-600 to-purple-600">
                <button onClick={() => setViewStudent(null)} className="absolute top-4 right-4 text-white hover:text-slate-200 bg-black/20 rounded-full p-1"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <div className="px-6 pb-6 relative">
                <img src={viewStudent.image} alt={viewStudent.name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-900 -mt-12 mx-auto relative z-10 bg-slate-800" />
                <div className="text-center mt-2">
                  <h3 className="text-xl font-bold text-white">{viewStudent.name}</h3>
                  <p className="text-slate-400 font-mono">{viewStudent.uid}</p>
                  <span className="inline-block mt-1 text-xs px-2 py-1 bg-slate-800 rounded text-slate-300 border border-slate-700">{viewStudent.course}</span>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs">Status Today</p>
                    <p className={`font-bold mt-1 ${viewStudent.todayStatus === 'Present' ? 'text-emerald-400' : 'text-rose-400'}`}>{viewStudent.todayStatus}</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs">Overall Att %</p>
                    <p className="font-bold mt-1 text-indigo-400">{viewStudent.attendancePercentage}%</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs">Total Attended</p>
                    <p className="font-bold mt-1 text-slate-200">{viewStudent.totalAttendance} days</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <p className="text-slate-500 text-xs">Face Registered</p>
                    <p className="font-bold mt-1 text-emerald-400">Yes</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 col-span-2">
                    <p className="text-slate-500 text-xs">Last Attendance</p>
                    <p className="font-bold mt-1 text-slate-200">{viewStudent.lastAttendance}</p>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => { setEditStudent({...viewStudent, oldUid: viewStudent.uid}); setViewStudent(null); }} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-xl text-sm font-semibold transition-colors">Edit Student</button>
                  <button onClick={() => handleDelete(viewStudent.uid)} className="flex-1 border border-rose-500/50 hover:bg-rose-900/30 text-rose-400 py-2 rounded-xl text-sm font-semibold transition-colors">Delete</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Edit Student</h3>
                <button onClick={() => setEditStudent(null)} className="text-slate-400 hover:text-slate-200"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">Name</label>
                  <input required type="text" value={editStudent.name} onChange={e => setEditStudent({...editStudent, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">UID</label>
                  <input required type="text" value={editStudent.uid} onChange={e => setEditStudent({...editStudent, uid: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase mb-1">Course</label>
                  <select required value={editStudent.course} onChange={e => setEditStudent({...editStudent, course: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500">
                    <option value="MCA AI&ML">MCA AI&ML</option>
                    <option value="MCA">MCA</option>
                    <option value="MBA">MBA</option>
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                  </select>
                </div>
                <div className="pt-2">
                  <p className="text-xs text-slate-500 mb-4">Note: To update the face embedding, the student must be deleted and re-registered via the Registration page.</p>
                  <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl font-bold transition-colors shadow-lg shadow-indigo-500/20">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ title, value, color }) {
  const colors = {
    indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    cyan: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
  };
  return (
    <div className={`border rounded-2xl p-4 flex flex-col justify-center items-center text-center ${colors[color] || colors.indigo}`}>
      <p className="text-[10px] uppercase tracking-wider font-bold opacity-80 mb-1">{title}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

export default Dashboard;