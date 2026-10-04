import React, { useState } from "react";
import { motion } from "motion/react";
import {
  GraduationCap,
  Building2,
  IdCard,
  AlertCircle,
  ArrowRight,
  LogOut,
  UserCheck,
  BookOpen
} from "lucide-react";
import { User } from "../types";
import { getUsers, updateUserProfile, saveUser } from "../lib/db";

interface GoogleOnboardingModalProps {
  user: User;
  onComplete: (updatedUser: User) => void;
  onLogout: () => void;
}

const COMMON_DEPARTMENTS = [
  "BS Computer Engineering (BSCpE)",
  "BS Computer Science (BSCS)",
  "BS Information Technology (BSIT)",
  "BS Electronics Engineering (BCEE)",
  "BS Electrical Engineering (BSEE)",
  "BS Business Administration (BSBA)",
  "BS Accountancy (BSA)",
  "BS Nursing (BSN)",
  "Bachelor of Elementary Education (BEEd)",
  "Other / Custom Course"
];

export default function GoogleOnboardingModal({
  user,
  onComplete,
  onLogout,
}: GoogleOnboardingModalProps) {
  const initialStudentId = user.id.startsWith("google_") ? "" : user.id;
  const [studentId, setStudentId] = useState(initialStudentId);
  
  const initialDeptIsCustom = user.department && !COMMON_DEPARTMENTS.includes(user.department);
  const [selectedDeptPreset, setSelectedDeptPreset] = useState<string>(
    user.department
      ? COMMON_DEPARTMENTS.includes(user.department)
        ? user.department
        : "Other / Custom Course"
      : COMMON_DEPARTMENTS[0]
  );
  const [customDept, setCustomDept] = useState<string>(initialDeptIsCustom ? user.department || "" : "");
  const [fullName, setFullName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = studentId.trim();
    const finalDepartment =
      selectedDeptPreset === "Other / Custom Course"
        ? customDept.trim()
        : selectedDeptPreset.trim();
    const cleanName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanId) {
      setError("Please enter your official Student ID / Username.");
      return;
    }

    if (!finalDepartment) {
      setError("Please enter or select your Department / Course.");
      return;
    }

    if (!cleanName) {
      setError("Please provide your Full Name.");
      return;
    }

    // Check for duplicate Student ID among other users
    const existingUsers = getUsers();
    const duplicate = existingUsers.find(
      (u) =>
        u.id.toLowerCase() === cleanId.toLowerCase() &&
        u.uid !== user.uid &&
        u.id.toLowerCase() !== user.id.toLowerCase()
    );

    if (duplicate) {
      setError(`Student ID or Username "${cleanId}" is already registered to another account. Please choose a unique ID.`);
      return;
    }

    setIsSaving(true);
    try {
      const updates: Partial<User> = {
        id: cleanId,
        department: finalDepartment,
        name: cleanName,
        email: cleanEmail || undefined,
      };

      const updatedUser = await updateUserProfile(user, updates);
      saveUser(updatedUser);
      onComplete(updatedUser);
    } catch (err: any) {
      console.error("Error updating profile during onboarding:", err);
      setError(err?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-white my-auto"
      >
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-cyan-600/30 via-fuchsia-600/20 to-slate-900 p-6 border-b border-slate-800 relative">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-fuchsia-500 p-0.5 shadow-lg shadow-cyan-500/20">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-[14px]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-cyan-400" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-cyan-400 uppercase tracking-wider">
                  Google Sign-In Connected
                </div>
                <h2 className="text-lg font-black text-white leading-tight">
                  Complete Student Profile
                </h2>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-3 leading-relaxed">
            Welcome! To ensure your attendance and grades are correctly recorded by your instructors, please specify your <strong className="text-white">Department / Course</strong> and official <strong className="text-white">Student ID / Username</strong>.
          </p>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-rose-950/80 border border-rose-500/50 rounded-2xl text-rose-200 text-xs font-semibold flex items-start gap-2.5"
            >
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Student ID / Username */}
          <div>
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
              <IdCard className="h-4 w-4 text-cyan-400" />
              <span>Student ID / Username</span>
              <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="e.g. 2024-00123 or student_alex"
              required
              className="w-full p-3 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 focus:outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Your official school ID number or unique student username.
            </p>
          </div>

          {/* Department / Course */}
          <div>
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
              <Building2 className="h-4 w-4 text-fuchsia-400" />
              <span>Department / Course</span>
              <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedDeptPreset}
              onChange={(e) => setSelectedDeptPreset(e.target.value)}
              className="w-full p-3 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 focus:outline-none transition-all"
            >
              {COMMON_DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {selectedDeptPreset === "Other / Custom Course" && (
              <input
                type="text"
                value={customDept}
                onChange={(e) => setCustomDept(e.target.value)}
                placeholder="Type your specific Department or Course name..."
                required
                className="w-full mt-2 p-3 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 focus:outline-none transition-all"
              />
            )}
            <p className="text-[11px] text-slate-400 mt-1">
              Teachers filter students and assign section check-ins based on department.
            </p>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              required
              className="w-full p-3 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-emerald-400 focus:outline-none transition-all"
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span>Contact Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@school.edu"
              className="w-full p-3 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none transition-all"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 cursor-pointer transition-all"
            >
              Cancel / Logout
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-3 text-xs font-black text-slate-950 bg-gradient-to-r from-cyan-400 to-fuchsia-400 hover:from-cyan-300 hover:to-fuchsia-300 rounded-xl shadow-lg shadow-cyan-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <span>{isSaving ? "Saving Profile..." : "Complete Setup & Launch Dashboard"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
