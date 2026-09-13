import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Mail,
  Phone,
  BookOpen,
  CheckCircle2,
  Clock,
  Globe,
  Share2,
  Building2,
  ShieldCheck,
  Edit,
  Users,
  X,
  Search,
  MessageSquare
} from "lucide-react";
import { User, ClassRoom } from "../types";
import { getClassesForTeacher, getUsers, getUserPresence } from "../lib/db";
import { openDirectMessage } from "./ClassMessenger";
import UserAvatar from "./UserAvatar";

interface TeacherProfileProps {
  teacher: User;
  currentUser: User;
  onClose?: () => void;
  onBack?: () => void;
  onVerifyToggle?: (teacher: User) => void;
  onEdit?: (teacher: User) => void;
  onSelectStudent?: (student: User) => void;
}

export default function TeacherProfile({
  teacher,
  currentUser,
  onClose,
  onBack,
  onVerifyToggle,
  onEdit,
  onSelectStudent,
}: TeacherProfileProps) {
  const [studentSearch, setStudentSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById("teacher-profile");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [teacher.id]);

  const handleClose = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (onClose) onClose();
    else if (onBack) onBack();
  };

  // Get teacher's classes and enrolled students
  const teacherClasses: ClassRoom[] = useMemo(() => {
    return getClassesForTeacher(teacher.id);
  }, [teacher.id]);

  const teacherStudents: User[] = useMemo(() => {
    const allStudents = getUsers().filter((u) => u.role === "student");
    const enrolledIds = new Set(teacherClasses.flatMap((c) => c.studentIds.map((id) => id.toLowerCase())));

    if (enrolledIds.size > 0) {
      return allStudents.filter((s) => enrolledIds.has(s.id.toLowerCase()));
    }

    // Legacy fallback for pre-class-system data: match by subject/department
    // instead of a class roster.
    if (teacher.subject) {
      const teacherSubjects = teacher.subject.split(',').map((s) => s.trim().toLowerCase());
      const match = allStudents.filter(
        (s) =>
          (s.subject && teacherSubjects.includes(s.subject.toLowerCase())) ||
          (s.department && teacherSubjects.includes(s.department.toLowerCase())) ||
          s.enrolledSubjects?.some((sub) => teacherSubjects.includes(sub.toLowerCase()))
      );
      if (match.length > 0) return match;
    }

    // No classes and no subject match: this teacher has no students yet.
    // (Previously this fell through to every student in the whole school -
    // a stranger's roster showing up on an unrelated teacher's profile.)
    return [];
  }, [teacher.id, teacher.subject, teacherClasses]);

  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return teacherStudents;
    const q = studentSearch.toLowerCase();
    return teacherStudents.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.location?.toLowerCase().includes(q)
    );
  }, [teacherStudents, studentSearch]);

  const social = teacher.socialAccounts || {};
  const hasSocials = Boolean(
    social.facebook || social.twitter || social.linkedin || social.github || social.instagram
  );

  const isMe = teacher.id.toLowerCase() === currentUser.id.toLowerCase();
  const isViewerTeacher = currentUser.role === "teacher";

  return (
    <div className="space-y-6" id="teacher-profile">
      <div className="flex items-center justify-between">
        <button
          onClick={handleClose}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Faculty List
        </button>

        <button
          onClick={handleClose}
          className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center gap-5 text-white"
      >
        <UserAvatar name={teacher.name} avatarUrl={teacher.avatarUrl} role="teacher" size="2xl" />

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-black text-white font-display truncate">{teacher.name}</h2>
            {(() => {
              const presence = getUserPresence(teacher);
              return (
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                    presence.isOnline
                      ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                      : "bg-slate-800/90 text-slate-400 border border-slate-700"
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
            {teacher.isApproved ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-teal-950/90 text-teal-300 border border-teal-500/40">
                <CheckCircle2 className="h-3 w-3 text-teal-400" /> Verified Faculty
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-950/90 text-amber-300 border border-amber-500/40 animate-pulse">
                <Clock className="h-3 w-3 text-amber-400" /> Pending Verification
              </span>
            )}
            {isMe && (
              <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded-full">
                Your Profile
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 font-mono">Faculty ID: #{teacher.id}</p>

          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            {teacher.subject && teacher.subject.split(',').map((sub, sIdx) => (
              <span key={sIdx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700/80 rounded-xl text-violet-300 font-bold">
                <BookOpen className="h-3.5 w-3.5 text-violet-400" /> {sub.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap md:flex-col gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          {!isMe && (
            <button
              onClick={() => openDirectMessage(teacher.id)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl transition-all cursor-pointer shadow-md shadow-violet-500/20"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Send Message
            </button>
          )}

          {teacher.email && (
            <a
              href={`mailto:${teacher.email}`}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-teal-300 bg-teal-950/80 hover:bg-teal-900 border border-teal-500/40 rounded-xl transition-all cursor-pointer"
            >
              <Mail className="h-3.5 w-3.5" /> Email Faculty
            </a>
          )}

          {teacher.phone && (
            <a
              href={`tel:${teacher.phone}`}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-violet-300 bg-violet-950/80 hover:bg-violet-900 border border-violet-500/40 rounded-xl transition-all cursor-pointer"
            >
              <Phone className="h-3.5 w-3.5" /> Call Office
            </a>
          )}

          {/* Teacher Admin Controls.
              - Verifying a colleague requires the viewer to be an approved
                teacher themselves, and a teacher can never verify (or
                un-verify) their own account.
              - Editing another teacher's profile fields, and deleting a
                colleague's account outright, are no longer possible from
                here (or anywhere) - a teacher is only ever an admin of
                their OWN account and of student accounts, never of a
                fellow teacher's. */}
          {isViewerTeacher && !isMe && currentUser.isApproved && onVerifyToggle && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onVerifyToggle(teacher)}
                className={`px-3 py-2 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  teacher.isApproved
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    : "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30"
                }`}
                title={teacher.isApproved ? "Revoke Verification Status" : "Verify Teacher Account"}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>{teacher.isApproved ? "Revoke Status" : "Verify Teacher"}</span>
              </button>
            </div>
          )}

          {isMe && onEdit && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onEdit(teacher)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-all cursor-pointer"
                title="Edit My Details"
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Office Details & Social Accounts */}
        <div className="space-y-6">
          {/* Office & Contact Info */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4 text-white">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-violet-400" />
              <span>Office & Contact Info</span>
            </h3>

            <div className="space-y-3 text-xs">
              {teacher.subject && (
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <BookOpen className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Subject(s) / Specialization(s)
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {teacher.subject.split(',').map((sub, sIdx) => (
                        <span key={sIdx} className="bg-violet-950/80 text-violet-300 px-2 py-0.5 rounded-md text-xs font-bold border border-violet-800/40">
                          {sub.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {teacher.email && (
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <Mail className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Email Address</p>
                    <a href={`mailto:${teacher.email}`} className="font-bold text-teal-300 hover:underline truncate block mt-0.5">
                      {teacher.email}
                    </a>
                  </div>
                </div>
              )}

              {teacher.phone && (
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-start gap-3">
                  <Phone className="h-4 w-4 text-fuchsia-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Phone Number</p>
                    <a href={`tel:${teacher.phone}`} className="font-bold text-fuchsia-300 hover:underline truncate block mt-0.5">
                      {teacher.phone}
                    </a>
                  </div>
                </div>
              )}

              {!teacher.subject && !teacher.email && !teacher.phone && (
                <p className="text-xs text-slate-500 italic">No contact details listed for this teacher.</p>
              )}
            </div>
          </div>

          {/* Social Profiles */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4 text-white">
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 className="h-4 w-4 text-teal-400" />
              <span>Social Profiles</span>
            </h3>

            {hasSocials ? (
              <div className="space-y-2 text-xs">
                {social.facebook && (
                  <div className="p-2.5 bg-blue-950/30 border border-blue-900/50 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-blue-300 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> Facebook
                    </span>
                    <span className="font-semibold text-slate-300 truncate max-w-[150px]">{social.facebook}</span>
                  </div>
                )}
                {social.twitter && (
                  <div className="p-2.5 bg-sky-950/30 border border-sky-900/50 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-sky-300 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> Twitter / X
                    </span>
                    <span className="font-semibold text-slate-300 truncate max-w-[150px]">{social.twitter}</span>
                  </div>
                )}
                {social.linkedin && (
                  <div className="p-2.5 bg-indigo-950/30 border border-indigo-900/50 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-indigo-300 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> LinkedIn
                    </span>
                    <span className="font-semibold text-slate-300 truncate max-w-[150px]">{social.linkedin}</span>
                  </div>
                )}
                {social.github && (
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-slate-200 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> GitHub
                    </span>
                    <span className="font-semibold text-slate-400 truncate max-w-[150px]">{social.github}</span>
                  </div>
                )}
                {social.instagram && (
                  <div className="p-2.5 bg-pink-950/30 border border-pink-900/50 rounded-xl flex items-center justify-between">
                    <span className="font-extrabold text-pink-300 flex items-center gap-2">
                      <Globe className="h-3.5 w-3.5" /> Instagram
                    </span>
                    <span className="font-semibold text-slate-300 truncate max-w-[150px]">{social.instagram}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No social media links provided.</p>
            )}
          </div>
        </div>

        {/* Right Column: Classes & Enrolled Students */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Classes */}
          {teacherClasses.length > 0 && (
            <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4 text-white">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-violet-400" />
                <span>Active Class Sections ({teacherClasses.length})</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teacherClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2 hover:border-violet-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-white">{cls.name}</h4>
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-violet-950 text-violet-300 border border-violet-800/60 rounded-md">
                        Code: {cls.joinCode}
                      </span>
                    </div>
                    {cls.subject && (
                      <p className="text-xs text-violet-300 font-semibold">{cls.subject}</p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-bold text-teal-300">
                        <Users className="h-3.5 w-3.5" /> {cls.studentIds.length} Enrolled Students
                      </span>
                      <span className="font-mono text-[10px] text-slate-500">{cls.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enrolled Students Roster */}
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-xl space-y-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="h-4 w-4 text-teal-400" />
                <span>Enrolled Students ({teacherStudents.length})</span>
              </h3>

              {teacherStudents.length > 0 && (
                <div className="relative">
                  <Search className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search students..."
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:border-teal-400 focus:outline-none w-full sm:w-48"
                  />
                </div>
              )}
            </div>

            {filteredStudents.length === 0 ? (
              <div className="text-center py-10 bg-slate-950/40 rounded-2xl border border-slate-800/80">
                <Users className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-400">No enrolled students found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredStudents.map((st) => (
                  <div
                    key={st.id || st.uid}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar name={st.name} avatarUrl={st.avatarUrl} role="student" size="md" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-xs text-white truncate">{st.name}</h4>
                          {st.isApproved ? (
                            <CheckCircle2 className="h-3 w-3 text-teal-400 shrink-0" />
                          ) : (
                            <Clock className="h-3 w-3 text-amber-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 truncate">@{st.id}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {st.email && (
                        <a
                          href={`mailto:${st.email}`}
                          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-teal-300 border border-slate-800 transition-colors"
                          title="Email Student"
                        >
                          <Mail className="h-3.5 w-3.5" />
                        </a>
                      )}

                      {onSelectStudent && (
                        <button
                          onClick={() => onSelectStudent(st)}
                          className="px-2.5 py-1.5 text-[11px] font-bold text-violet-300 bg-violet-950/80 hover:bg-violet-900 border border-violet-800/60 rounded-xl transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
