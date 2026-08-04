import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getCalendarData } from "../services/api";

function Calendar() {
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState("All");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        const result = await getCalendarData(month, year, course);
        setData(result);
      } catch (error) {
        console.error("Error fetching calendar data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [date, course]);

  const handlePrevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Attendance Calendar
            </h1>
            <p className="text-slate-400 mt-1">Monthly view of daily attendance metrics.</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={course} 
              onChange={(e) => setCourse(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="All">All Courses</option>
              <option value="MCA AI&ML">MCA AI&ML</option>
              <option value="MCA">MCA</option>
              <option value="MBA">MBA</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
            </select>
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
              <button onClick={handlePrevMonth} className="px-3 py-2 hover:bg-slate-800 text-slate-300">
                &larr;
              </button>
              <div className="px-4 py-2 font-bold text-indigo-400 w-40 text-center">
                {monthNames[date.getMonth()]} {date.getFullYear()}
              </div>
              <button onClick={handleNextMonth} className="px-3 py-2 hover:bg-slate-800 text-slate-300">
                &rarr;
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400">
            <svg className="w-12 h-12 animate-spin mb-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="font-semibold text-slate-300">Loading calendar...</p>
          </div>
        ) : data ? (
          <>
            {/* Summary */}
            {data.summary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Working Days</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">{data.summary.workingDays}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Avg Daily</p>
                  <p className="text-2xl font-bold text-slate-100 mt-1">{data.summary.avgAttendance}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Highest Day</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{data.summary.highestDay}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">Lowest Day</p>
                  <p className="text-2xl font-bold text-rose-400 mt-1">{data.summary.lowestDay}</p>
                </div>
              </div>
            )}

            {/* Calendar Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="grid grid-cols-7 bg-slate-950/50 border-b border-slate-800 text-center py-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-sm font-semibold text-slate-400">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 auto-rows-fr">
                {/* Generate empty cells for days before the 1st */}
                {Array.from({ length: new Date(date.getFullYear(), date.getMonth(), 1).getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-slate-800/50 bg-slate-950/30 p-2"></div>
                ))}
                
                {data.data && data.data.map((dayData, idx) => {
                  let bgColor = "bg-slate-900";
                  let textColor = "text-slate-400";
                  let countColor = "text-slate-500";
                  
                  if (dayData.count > 0) {
                    if (dayData.percentage >= 80) { bgColor = "bg-emerald-900/20"; countColor = "text-emerald-400"; textColor = "text-slate-200"; }
                    else if (dayData.percentage >= 50) { bgColor = "bg-yellow-900/20"; countColor = "text-yellow-400"; textColor = "text-slate-200"; }
                    else { bgColor = "bg-rose-900/20"; countColor = "text-rose-400"; textColor = "text-slate-200"; }
                  }

                  // is today
                  const isToday = new Date().toDateString() === new Date(dayData.date).toDateString();

                  return (
                    <div key={idx} className={`min-h-[100px] border-b border-r border-slate-800/50 p-2 flex flex-col ${bgColor} hover:bg-slate-800/50 transition-colors cursor-pointer group`}>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-500 text-white' : textColor}`}>
                          {dayData.day}
                        </span>
                        {dayData.count > 0 && (
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            {dayData.percentage}%
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-end items-center pb-2">
                        {dayData.count > 0 ? (
                          <>
                            <span className={`text-2xl font-black ${countColor}`}>{dayData.count}</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Present</span>
                          </>
                        ) : (
                          <span className="text-xs text-slate-600">No Data</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}

export default Calendar;
