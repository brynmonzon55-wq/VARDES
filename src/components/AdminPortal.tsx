import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  GraduationCap,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Lock,
  AlertTriangle,
  X,
} from "lucide-react";
import { User } from "../types";
import {
  getUsers,
  updateUserApprovalStatus,
  deleteAccountByAdmin,
  addSecurityLog,
} from "../lib/db";
import UserAvatar from "./UserAvatar";

interface AdminPortalProps {
  user: User;
  onSwitchToTeaching: () => void;
}

type Tab = "teachers" | "students";
type TeacherFilter = "pending" | "verified" | "all";

const AdminPortal = ({ user, onSwitchToTeaching }: AdminPortalProps) => {
  const [users, setUsers] = useState<User[]>(() => getUsers());
  const [tab, setTab] = useState<Tab>("teachers");
  const [filter, setFilter] = useState<TeacherFilter>("pending");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Delete flow: the admin must re-enter their own password
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const reload = () => setUsers(getUsers());
    window.addEventListener("db_updated", reload);
    return () => window.removeEventListener("db_updated", reload);
  }, []);

  const teachers = useMemo(() => users.filter((u) => u.role === "teacher"), [users]);
  const students = useMemo(() => users.filter((u) => u.role === "student"), [users]);
  const pendingTeachers = teachers.filter((t) => !t.isApproved).length;
  const verifiedTeachers = teachers.filter((t) => t.isApproved).length;

  const q = search.trim().toLowerCase();
  const matches = (u: User) =>
    !q ||
    u.name.toLowerCase().includes(q) ||
    u.id.toLowerCase().includes(q) ||
    (u.email || "").toLowerCase().includes(q) ||
    (u.subject || "").toLowerCase().includes(q) ||
    (u.department || "").toLowerCase().includes(q);

  const visibleTeachers = teachers
    .filter((t) => (filter === "all" ? true : filter === "pending" ? !t.isApproved : t.isApproved))
    .filter(matches)
    .sort((a, b) => Number(a.isApproved) - Number(b.isApproved) || a.name.localeCompare(b.name));
  const visibleStudents = students.filter(matches).sort((a, b) => a.name.localeCompare(b.name));

  const toggleVerification = async (target: User) => {
    const makeVerified = !target.isApproved;
    if (
      !makeVerified &&
      !window.confirm(`Revoke verification for ${target.name}? They will lose teacher access immediately.`)
    ) {
      return;
    }
    setBusyId(target.id);
    setNotice(null);
    try {
      await updateUserApprovalStatus(target.id, makeVerified);
      addSecurityLog({
        usernameAttempted: user.id,
        type: "Verification Status Changed",
        details: `Administrator ${user.name} (${user.id}) ${makeVerified ? "verified" : "revoked verification for"} ${target.role} ${target.name} (${target.id}).`,
      });
      setUsers(getUsers());
    } catch (err: any) {
      setNotice(err?.message || "Could not update that account.");
    } finally {
      setBusyId(null);
    }
  };

  const openDelete = (target: User) => {
    setDeleteTarget(target);
    setPassword("");
    setDeleteError(null);
  };

  const confirmDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteTarget) return;
    if (!password) {
      setDeleteError("Enter your administrator password to continue.");
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccountByAdmin(deleteTarget, password);
      setNotice(`Deleted ${deleteTarget.role} account ${deleteTarget.name} (${deleteTarget.id}).`);
      setDeleteTarget(null);
      setPassword("");
      setUsers(getUsers());
    } catch (err: any) {
      const code = err?.code || err?.message || "";
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-login-credentials"
      ) {
        setDeleteError("Incorrect password. The account was not deleted.");
      } else if (code === "auth/too-many-requests") {
        setDeleteError("Too many attempts. Please wait a moment and try again.");
      } else if (code === "password-not-available") {
        setDeleteError("This session has no password to confirm. Sign out and sign in with your Admin ID and password.");
      } else if (code === "permission-denied") {
        setDeleteError("Firestore refused the deletion. Make sure the latest firestore.rules are published.");
      } else {
        setDeleteError(err?.message || "Could not delete the account.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const stat = (label: string, value: number, Icon: any, tone: string) => (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="flex items-center justify-between text-slate-400">
        <span className="text-[10px] font-extrabold uppercase tracking-wider">{label}</span>
        <Icon className={`h-4 w-4 ${tone}`} />
      </div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );

  return (
    <div className="relative min-h-screen pb-16 pt-4 sm:pt-6 px-2.5 sm:px-6 max-w-7xl mx-auto w-full min-w-0 overflow-x-hidden">
      <div className="relative z-10 space-y-4 sm:space-y-6 w-full min-w-0">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cream rounded-3xl border border-ink-soft/10 p-4 sm:p-5 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4"
        >
          <div className="flex items-center gap-3 min-w-0">
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} role="teacher" size="lg" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold bg-cyan-500/15 text-cyan-300 rounded-full border border-cyan-500/30 inline-flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Admin Portal
                </span>
                <span className="text-xs font-mono text-ink-soft/70 truncate">ID: {user.id}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-ink tracking-tight mt-0.5 truncate">
                Administrator: {user.name}
              </h1>
            </div>
          </div>
          <button
            onClick={onSwitchToTeaching}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white text-xs font-extrabold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            title="Use VARDES as a teacher: classes, attendance, posts and grading"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Teach (Teacher Portal)</span>
          </button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stat("Pending teachers", pendingTeachers, Clock, "text-amber-400")}
          {stat("Verified teachers", verifiedTeachers, CheckCircle2, "text-teal-400")}
          {stat("Students", students.length, Users, "text-cyan-400")}
          {stat("All accounts", users.length, ShieldCheck, "text-violet-400")}
        </div>

        {notice && (
          <div className="flex items-start justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-xs font-semibold text-slate-200">
            <span>{notice}</span>
            <button onClick={() => setNotice(null)} className="text-slate-500 hover:text-white cursor-pointer">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tabs + search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="bg-cream/80 backdrop-blur-xl p-1.5 rounded-2xl border border-ink-soft/10 shadow-lg flex items-center gap-1 self-start">
            {([
              { id: "teachers" as const, label: "Teachers", icon: GraduationCap, badge: pendingTeachers },
              { id: "students" as const, label: "Students", icon: Users, badge: 0 },
            ]).map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                  tab === id ? "bg-violet-600 text-white" : "text-ink-soft hover:text-ink"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {badge > 0 && (
                  <span className="ml-0.5 px-1.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            {tab === "teachers" && (
              <div className="flex gap-1">
                {([
                  { id: "pending" as const, label: "Pending" },
                  { id: "verified" as const, label: "Verified" },
                  { id: "all" as const, label: "All" },
                ]).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`px-3 py-2 text-xs font-bold rounded-xl border cursor-pointer transition-colors ${
                      filter === f.id
                        ? "bg-slate-800 border-slate-600 text-white"
                        : "border-slate-800 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
            <div className="relative sm:w-64">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, ID, email..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {(tab === "teachers" ? visibleTeachers : visibleStudents).length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center text-xs font-semibold text-slate-400">
              {tab === "teachers" && filter === "pending"
                ? "No teachers are waiting for verification."
                : "Nothing matches this view."}
            </div>
          )}

          {(tab === "teachers" ? visibleTeachers : visibleStudents).map((u) => (
            <div
              key={u.uid || u.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar name={u.name} avatarUrl={u.avatarUrl} role={u.role} size="md" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-extrabold text-sm text-white truncate">{u.name}</span>
                    {u.isApproved ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-950/80 text-teal-300 border border-teal-500/40">
                        <CheckCircle2 className="h-3 w-3" /> Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-950/80 text-amber-300 border border-amber-500/40">
                        <Clock className="h-3 w-3" /> Pending
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex flex-wrap gap-x-3">
                    <span>ID: {u.id}</span>
                    {u.email && <span>{u.email}</span>}
                    {(u.subject || u.department) && <span>{u.subject || u.department}</span>}
                    <span>Joined {u.createdAt || "N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => toggleVerification(u)}
                  disabled={busyId === u.id}
                  className={`px-3 py-1.5 text-xs font-extrabold rounded-xl transition-all cursor-pointer disabled:opacity-50 ${
                    u.isApproved
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      : "bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30"
                  }`}
                >
                  {u.isApproved ? "Revoke" : "Verify"}
                </button>
                <button
                  onClick={() => openDelete(u)}
                  title={`Delete ${u.role} account`}
                  className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-800 hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delete confirmation: requires the admin's password */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <form
            onSubmit={confirmDelete}
            className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-950 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300 shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-white">Delete {deleteTarget.role} account?</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  This permanently removes <strong className="text-slate-200">{deleteTarget.name}</strong> ({deleteTarget.id}) from VARDES
                  {deleteTarget.role === "student" ? ", including their attendance records" : ". Classes they created are kept"}.
                  They will no longer be able to sign in. To also free up their ID for re-registration, delete their login in
                  Firebase Console → Authentication. To keep the record and only remove access, use Revoke instead.
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5 mb-1.5" htmlFor="admin-confirm-password">
                <Lock className="h-3.5 w-3.5 text-cyan-400" /> Enter your administrator password
              </label>
              <input
                id="admin-confirm-password"
                type="password"
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 focus:border-cyan-500 text-sm text-white focus:outline-none"
                placeholder="Your password"
              />
              {deleteError && <p className="mt-2 text-xs font-semibold text-rose-400">{deleteError}</p>}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete account"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPortal;
