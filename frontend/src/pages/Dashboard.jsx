import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import StudentTable from "../components/StudentTable";
import { getDashboardStats } from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendancePercentage: 0,
    courses: [],
    recentAttendance: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        
        {/* Title Section */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            System Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time system overview, course-wise analytics, and recent activity logs.
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <svg className="w-12 h-12 animate-spin mb-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="font-semibold text-slate-300">Loading dashboard...</p>
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Card: Total Students */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-all duration-300" />
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Registered</p>
                  <h3 className="text-3xl font-bold mt-2 text-slate-100">{stats.totalStudents}</h3>
                </div>
                <div className="p-3 bg-indigo-950/60 text-indigo-400 rounded-2xl border border-indigo-850">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>

              {/* Card: Present Today */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-300" />
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Present Today</p>
                  <h3 className="text-3xl font-bold mt-2 text-emerald-400">{stats.presentToday}</h3>
                </div>
                <div className="p-3 bg-emerald-950/60 text-emerald-400 rounded-2xl border border-emerald-850">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Card: Absent Today */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-rose-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-rose-500/5 rounded-full blur-xl group-hover:bg-rose-500/10 transition-all duration-300" />
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Absent Today</p>
                  <h3 className="text-3xl font-bold mt-2 text-rose-400">{stats.absentToday}</h3>
                </div>
                <div className="p-3 bg-rose-950/60 text-rose-400 rounded-2xl border border-rose-855">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>

              {/* Card: Attendance Rate */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex items-center justify-between relative overflow-hidden group hover:border-violet-500/30 transition-all duration-300">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-violet-500/5 rounded-full blur-xl group-hover:bg-violet-500/10 transition-all duration-300" />
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Attendance Rate</p>
                  <h3 className="text-3xl font-bold mt-2 text-violet-400">{stats.attendancePercentage}%</h3>
                </div>
                <div className="p-3 bg-violet-950/60 text-violet-400 rounded-2xl border border-violet-850">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
              </div>

            </div>

            {/* Course Summary Section */}
            <div className="flex flex-col gap-4">
              <h2 className="text-xl font-bold text-slate-200 tracking-tight">Course Summaries</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {stats.courses && stats.courses.map((courseSummary) => {
                  const attendancePct = courseSummary.totalStudents > 0 
                    ? Math.round((courseSummary.presentToday / courseSummary.totalStudents) * 100)
                    : 0;

                  return (
                    <div 
                      key={courseSummary.course}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all duration-300"
                    >
                      <div>
                        <h4 className="text-sm font-extrabold text-indigo-400 tracking-wide uppercase">
                          {courseSummary.course}
                        </h4>
                        
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-400">Total Students</span>
                            <span className="text-slate-200 font-bold">{courseSummary.totalStudents}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-emerald-400">Present</span>
                            <span className="text-emerald-400 font-bold">{courseSummary.presentToday}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-rose-400">Absent</span>
                            <span className="text-rose-400 font-bold">{courseSummary.absentToday}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-800/60">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Today's Rate</span>
                          <span>{attendancePct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-500 h-1.5 rounded-full" 
                            style={{ width: `${attendancePct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Attendance Section */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-200 tracking-tight">Recent Attendance</h2>
                <span className="text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                  Last 10 entries
                </span>
              </div>
              <StudentTable students={stats.recentAttendance} />
            </div>
          </>
        )}

      </main>
    </div>
  );
}

export default Dashboard;