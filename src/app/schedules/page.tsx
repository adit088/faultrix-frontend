"use client"
import { useState, useEffect } from "react"
import { rulesApi, schedulesApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import type { ChaosRuleResponse, ChaosScheduleResponse, ChaosScheduleRequest } from "@/types"

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, "0")}:00`)

function isScheduleActive(schedules: ChaosScheduleResponse[], day: number, hour: number) {
  if (schedules.length === 0) {
    // Default heatmap for empty state
    const biz = day < 5 && hour >= 9 && hour < 18
    const peak = day < 5 && (hour === 10 || hour === 14 || hour === 16)
    return { active: biz, peak }
  }
  // Check real schedules
  const dayNames = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY","SUNDAY"]
  const dayName = dayNames[day]
  const hourStr = `${String(hour).padStart(2,"0")}:00`
  const active = schedules.some(s => {
    if (!s.enabled) return false
    const daysArr = s.daysOfWeek?.split(",") ?? []
    if (!daysArr.includes(dayName)) return false
    return hourStr >= s.startTime && hourStr < s.endTime
  })
  return { active, peak: false }
}

const defaultForm: ChaosScheduleRequest = {
  name: "",
  enabled: true,
  daysOfWeek: "MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY",
  startTime: "09:00",
  endTime: "18:00",
}

export default function SchedulesPage() {
  const [rules, setRules] = useState<ChaosRuleResponse[]>([])
  const [schedules, setSchedules] = useState<ChaosScheduleResponse[]>([])
  const [selectedRule, setSelectedRule] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<ChaosScheduleRequest>(defaultForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    rulesApi.list().then(data => {
      setRules(data)
      if (data.length > 0) {
        setSelectedRule(data[0].id)
      }
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedRule) return
    schedulesApi.list(selectedRule).then(setSchedules).catch(() => setSchedules([]))
  }, [selectedRule])

  const createSchedule = async () => {
    if (!selectedRule || !form.name.trim()) return
    setSaving(true)
    try {
      const created = await schedulesApi.create(selectedRule, form)
      setSchedules(s => [...s, created])
      setShowForm(false)
      setForm(defaultForm)
    } catch {
      alert("Failed to create schedule.")
    } finally {
      setSaving(false)
    }
  }

  const deleteSchedule = async (scheduleId: number) => {
    if (!selectedRule || !confirm("Delete this schedule?")) return
    try {
      setSchedules(s => s.filter(x => x.id !== scheduleId))
      await schedulesApi.delete(selectedRule, scheduleId)
    } catch {
      if (selectedRule) schedulesApi.list(selectedRule).then(setSchedules)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-[#6c47ff] border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-4 lg:space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#e8e8f0]">Schedules</h2>
          <p className="text-xs text-[#4a4a6a]">Active chaos time windows</p>
        </div>
        <button onClick={() => setShowForm(true)} disabled={!selectedRule} className="px-3 py-2 lg:px-4 rounded-lg bg-[#6c47ff] text-white text-sm font-medium hover:bg-[#7c57ff] disabled:opacity-50">
          + Add Schedule
        </button>
      </div>

      {/* Rule selector */}
      {rules.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {rules.map(r => (
            <button key={r.id} onClick={() => setSelectedRule(r.id)}
              className={cn("px-3 py-1.5 rounded-lg text-xs font-mono transition-all border", selectedRule === r.id ? "bg-[#6c47ff]/20 text-[#a78bfa] border-[#6c47ff]/40" : "text-[#8888aa] border-[#1e1e2e] hover:border-[#6c47ff]/30")}>
              {r.target}
            </button>
          ))}
        </div>
      )}

      {rules.length === 0 && (
        <div className="bg-[#111118] border border-[#1e1e2e] rounded-xl p-8 text-center">
          <p className="text-xs text-[#4a4a6a] font-mono">No chaos rules found. Create a rule first to add schedules.</p>
        </div>
      )}

      {showForm && selectedRule && (
        <div className="bg-[#111118] rounded-xl border border-[#6c47ff]/40 p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#e8e8f0]">New Schedule for "{rules.find(r => r.id === selectedRule)?.target}"</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Business hours" className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Days of Week</label>
              <input value={form.daysOfWeek} onChange={e => setForm(f => ({ ...f, daysOfWeek: e.target.value }))} placeholder="MONDAY,TUESDAY,..." className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">Start Time</label>
              <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-[#4a4a6a] block mb-1">End Time</label>
              <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-[#e8e8f0] focus:border-[#6c47ff] outline-none" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={createSchedule} disabled={saving || !form.name.trim()} className="px-4 py-2 rounded-lg bg-[#6c47ff] text-white text-sm font-medium hover:bg-[#7c57ff] disabled:opacity-50">
              {saving ? "Creating..." : "Create Schedule"}
            </button>
            <button onClick={() => { setShowForm(false); setForm(defaultForm) }} className="px-4 py-2 rounded-lg border border-[#1e1e2e] text-[#8888aa] text-sm">Cancel</button>
          </div>
        </div>
      )}

      {/* Existing schedules list */}
      {selectedRule && schedules.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase text-[#4a4a6a]">Active Schedules</h3>
          {schedules.map(s => (
            <div key={s.id} className="bg-[#111118] rounded-xl border border-[#1e1e2e] p-4 flex items-center justify-between group">
              <div>
                <p className="text-sm font-medium text-[#e8e8f0]">{s.name}</p>
                <p className="text-xs text-[#4a4a6a] font-mono mt-0.5">{s.startTime} – {s.endTime} · {s.daysOfWeek}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={cn("w-2 h-2 rounded-full", s.enabled ? "bg-[#00e5a0] animate-pulse" : "bg-[#4a4a6a]")} />
                <button onClick={() => deleteSchedule(s.id)} className="opacity-0 group-hover:opacity-100 text-[#ff3b5c]/60 hover:text-[#ff3b5c] text-xs transition-all">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Heatmap */}
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
                    const { active, peak } = isScheduleActive(schedules, di, hi)
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
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1e1e2e] inline-block" />Inactive</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#6c47ff]/40 inline-block" />Active</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#ff3b5c]/70 inline-block" />Peak</span>
        </div>
      </div>
    </div>
  )
}