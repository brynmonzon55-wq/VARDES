import { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Mail,
  Download,
  ChevronLeft,
  ChevronRight,
  Phone,
  Home,
  Globe,
  Share2,
  GraduationCap
} from "lucide-react";
import { User, AttendanceRecord, AttendanceStatus } from "../types";
import { getAttendanceRecords, calculateStudentStats, formatDate, getUserPresence } from "../lib/db";
import UserAvatar from "./UserAvatar";

interface StudentProfileProps {
  student: User;
  onBack?: () => void;
  onClose?: () => void;
}

const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const STATUS_RANK: Record<AttendanceStatus, number> = { Absent: 3, Late: 2, Present: 1 };

// Builds a Mon-first calendar grid of day numbers (null = empty leading/trailing cell)
function getMonthGrid(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // convert Sun-first to Mon-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function StudentProfile({ student, onBack, onClose }: StudentProfileProps) {
  useEffect(() => {
    // Smoothly scroll down to the profile view when opened
    const timer = setTimeout(() => {
      const el = document.getElementById("student-profile");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [student.id]);

  const handleClose = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onClose) onClose();
    else if (onBack) onBack();
  };
  const [monthOffset, setMonthOffset] = useState(0);

  // Real attendance history for this student
  const allRecords = useMemo(
    () => getAttendanceRecords().filter((r) => r.studentId.toLowerCase() === student.id.toLowerCase()),
    [student.id]
  );

  const stats = useMemo(() => calculateStudentStats(student.id), [student.id, allRecords.length]);

  const now = new Date();
  const todayStr = formatDate(now);
  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    allRecords.forEach((r) => {
      const existing = map.get(r.date);
      if (!existing || STATUS_RANK[r.status] > STATUS_RANK[existing.status]) {
        map.set(r.date, r);
      }
    });
    return map;
  }, [allRecords]);

  const cells = getMonthGrid(year, month);

  // Current streak
  const streak = useMemo(() => {
    const dates = Array.from(new Set(allRecords.map((r) => r.date))).sort().reverse();
    let count = 0;
    for (const date of dates) {
      const dayRecords = allRecords.filter((r) => r.date === date);
      const worst = dayRecords.some((r) => r.status === "Absent")
        ? "Absent"
        : dayRecords.some((r) => r.status === "Late")
        ? "Late"
        : "Present";
      if (worst === "Absent") break;
      count++;
    }
    return count;
  }, [allRecords]);

  const subjectBreakdown = useMemo(() => {
    const map = new Map<string, { absences: number; late: number }>();
    allRecords.forEach((r) => {
      const subject = r.subject || "General";
      const entry = map.get(subject) || { absences: 0, late: 0 };
      if (r.status === "Absent") entry.absences++;
      if (r.status === "Late") entry.late++;
      map.set(subject, entry);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].absences - a[1].absences || b[1].late - a[1].late);
  }, [allRecords]);

  const handleExport = () => {
    const header = "Date,Time,Status,Subject,Notes\n";
    const rows = allRecords
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((r) => [r.date, r.time, r.status, r.subject || "", (r.notes || "").replace(/,/g, ";")].join(","))
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${student.id}-attendance-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusCellClass: Record<AttendanceStatus, string> = {
    Present: "bg-teal-500/20 text-teal-300 border border-teal-500/40",
    Late: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    Absent: "bg-rose-500/20 text-rose-300 border border-rose-500/40",
  };

  const social = student.socialAccounts || {};
  const hasSocials = Boolean(social.facebook || social.twitter || social.linkedin || social.github || social.instagram);

  return (
    <div className="space-y-6" id="student-profile">
      <button
        onClick={handleClose}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
        id="profile-back-btn"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to Roster
      </button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-cream border border-ink-soft/10 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center gap-5"
      >
        <UserAvatar name={student.name} avatarUrl={student.avatarUrl} role={student.role} size="2xl" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-ink font-display truncate">{student.name}</h2>
            {(() => {
              const presence = getUserPresence(student);
              return (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 ${
                    presence.isOnline
                      ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800/80 text-slate-400 border border-slate-700"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      presence.isOnline ? "bg-emerald-400" : "bg-slate-500"
                    }`}
                  />
                  {presence.isOnline ? "Online" : presence.timeAgoText}
                </span>
              );
            })()}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                student.isApproved
                  ? "bg-teal-950/80 text-teal-300 border border-teal-500/40"
                  : "bg-amber-950/80 text-amber-300 border border-amber-500/40"
              }`}
            >
              {student.isApproved ? "Verified" : "Pending"}
            </span>
          </div>
          <p className="text-xs text-ink-soft/60 font-mono mt-0.5">Student ID: #{student.id}</p>
          {student.department && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-violet-950/40 text-violet-300 border border-violet-800/50 text-xs font-bold">
              <GraduationCap className="h-3.5 w-3.5 text-cyan-400" />
              <span>{student.department}</span>
            </div>
          )}
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3">
            <div>
              <p className="text-[10px] font-bold text-ink-soft/50 uppercase tracking-wide">Attendance Rate</p>
              <p className="text-lg font-bold text-teal-400 font-display">{stats.percentage}%</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-ink-soft/50 uppercase tracking-wide">Current Streak</p>
              <p className="text-lg font-bold text-coral-400 font-display">
                {streak} {streak === 1 ? "Day" : "Days"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          {student.email && (
            <a
              href={`mailto:${student.email}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-teal-300 bg-teal-950/80 hover:bg-teal-900/80 border border-teal-500/40 rounded-full transition-all cursor-pointer"
              id="profile-contact-btn"
            >
              <Mail className="h-3.5 w-3.5" /> Email
            </a>
          )}
          {student.phone && (
            <a
              href={`tel:${student.phone}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-violet-300 bg-violet-950/80 hover:bg-violet-900/80 border border-violet-500/40 rounded-full transition-all cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5" /> Call
            </a>
          )}
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-full shadow-violet hover:-translate-y-0.5 transition-all cursor-pointer"
            id="profile-export-btn"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-cream border border-ink-soft/10 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-ink font-display">Attendance Calendar</h3>
            <div className="flex items-center gap-1 bg-cream-dim/60 rounded-full px-1 py-1">
              <button
                onClick={() => setMonthOffset((m) => m - 1)}
                className="p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                id="calendar-prev-btn"
              >
                <ChevronLeft className="h-4 w-4 text-ink-soft" />
              </button>
              <span className="text-xs font-bold text-ink px-2 min-w-[110px] text-center">{monthLabel}</span>
              <button
                onClick={() => setMonthOffset((m) => m + 1)}
                className="p-1.5 rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
                id="calendar-next-btn"
              >
                <ChevronRight className="h-4 w-4 text-ink-soft" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center mb-2">
            {WEEKDAY_LABELS.map((d) => (
              <span key={d} className="text-[10px] font-bold text-ink-soft/50">
                {d}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const record = recordsByDate.get(dateStr);
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-xl flex items-center justify-center text-xs font-semibold ${
                    isFuture ? "text-ink-soft/30" : record ? statusCellClass[record.status] : "bg-cream-dim/60 text-ink-soft/40"
                  } ${isToday ? "ring-2 ring-violet-400" : ""}`}
                  title={record ? `${record.status}${record.subject ? " · " + record.subject : ""}` : undefined}
                >
                  {day}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-ink-soft/10">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft/70">
              <span className="h-2 w-2 rounded-full bg-teal-500" /> Present
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft/70">
              <span className="h-2 w-2 rounded-full bg-coral-500" /> Late
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-ink-soft/70">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Absent
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Profile Details (Address, Email, Phone, Location) */}
          <div className="bg-cream border border-ink-soft/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink font-display flex items-center gap-2">
              <Home className="h-4 w-4 text-violet-400" />
              <span>Contact & Address Info</span>
            </h3>

            <div className="space-y-3 text-xs">
              {student.email && (
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                  <Mail className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft/60">Email Address</p>
                    <a href={`mailto:${student.email}`} className="font-bold text-ink hover:text-teal-400 truncate block">
                      {student.email}
                    </a>
                  </div>
                </div>
              )}

              {student.phone && (
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                  <Phone className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft/60">Phone Number</p>
                    <a href={`tel:${student.phone}`} className="font-bold text-ink hover:text-violet-400 truncate block">
                      {student.phone}
                    </a>
                  </div>
                </div>
              )}

              {student.address && (
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                  <Home className="h-4 w-4 text-coral-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft/60">Residential Address</p>
                    <p className="font-bold text-ink leading-snug">{student.address}</p>
                  </div>
                </div>
              )}

              {student.department && (
                <div className="flex items-start gap-3 p-3 bg-slate-900/60 rounded-2xl border border-slate-700/50">
                  <GraduationCap className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-soft/60">Department / Course</p>
                    <p className="font-bold text-ink leading-snug">{student.department}</p>
                  </div>
                </div>
              )}

              {!student.email && !student.phone && !student.address && !student.department && (
                <p className="text-xs text-ink-soft/50 italic">No contact or academic details configured yet.</p>
              )}
            </div>
          </div>

          {/* Connected Social Media Accounts */}
          <div className="bg-cream border border-ink-soft/10 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink font-display flex items-center gap-2">
              <Share2 className="h-4 w-4 text-teal-400" />
              <span>Social Accounts</span>
            </h3>

            {hasSocials ? (
              <div className="grid grid-cols-1 gap-2 text-xs">
                {social.facebook && (
                  <div className="p-2.5 bg-blue-950/40 border border-blue-800/40 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-blue-300 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> Facebook
                    </span>
                    <span className="font-semibold text-ink-soft truncate max-w-[160px]">{social.facebook}</span>
                  </div>
                )}
                {social.twitter && (
                  <div className="p-2.5 bg-sky-950/40 border border-sky-800/40 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-sky-300 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> Twitter / X
                    </span>
                    <span className="font-semibold text-ink-soft truncate max-w-[160px]">{social.twitter}</span>
                  </div>
                )}
                {social.linkedin && (
                  <div className="p-2.5 bg-indigo-950/40 border border-indigo-800/40 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-indigo-300 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> LinkedIn
                    </span>
                    <span className="font-semibold text-ink-soft truncate max-w-[160px]">{social.linkedin}</span>
                  </div>
                )}
                {social.github && (
                  <div className="p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-slate-200 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> GitHub
                    </span>
                    <span className="font-semibold text-ink-soft truncate max-w-[160px]">{social.github}</span>
                  </div>
                )}
                {social.instagram && (
                  <div className="p-2.5 bg-pink-950/40 border border-pink-800/40 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-pink-300 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> Instagram
                    </span>
                    <span className="font-semibold text-ink-soft truncate max-w-[160px]">{social.instagram}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-ink-soft/50 italic">No social media profiles connected yet.</p>
            )}
          </div>

          <div className="bg-cream border border-ink-soft/10 rounded-3xl p-6 shadow-xl">
            <h3 className="text-base font-bold text-ink font-display mb-4">Subject Absences</h3>
            {subjectBreakdown.length === 0 ? (
              <p className="text-xs text-ink-soft/50">No attendance records yet for this student.</p>
            ) : (
              <div className="space-y-3">
                {subjectBreakdown.map(([subject, { absences, late }]) => {
                  const width = Math.min(100, (absences + late) * 20);
                  return (
                    <div key={subject}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-ink">{subject}</span>
                        <span
                          className={`font-bold ${
                            absences > 0 ? "text-rose-400" : late > 0 ? "text-coral-400" : "text-ink-soft/50"
                          }`}
                        >
                          {absences > 0 ? `${absences} Absence${absences > 1 ? "s" : ""}` : late > 0 ? `${late} Late` : "0 Absences"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-cream-dim rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${absences > 0 ? "bg-rose-500" : late > 0 ? "bg-coral-500" : "bg-teal-500"}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
