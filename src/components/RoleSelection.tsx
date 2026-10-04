import { motion } from "motion/react";
import { GraduationCap, Briefcase, ChevronRight, ArrowLeft } from "lucide-react";
import { UserRole } from "../types";
import type { AppTheme, AppThemeMode } from "../App";

interface RoleSelectionProps {
  onSelectRole: (role: UserRole) => void;
  onBackToHome?: () => void;
  onQuickTestLogin?: (role: UserRole) => void;
  theme?: AppTheme;
  themeMode?: AppThemeMode;
}

function getRoleCardThemeStyles(theme: AppTheme = "default", mode: AppThemeMode = "night") {
  const isNight = mode === "night";

  switch (theme) {
    case "sakura":
      return {
        cardBg: "bg-slate-900/60 hover:bg-slate-900/80",
        student: {
          border: isNight ? "border-pink-300/30 hover:border-pink-200" : "border-pink-200 hover:border-pink-400",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(253,164,175,0.35)]",
          iconBg: "bg-pink-400/20 group-hover:bg-pink-400/30 border border-pink-300/40 shadow-[0_0_15px_rgba(253,164,175,0.3)]",
          iconColor: "text-pink-200",
          iconGlow: "drop-shadow-[0_0_8px_rgba(253,164,175,0.6)]",
          titleHover: "group-hover:text-pink-100",
          buttonBg: "bg-gradient-to-r from-pink-100 via-pink-200 to-rose-300 hover:from-white hover:to-pink-100 text-slate-950 font-black shadow-[0_0_20px_rgba(253,164,175,0.4)]",
        },
        teacher: {
          border: isNight ? "border-rose-300/30 hover:border-rose-200" : "border-rose-200 hover:border-rose-400",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(251,113,133,0.35)]",
          iconBg: "bg-rose-400/20 group-hover:bg-rose-400/30 border border-rose-300/40 shadow-[0_0_15px_rgba(251,113,133,0.3)]",
          iconColor: "text-rose-200",
          iconGlow: "drop-shadow-[0_0_8px_rgba(251,113,133,0.6)]",
          titleHover: "group-hover:text-rose-100",
          buttonBg: "bg-gradient-to-r from-rose-200 via-pink-200 to-pink-100 hover:from-white hover:to-rose-100 text-slate-950 font-black shadow-[0_0_20px_rgba(251,113,133,0.4)]",
        },
      };

    case "spring":
      return {
        cardBg: "bg-slate-900/60 hover:bg-slate-900/80",
        student: {
          border: isNight ? "border-pink-500/30 hover:border-pink-400" : "border-pink-300 hover:border-pink-500",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(244,114,182,0.35)]",
          iconBg: "bg-pink-500/20 group-hover:bg-pink-500/30 border border-pink-400/40 shadow-[0_0_15px_rgba(244,114,182,0.3)]",
          iconColor: "text-pink-400",
          iconGlow: "drop-shadow-[0_0_8px_rgba(244,114,182,0.6)]",
          titleHover: "group-hover:text-pink-300",
          buttonBg: "bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 hover:from-pink-300 hover:to-rose-300 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(244,114,182,0.4)]",
        },
        teacher: {
          border: isNight ? "border-emerald-500/30 hover:border-emerald-400" : "border-emerald-300 hover:border-emerald-500",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(52,211,153,0.35)]",
          iconBg: "bg-emerald-500/20 group-hover:bg-emerald-500/30 border border-emerald-400/40 shadow-[0_0_15px_rgba(52,211,153,0.3)]",
          iconColor: "text-emerald-400",
          iconGlow: "drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]",
          titleHover: "group-hover:text-emerald-300",
          buttonBg: "bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(52,211,153,0.4)]",
        },
      };

    case "summer":
      return {
        cardBg: "bg-slate-900/60 hover:bg-slate-900/80",
        student: {
          border: isNight ? "border-amber-500/30 hover:border-amber-400" : "border-amber-300 hover:border-amber-500",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(251,191,36,0.35)]",
          iconBg: "bg-amber-500/20 group-hover:bg-amber-500/30 border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]",
          iconColor: "text-amber-400",
          iconGlow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]",
          titleHover: "group-hover:text-amber-300",
          buttonBg: "bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.4)]",
        },
        teacher: {
          border: isNight ? "border-sky-500/30 hover:border-sky-400" : "border-sky-300 hover:border-sky-500",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(56,189,248,0.35)]",
          iconBg: "bg-sky-500/20 group-hover:bg-sky-500/30 border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.3)]",
          iconColor: "text-sky-400",
          iconGlow: "drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]",
          titleHover: "group-hover:text-sky-300",
          buttonBg: "bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 hover:from-sky-300 hover:to-cyan-300 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(56,189,248,0.4)]",
        },
      };

    case "autumn":
      return {
        cardBg: "bg-slate-900/60 hover:bg-slate-900/80",
        student: {
          border: isNight ? "border-orange-500/30 hover:border-orange-400" : "border-orange-300 hover:border-orange-500",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(249,115,22,0.35)]",
          iconBg: "bg-orange-500/20 group-hover:bg-orange-500/30 border border-orange-400/40 shadow-[0_0_15px_rgba(249,115,22,0.3)]",
          iconColor: "text-orange-400",
          iconGlow: "drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]",
          titleHover: "group-hover:text-orange-300",
          buttonBg: "bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 hover:from-orange-300 hover:to-amber-300 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(249,115,22,0.4)]",
        },
        teacher: {
          border: isNight ? "border-red-500/30 hover:border-red-400" : "border-red-300 hover:border-red-500",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(239,68,68,0.35)]",
          iconBg: "bg-red-500/20 group-hover:bg-red-500/30 border border-red-400/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]",
          iconColor: "text-red-400",
          iconGlow: "drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]",
          titleHover: "group-hover:text-red-300",
          buttonBg: "bg-gradient-to-r from-red-500 via-orange-500 to-amber-500 hover:from-red-400 hover:to-orange-400 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(239,68,68,0.4)]",
        },
      };

    case "winter":
      return {
        cardBg: "bg-slate-900/60 hover:bg-slate-900/80",
        student: {
          border: isNight ? "border-sky-500/30 hover:border-sky-300" : "border-sky-300 hover:border-sky-500",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(56,189,248,0.35)]",
          iconBg: "bg-sky-500/20 group-hover:bg-sky-500/30 border border-sky-400/40 shadow-[0_0_15px_rgba(56,189,248,0.3)]",
          iconColor: "text-sky-300",
          iconGlow: "drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]",
          titleHover: "group-hover:text-sky-200",
          buttonBg: "bg-gradient-to-r from-sky-300 via-cyan-300 to-blue-400 hover:from-sky-200 hover:to-cyan-200 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(56,189,248,0.4)]",
        },
        teacher: {
          border: isNight ? "border-indigo-500/30 hover:border-indigo-300" : "border-indigo-300 hover:border-indigo-500",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(129,140,248,0.35)]",
          iconBg: "bg-indigo-500/20 group-hover:bg-indigo-500/30 border border-indigo-400/40 shadow-[0_0_15px_rgba(129,140,248,0.3)]",
          iconColor: "text-indigo-300",
          iconGlow: "drop-shadow-[0_0_8px_rgba(129,140,248,0.6)]",
          titleHover: "group-hover:text-indigo-200",
          buttonBg: "bg-gradient-to-r from-indigo-400 via-sky-400 to-cyan-400 hover:from-indigo-300 hover:to-sky-300 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(129,140,248,0.4)]",
        },
      };

    case "default":
    default:
      return {
        cardBg: "bg-slate-900/60 hover:bg-slate-900/80",
        student: {
          border: "border-amber-500/30 hover:border-amber-400",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(251,191,36,0.35)]",
          iconBg: "bg-amber-500/20 group-hover:bg-amber-500/30 border border-amber-400/40 shadow-[0_0_15px_rgba(251,191,36,0.3)]",
          iconColor: "text-amber-400",
          iconGlow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]",
          titleHover: "group-hover:text-amber-300",
          buttonBg: "bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.4)]",
        },
        teacher: {
          border: "border-cyan-500/30 hover:border-cyan-400",
          shadow: "shadow-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.35)]",
          iconBg: "bg-cyan-500/20 group-hover:bg-cyan-500/30 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,240,255,0.3)]",
          iconColor: "text-cyan-400",
          iconGlow: "drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]",
          titleHover: "group-hover:text-cyan-300",
          buttonBg: "bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-extrabold shadow-[0_0_20px_rgba(0,240,255,0.4)]",
        },
      };
  }
}

export default function RoleSelection({
  onSelectRole,
  onBackToHome,
  theme = "default",
  themeMode = "night",
}: RoleSelectionProps) {
  const styles = getRoleCardThemeStyles(theme, themeMode);

  return (
    <div className="flex flex-1 items-center justify-center px-4 sm:px-8 py-6 my-auto max-w-full">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 sm:gap-8"
        id="role-selection-card"
      >
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="self-start inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shadow-sm backdrop-blur-md"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Back to Home</span>
          </button>
        )}

        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight font-display text-white">
            Choose Your Portal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm md:text-base max-w-md mx-auto">
            Select your account type to sign in and access your workspace
          </p>
        </div>

        {/* Role Portal Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 w-full max-w-2xl">
          {/* Student Role */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={() => onSelectRole("student")}
            className={`flex flex-row sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center p-6 sm:p-8 min-h-[96px] sm:min-h-[auto] ${styles.cardBg} border ${styles.student.border} rounded-2xl sm:rounded-3xl ${styles.student.shadow} transition-all cursor-pointer group backdrop-blur-xl`}
            id="select-student-btn"
          >
            <div className="flex flex-row sm:flex-col items-center gap-3.5 sm:gap-0">
              <div className={`p-3 sm:p-4 ${styles.student.iconBg} rounded-xl sm:rounded-2xl ${styles.student.iconColor} sm:mb-3.5 group-hover:scale-105 transition-all shrink-0`}>
                <GraduationCap className={`h-6 w-6 sm:h-8 sm:w-8 ${styles.student.iconColor}`} />
              </div>
              <div>
                <h3 className={`text-lg sm:text-xl font-bold text-white font-display sm:mb-1.5 ${styles.student.titleHover} transition-colors`}>
                  Student
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 hidden sm:block mb-5 max-w-[220px] leading-relaxed">
                  Check in to active classes, track your attendance history, and review course status.
                </p>
                <p className="text-[11px] text-slate-300 sm:hidden">
                  Check in & track records
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center justify-center text-xs ${styles.student.buttonBg} px-4 py-2 sm:w-full sm:max-w-[180px] rounded-xl transition-all shrink-0 shadow-sm`}>
              Enter Portal <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </span>
          </motion.button>

          {/* Teacher Role */}
          <motion.button
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={() => onSelectRole("teacher")}
            className={`flex flex-row sm:flex-col items-center justify-between sm:justify-center text-left sm:text-center p-6 sm:p-8 min-h-[96px] sm:min-h-[auto] ${styles.cardBg} border ${styles.teacher.border} rounded-2xl sm:rounded-3xl ${styles.teacher.shadow} transition-all cursor-pointer group backdrop-blur-xl`}
            id="select-teacher-btn"
          >
            <div className="flex flex-row sm:flex-col items-center gap-3.5 sm:gap-0">
              <div className={`p-3 sm:p-4 ${styles.teacher.iconBg} rounded-xl sm:rounded-2xl ${styles.teacher.iconColor} sm:mb-3.5 group-hover:scale-105 transition-all shrink-0`}>
                <Briefcase className={`h-6 w-6 sm:h-8 sm:w-8 ${styles.teacher.iconColor}`} />
              </div>
              <div>
                <h3 className={`text-lg sm:text-xl font-bold text-white font-display sm:mb-1.5 ${styles.teacher.titleHover} transition-colors`}>
                  Teacher
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 hidden sm:block mb-5 max-w-[220px] leading-relaxed">
                  Create classrooms, monitor live check-ins, manage rosters, and export CSV reports.
                </p>
                <p className="text-[11px] text-slate-300 sm:hidden">
                  Classrooms & live records
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center justify-center text-xs ${styles.teacher.buttonBg} px-4 py-2 sm:w-full sm:max-w-[180px] rounded-xl transition-all shrink-0 shadow-sm`}>
              Enter Portal <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
