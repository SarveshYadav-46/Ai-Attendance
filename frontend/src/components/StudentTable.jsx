function StudentTable({ students }) {
  if (!students || students.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center text-slate-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <p className="font-semibold text-slate-300">No Records Found</p>
        <p className="text-xs text-slate-500 mt-1">No attendance logs match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      <div className="p-6 border-b border-slate-800/60 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-200">
          Attendance Log
        </h2>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-400 border border-indigo-900">
          {students.length} record{students.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6">Student</th>
              <th className="py-4 px-6">UID</th>
              <th className="py-4 px-6">Course</th>
              <th className="py-4 px-6">Time / Date</th>
              <th className="py-4 px-6 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {students.map((student, idx) => (
              <tr 
                key={`${student.uid}-${idx}`}
                className="hover:bg-slate-800/30 transition-colors duration-150"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold text-sm">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-slate-200">{student.name}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-slate-300 font-mono text-sm">
                  {student.uid}
                </td>
                <td className="py-4 px-6">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {student.course}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="text-slate-200 font-mono text-sm">{student.time || "N/A"}</span>
                    <span className="text-slate-500 text-xs mt-0.5">{student.date}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      student.status === "Present"
                        ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                        : "bg-rose-950/80 text-rose-400 border border-rose-800/60"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${student.status === "Present" ? "bg-emerald-400" : "bg-rose-400"}`} />
                    {student.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentTable;
