"use client"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`)

function isActive(day: number, hour: number) {
  const biz = day < 5 && hour >= 9 && hour < 18
  const peak = day < 5 && (hour === 10 || hour === 14 || hour === 16)
  const eve = hour >= 20 && hour < 23
  return { active: biz || eve, peak }
}

export default function SchedulesPage() {
  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">Schedules</h2>
          <p className="text-xs text-[#4a4a6a]">Active chaos time windows</p>
        </div>
        <button className="px-3 py-2 lg:px-4 rounded-lg bg-[#6c47ff] text-white text-sm font-medium hover:bg-[#7c57ff]">
          + Add Schedule
        </button>
      </div>

      <div className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 lg:p-5">
        <h3 className="text-sm font-semibold text-[#e8e8f0] mb-4">Weekly Chaos Activity Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="flex gap-2 min-w-[480px]">
            <div className="flex flex-col gap-1 pt-6">
              {hours.filter((_, i) => i % 3 === 0).map(h => (
                <div key={h} className="text-[9px] font-mono text-[#4a4a6a] h-4 flex items-center pr-2">{h}</div>
              ))}
            </div>
            {days.map((day, di) => (
              <div key={day} className="flex-1 min-w-[50px]">
                <div className="text-[10px] font-mono text-[#8888aa] text-center mb-1">{day}</div>
                <div className="flex flex-col gap-0.5">
                  {hours.map((_, hi) => {
                    const { active, peak } = isActive(di, hi)
                    return (
                      <div key={hi} className="h-3 rounded-sm transition-all hover:scale-110 cursor-pointer"
                        style={{ background: peak ? "rgba(255,59,92,0.7)" : active ? "rgba(108,71,255,0.4)" : "rgba(30,30,46,0.6)" }}
                        title={`${day} ${hours[hi]} — ${active ? "Active" : "Inactive"}`}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-[#4a4a6a]">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1e1e2e] inline-block"/>Inactive</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#6c47ff]/40 inline-block"/>Active</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#ff3b5c]/70 inline-block"/>Peak</span>
        </div>
      </div>
    </div>
  )
}