import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Key, User as UserIcon, LogIn, AlertCircle, Mail, GraduationCap } from "lucide-react";
import { UserRole, User } from "../types";
import { getUsers, addSecurityLog, registerUser, loginUser, loginWithGoogle } from "../lib/db";
import type { AppTheme, AppThemeMode } from "../App";

interface LoginFormProps {
  role: UserRole;
  onBack: () => void;
  onLoginSuccess: (user: User) => void;
  theme?: AppTheme;
  themeMode?: AppThemeMode;
}

function getThemeStyles(theme: AppTheme = "default", mode: AppThemeMode = "night", role: UserRole) {
  const isNight = mode === "night";
  const isStudent = role === "student";

  switch (theme) {
    case "sakura":
      return {
        containerBorder: isNight ? "border-pink-300/35 shadow-[0_0_35px_rgba(253,164,175,0.25)]" : "border-pink-200/70 shadow-[0_0_30px_rgba(253,164,175,0.3)]",
        containerBg: "bg-slate-900/85",
        headerGradient: isStudent
          ? "bg-gradient-to-r from-pink-400 via-rose-300 to-pink-500 border-b border-pink-300/40 text-slate-950 font-bold"
          : "bg-gradient-to-r from-rose-400 via-pink-300 to-rose-500 border-b border-rose-300/40 text-slate-950 font-bold",
        headerCapGlow: "drop-shadow-[0_0_12px_rgba(255,255,255,0.9)]",
        accentText: isStudent ? "text-pink-200" : "text-rose-200",
        subtextGlow: "drop-shadow-[0_0_6px_rgba(253,164,175,0.5)]",
        accentBorder: isStudent ? "focus:border-pink-300 focus:shadow-[0_0_15px_rgba(253,164,175,0.4)]" : "focus:border-rose-300 focus:shadow-[0_0_15px_rgba(251,113,133,0.4)]",
        backButton: "bg-white/10 border border-pink-300/40 text-pink-100 hover:text-white hover:border-pink-200 shadow-[0_0_10px_rgba(253,164,175,0.2)]",
        submitButton: "bg-gradient-to-r from-pink-100 via-pink-300 to-rose-300 hover:from-white hover:to-pink-200 text-slate-950 font-black shadow-[0_0_20px_rgba(253,164,175,0.4)]",
        toggleText: "text-pink-300 hover:text-pink-200",
        iconColor: "text-pink-300",
      };

    case "spring":
      return {
        containerBorder: isNight ? "border-pink-500/40 shadow-[0_0_40px_rgba(244,114,182,0.25)]" : "border-pink-400/60 shadow-[0_0_35px_rgba(244,114,182,0.3)]",
        containerBg: "bg-slate-900/80",
        headerGradient: isStudent
          ? "bg-gradient-to-r from-pink-600 via-rose-500 to-emerald-600 border-b border-pink-400/50 text-white"
          : "bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 border-b border-rose-400/50 text-white",
        headerCapGlow: "drop-shadow-[0_0_15px_rgba(244,114,182,0.8)]",
        accentText: isStudent ? "text-pink-300" : "text-rose-300",
        subtextGlow: "drop-shadow-[0_0_8px_rgba(244,114,182,0.5)]",
        accentBorder: isStudent ? "focus:border-pink-400 focus:shadow-[0_0_15px_rgba(244,114,182,0.4)]" : "focus:border-rose-400 focus:shadow-[0_0_15px_rgba(251,113,133,0.4)]",
        backButton: "bg-white/10 border border-pink-500/40 text-pink-200 hover:text-white hover:border-pink-300 shadow-[0_0_12px_rgba(244,114,182,0.25)]",
        submitButton: "bg-gradient-to-r from-pink-500 via-rose-400 to-emerald-400 hover:from-pink-400 hover:to-emerald-300 text-slate-950 font-extrabold shadow-[0_0_22px_rgba(244,114,182,0.45)]",
        toggleText: "text-pink-400 hover:text-pink-300",
        iconColor: "text-pink-400",
      };

    case "summer":
      return {
        containerBorder: isNight ? "border-amber-500/40 shadow-[0_0_40px_rgba(251,191,36,0.25)]" : "border-amber-400/60 shadow-[0_0_35px_rgba(251,191,36,0.3)]",
        containerBg: "bg-slate-900/80",
        headerGradient: isStudent
          ? "bg-gradient-to-r from-amber-500 via-orange-500 to-sky-600 border-b border-amber-400/50 text-white"
          : "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600 border-b border-orange-400/50 text-white",
        headerCapGlow: "drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]",
        accentText: isStudent ? "text-amber-300" : "text-orange-300",
        subtextGlow: "drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
        accentBorder: isStudent ? "focus:border-amber-400 focus:shadow-[0_0_15px_rgba(251,191,36,0.4)]" : "focus:border-orange-400 focus:shadow-[0_0_15px_rgba(249,115,22,0.4)]",
        backButton: "bg-white/10 border border-amber-500/40 text-amber-200 hover:text-white hover:border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.25)]",
        submitButton: "bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-extrabold shadow-[0_0_22px_rgba(251,191,36,0.45)]",
        toggleText: "text-amber-400 hover:text-amber-300",
        iconColor: "text-amber-400",
      };

    case "autumn":
      return {
        containerBorder: isNight ? "border-orange-500/40 shadow-[0_0_40px_rgba(249,115,22,0.25)]" : "border-orange-400/60 shadow-[0_0_35px_rgba(249,115,22,0.3)]",
        containerBg: "bg-slate-900/80",
        headerGradient: isStudent
          ? "bg-gradient-to-r from-red-600 via-orange-500 to-amber-600 border-b border-orange-400/50 text-white"
          : "bg-gradient-to-r from-red-600 via-rose-500 to-orange-600 border-b border-red-400/50 text-white",
        headerCapGlow: "drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]",
        accentText: isStudent ? "text-orange-300" : "text-red-300",
        subtextGlow: "drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]",
        accentBorder: isStudent ? "focus:border-orange-400 focus:shadow-[0_0_15px_rgba(249,115,22,0.4)]" : "focus:border-red-400 focus:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
        backButton: "bg-white/10 border border-orange-500/40 text-orange-200 hover:text-white hover:border-orange-300 shadow-[0_0_12px_rgba(249,115,22,0.25)]",
        submitButton: "bg-gradient-to-r from-orange-500 via-amber-400 to-red-400 hover:from-orange-400 hover:to-amber-300 text-slate-950 font-extrabold shadow-[0_0_22px_rgba(249,115,22,0.45)]",
        toggleText: "text-orange-400 hover:text-orange-300",
        iconColor: "text-orange-400",
      };

    case "winter":
      return {
        containerBorder: isNight ? "border-sky-500/40 shadow-[0_0_40px_rgba(56,189,248,0.25)]" : "border-sky-400/60 shadow-[0_0_35px_rgba(56,189,248,0.3)]",
        containerBg: "bg-slate-900/80",
        headerGradient: isStudent
          ? "bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-600 border-b border-sky-400/50 text-white"
          : "bg-gradient-to-r from-indigo-600 via-sky-600 to-blue-600 border-b border-indigo-400/50 text-white",
        headerCapGlow: "drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]",
        accentText: isStudent ? "text-sky-200" : "text-indigo-200",
        subtextGlow: "drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]",
        accentBorder: isStudent ? "focus:border-sky-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.4)]" : "focus:border-indigo-400 focus:shadow-[0_0_15px_rgba(129,140,248,0.4)]",
        backButton: "bg-white/10 border border-sky-500/40 text-sky-200 hover:text-white hover:border-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.25)]",
        submitButton: "bg-gradient-to-r from-sky-300 via-cyan-300 to-indigo-300 hover:from-sky-200 hover:to-cyan-200 text-slate-950 font-extrabold shadow-[0_0_22px_rgba(56,189,248,0.45)]",
        toggleText: "text-sky-300 hover:text-sky-200",
        iconColor: "text-sky-300",
      };

    case "default":
    default:
      return {
        containerBorder: isNight
          ? (isStudent ? "border-cyan-500/40 shadow-[0_0_40px_rgba(0,240,255,0.25)]" : "border-fuchsia-500/40 shadow-[0_0_40px_rgba(217,70,239,0.25)]")
          : (isStudent ? "border-cyan-400/60 shadow-[0_0_35px_rgba(0,240,255,0.3)]" : "border-fuchsia-400/60 shadow-[0_0_35px_rgba(217,70,239,0.3)]"),
        containerBg: "bg-slate-900/80",
        headerGradient: isStudent
          ? "bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 border-b border-cyan-400/50 text-white"
          : "bg-gradient-to-r from-fuchsia-600 via-pink-500 to-purple-600 border-b border-fuchsia-400/50 text-white",
        headerCapGlow: isStudent ? "drop-shadow-[0_0_15px_rgba(0,240,255,0.8)]" : "drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]",
        accentText: isStudent ? "text-cyan-200" : "text-fuchsia-200",
        subtextGlow: isStudent ? "drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]" : "drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]",
        accentBorder: isStudent ? "focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.4)]" : "focus:border-fuchsia-400 focus:shadow-[0_0_15px_rgba(217,70,239,0.4)]",
        backButton: isStudent
          ? "bg-white/10 border border-cyan-500/40 text-cyan-200 hover:text-white hover:border-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
          : "bg-white/10 border border-fuchsia-500/40 text-fuchsia-200 hover:text-white hover:border-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.25)]",
        submitButton: isStudent
          ? "bg-gradient-to-r from-cyan-400 via-teal-400 to-cyan-500 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-extrabold shadow-[0_0_22px_rgba(0,240,255,0.45)]"
          : "bg-gradient-to-r from-fuchsia-400 via-pink-400 to-purple-400 hover:from-fuchsia-300 hover:to-pink-300 text-slate-950 font-extrabold shadow-[0_0_22px_rgba(217,70,239,0.45)]",
        toggleText: isStudent ? "text-cyan-400 hover:text-cyan-300" : "text-fuchsia-400 hover:text-fuchsia-300",
        iconColor: isStudent ? "text-cyan-400" : "text-fuchsia-400",
      };
  }
}

export default function LoginForm({
  role,
  onBack,
  onLoginSuccess,
  theme = "default",
  themeMode = "night",
}: LoginFormProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    getUsers(); 
    const handleDbUpdate = () => {
      setTick(t => t + 1);
    };
    window.addEventListener("db_updated", handleDbUpdate);
    return () => {
      window.removeEventListener("db_updated", handleDbUpdate);
    };
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPasswordNote, setShowForgotPasswordNote] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    const cleanPassword = password;
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanDepartment = department.trim();

    if (!cleanUsername || !cleanPassword) {
      setError("Please fill out all required fields.");
      return;
    }

    if (isRegister && !cleanName) {
      setError("Please provide your full name for registration.");
      return;
    }

    if (isRegister && isStudent && !cleanEmail) {
      setError("Please provide your email so your teacher can reach you.");
      return;
    }

    if (isRegister && cleanEmail && !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (isRegister && cleanPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isRegister) {
        const newUser = await registerUser(cleanUsername, cleanName, cleanPassword, role, {
          email: isStudent ? cleanEmail : undefined,
          department: isStudent ? cleanDepartment : undefined,
        });
        onLoginSuccess(newUser);
      } else {
        const users = getUsers();
        if (role === "teacher") {
          const potentialStudent = users.find(
            (u) => u.id.toLowerCase() === cleanUsername.toLowerCase() && u.role === "student"
          );
          if (potentialStudent) {
            addSecurityLog({
              usernameAttempted: cleanUsername,
              type: "Impersonation Attempt",
              details: `Student user "${potentialStudent.name}" (${potentialStudent.id}) tried to log in as a teacher. Access was blocked.`
            });
            setError("Access Denied: You are registered as a Student. Student accounts are prohibited from accessing the Teacher dashboard.");
            setIsSubmitting(false);
            return;
          }
        }

        const matchedUser = await loginUser(cleanUsername, cleanPassword, role);
        onLoginSuccess(matchedUser);
      }
    } catch (err: any) {
      const code = err?.code || err?.message || "";
      if (role === "teacher" && !isRegister) {
        addSecurityLog({
          usernameAttempted: cleanUsername,
          type: "Unauthorized Access",
          details: `Failed teacher login attempt for ID "${cleanUsername}".`
        });
      }
      if (code === "auth/email-already-in-use") {
        setError(`This ${role === "student" ? "Student ID" : "Teacher ID"} is already registered.`);
      } else if (code === "account-removed") {
        setError("This account has been removed by the administrator. Please contact the administrator.");
      } else if (code === "wrong-portal") {
        setError(`This ID is registered under the other role. Please switch portals to log in.`);
      } else if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found" || code === "auth/invalid-email") {
        setError(`Invalid ${role === "student" ? "Student ID" : "Teacher ID"} or password. If you haven't created an account yet, click "Create Account" below.`);
      } else if (code === "auth/weak-password") {
        setError("Password is too weak. Please use at least 6 characters.");
      } else {
        setError(err?.message || "Authentication failed. Please check your network and credentials.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStudent = role === "student";
  const styles = getThemeStyles(theme, themeMode, role);

  return (
    <div className="flex flex-1 items-center justify-center p-2 sm:p-4 my-auto w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className={`w-full max-w-md ${styles.containerBg} backdrop-blur-2xl border rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-auto ${styles.containerBorder}`}
        id="login-container"
      >
        {/* Card Header with Theme & Mode-aware atmosphere */}
        <div
          className={`px-4 py-3.5 sm:px-8 sm:py-5 text-white ${styles.headerGradient} relative overflow-hidden`}
        >
          <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-35 pointer-events-none">
            <GraduationCap className={`h-36 w-36 sm:h-40 sm:w-40 text-white ${styles.headerCapGlow}`} />
          </div>

          <button
            onClick={onBack}
            className={`inline-flex items-center text-[11px] sm:text-xs font-extrabold transition-all mb-2 sm:mb-3 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl cursor-pointer backdrop-blur-md shadow-md ${styles.backButton}`}
            id="back-role-btn"
          >
            <ArrowLeft className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 stroke-[2.5]" /> Choose Role
          </button>

          <h2 className="text-lg sm:text-2xl font-black tracking-tight font-display text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
            {isRegister ? "Create Account" : "Welcome Back"}
          </h2>
          <p className={`text-[11px] sm:text-xs font-bold mt-0.5 sm:mt-1 font-sans ${styles.accentText} ${styles.subtextGlow}`}>
            {isStudent ? "Student Portal Sign In" : "Teacher Portal Sign In"}
          </p>
        </div>

        {/* Form area */}
        <form onSubmit={handleSubmit} className="p-3.5 sm:p-7 space-y-2.5 sm:space-y-4" id="login-form">
          {/* Google Sign In Button */}
          <div className="space-y-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                setError(null);
                try {
                  const gUser = await loginWithGoogle(role);
                  onLoginSuccess(gUser);
                } catch (err: any) {
                  if (err.message === "wrong-portal") {
                    setError(`This Google account is registered as a ${role === "student" ? "Teacher" : "Student"}. Please switch portals.`);
                  } else if (err.code === "auth/popup-blocked" || err.code === "auth/cancelled-popup-request" || err.message?.includes("popup") || err.message?.includes("closed")) {
                    setError("Google sign-in popup was closed or blocked by browser settings. Please allow popups or open in a new tab.");
                  } else {
                    setError("Failed to sign in with Google. Please check your credentials or try again.");
                  }
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="w-full py-3 px-4 bg-slate-900/90 hover:bg-slate-800/90 text-white font-bold text-xs rounded-2xl border border-white/10 shadow-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-[0.99]"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google Account</span>
            </button>

            <div className="flex items-center gap-3 my-2">
              <div className="h-[1px] bg-slate-700/80 flex-1" />
              <span className="text-[10px] font-black tracking-wider text-slate-400 uppercase">OR WITH ACCOUNT ID</span>
              <div className="h-[1px] bg-slate-700/80 flex-1" />
            </div>
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3.5 bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-2xl flex items-start gap-2.5 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
              id="login-error-banner"
            >
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {isRegister && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 flex items-center justify-between" htmlFor="reg-name">
                <span>Full Name <span className="text-rose-400">*</span></span>
              </label>
              <div className="relative">
                <input
                  id="reg-name"
                  type="text"
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950/80 border border-slate-700/80 rounded-2xl focus:outline-none transition-all text-white placeholder:text-slate-500 ${styles.accentBorder}`}
                />
                <UserIcon className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>
          )}

          {isRegister && isStudent && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between" htmlFor="reg-email">
                  <span>Email <span className="text-rose-400">*</span></span>
                </label>
                <div className="relative">
                  <input
                    id="reg-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950/80 border border-slate-700/80 rounded-2xl focus:outline-none transition-all text-white placeholder:text-slate-500 ${styles.accentBorder}`}
                  />
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-400">So your teacher can reach you.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center justify-between" htmlFor="reg-department">
                  <span>Department / Course</span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. DCPE, DCS, Computer Engineering, Computer Science</span>
                </label>
                <div className="relative">
                  <input
                    id="reg-department"
                    type="text"
                    placeholder="e.g. DCPE - Computer Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950/80 border border-slate-700/80 rounded-2xl focus:outline-none transition-all text-white placeholder:text-slate-500 ${styles.accentBorder}`}
                  />
                  <GraduationCap className={`absolute left-3.5 top-3 h-4 w-4 ${styles.iconColor}`} />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1 sm:space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between" htmlFor="login-username">
              <span>{isStudent ? "Student ID / Username" : "Teacher ID / Username"} <span className="text-rose-400">*</span></span>
            </label>
            <div className="relative">
              <input
                id="login-username"
                type="text"
                placeholder={isStudent ? "e.g. STU-2026-001 or username" : "e.g. TCH-2026-001 or username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-950/80 border rounded-xl sm:rounded-2xl focus:outline-none transition-all text-white placeholder:text-slate-500 border-slate-700/80 ${styles.accentBorder}`}
              />
              <UserIcon className="absolute left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-200" htmlFor="login-password">
                Password <span className="text-rose-400">*</span>
              </label>
              {!isRegister && (
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordNote((v) => !v)}
                  className="text-[10px] sm:text-[11px] font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 sm:py-2.5 text-xs sm:text-sm bg-slate-950/80 border rounded-xl sm:rounded-2xl focus:outline-none transition-all text-white placeholder:text-slate-500 border-slate-700/80 ${styles.accentBorder}`}
              />
              <Key className="absolute left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
            </div>
            {!isRegister && showForgotPasswordNote && (
              <p className="text-[10px] sm:text-[11px] text-slate-300 bg-slate-950/90 border border-slate-700 rounded-xl p-2.5 leading-relaxed">
                There's no self-service email reset for this app. If you're logged in elsewhere, change it from
                Settings once you're in.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 sm:py-3.5 text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 ${styles.submitButton}`}
            id="login-submit-btn"
          >
            <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[2.5]" />
            {isSubmitting ? "Please wait..." : isRegister ? "Register & Enter" : "Sign In"}
          </button>

          <div className="pt-3 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
                setUsername("");
                setPassword("");
                setName("");
              }}
              className={`text-xs font-black cursor-pointer transition-colors ${styles.toggleText}`}
              id="toggle-register-btn"
            >
              {isRegister
                ? "Already registered? Sign in here"
                : "Don't have an account? Sign up here"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

