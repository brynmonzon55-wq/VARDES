import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  User as UserIcon,
  Key,
  RefreshCw,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Mail,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Camera,
  Phone,
  Home,
  Globe,
  Share2,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { User } from "../types";
import type { AppTheme } from "../App";
import { saveUser, changeOwnPassword, deleteOwnAccount, forceReconnect } from "../lib/db";
import UserAvatar from "./UserAvatar";
import ThemeSelector from "./ThemeSelector";

interface SettingsTabProps {
  currentUser: User;
  onLogout: () => void;
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
  onProfileUpdated?: () => void;
}

export default function SettingsTab({
  currentUser,
  onLogout,
  theme,
  onThemeChange,
  onProfileUpdated,
}: SettingsTabProps) {
  // Profile edit state
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || "");
  const [phone, setPhone] = useState(currentUser.phone || "");
  const [address, setAddress] = useState(currentUser.address || "");
  const [department, setDepartment] = useState(currentUser.department || "");
  const [subject, setSubject] = useState(currentUser.subject || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || "");

  // Social accounts
  const [facebook, setFacebook] = useState(currentUser.socialAccounts?.facebook || "");
  const [twitter, setTwitter] = useState(currentUser.socialAccounts?.twitter || "");
  const [linkedin, setLinkedin] = useState(currentUser.socialAccounts?.linkedin || "");
  const [github, setGithub] = useState(currentUser.socialAccounts?.github || "");
  const [instagram, setInstagram] = useState(currentUser.socialAccounts?.instagram || "");

  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Sync state
  const [, setSyncMsg] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Account deletion state & Advanced Options
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setProfileError("Image size must be under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setAvatarUrl(dataUrl);
          setProfileSuccess("New photo selected! Click 'Save Profile Info' below to save.");
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Handle Profile Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!name.trim()) {
      setProfileError("Full Name cannot be empty.");
      return;
    }

    try {
      const socialAccounts = {
        facebook: facebook.trim() || undefined,
        twitter: twitter.trim() || undefined,
        linkedin: linkedin.trim() || undefined,
        github: github.trim() || undefined,
        instagram: instagram.trim() || undefined,
      };
      const hasSocials = Object.values(socialAccounts).some(Boolean);

      const updatedUser: User = {
        ...currentUser,
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        department: department.trim() || undefined,
        subject: currentUser.role === "teacher" ? (subject.trim() || undefined) : currentUser.subject,
        avatarUrl: avatarUrl.trim() || undefined,
        socialAccounts: hasSocials ? socialAccounts : undefined,
      };
      saveUser(updatedUser);
      setProfileSuccess("Profile updated successfully!");
      if (onProfileUpdated) onProfileUpdated();
      setTimeout(() => setProfileSuccess(null), 3000);
    } catch (err: any) {
      setProfileError("Failed to update profile. Please try again.");
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPass(true);
    try {
      await changeOwnPassword(oldPassword, newPassword);
      setPasswordSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 3000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password. Verify current password.");
    } finally {
      setIsChangingPass(false);
    }
  };

  // Handle Manual Force Sync
  const handleSyncData = () => {
    setIsSyncing(true);
    setSyncMsg(null);
    forceReconnect(currentUser);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncMsg("Data re-synchronized with Cloud Firestore!");
      setTimeout(() => setSyncMsg(null), 3000);
    }, 1200);
  };

  // Handle Account Deletion
  const handleDeleteAccount = async () => {
    setDeleteError(null);
    setIsDeletingAccount(true);
    try {
      await deleteOwnAccount();
      onLogout();
    } catch (err: any) {
      setDeleteError(err.message || "Deletion failed. Please try again.");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Hidden File Input for Avatar Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Settings Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-cream rounded-3xl border border-ink-soft/10 p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()} title="Click to change profile picture">
            <UserAvatar name={currentUser.name} avatarUrl={avatarUrl || currentUser.avatarUrl} role={currentUser.role} size="xl" />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Camera className="h-5 w-5" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase bg-violet-50 text-violet-700 rounded-full border border-violet-200">
                {currentUser.role}
              </span>
              <span className="text-xs font-mono font-bold text-ink-soft/70">ID: {currentUser.id}</span>
            </div>
            <h1 className="text-xl font-black text-ink tracking-tight mt-1">{currentUser.name}</h1>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. PROFILE INFORMATION */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-cream border border-ink-soft/10 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-ink-soft/10 pb-3">
              <UserIcon className="h-5 w-5 text-violet-500" />
              <h2 className="text-base font-black text-ink">Personal Information</h2>
            </div>

            {profileSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                {profileSuccess}
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-coral-50 border border-coral-200 text-coral-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-coral-600 shrink-0" />
                {profileError}
              </div>
            )}

            <form id="profile-form" onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-400"
                  />
                  <UserIcon className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-400"
                  />
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Phone Number</label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-400"
                  />
                  <Phone className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Residential Address</label>
                <div className="relative">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, State/Province, ZIP"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-400"
                  />
                  <Home className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Department / Course</label>
                <div className="relative">
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. DCPE, DCS, Computer Engineering"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-400"
                  />
                  <GraduationCap className="h-4 w-4 text-cyan-400 absolute left-3 top-3" />
                </div>
              </div>

              {currentUser.role === "teacher" && (
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Subject(s) / Specialization(s)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. DCPE, DCS, Computer Engineering, Mathematics"
                      className="w-full pl-9 pr-3 py-2.5 text-xs font-bold bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-400"
                    />
                    <BookOpen className="h-4 w-4 text-violet-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">If you teach multiple subjects, separate them with commas.</p>
                </div>
              )}

              {/* Social Accounts Section */}
              <div className="pt-2 border-t border-slate-700/60 space-y-3">
                <label className="font-bold text-violet-300 flex items-center gap-1.5 text-xs">
                  <Share2 className="h-4 w-4" />
                  <span>Social Accounts</span>
                </label>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Facebook</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="facebook.com/username or @handle"
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-500"
                    />
                    <Globe className="h-3.5 w-3.5 text-blue-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Twitter / X</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="@username or x.com/username"
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-500"
                    />
                    <Globe className="h-3.5 w-3.5 text-sky-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">LinkedIn</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="linkedin.com/in/username"
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-500"
                    />
                    <Globe className="h-3.5 w-3.5 text-indigo-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">GitHub</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="github.com/username"
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-500"
                    />
                    <Globe className="h-3.5 w-3.5 text-slate-300 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Instagram</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@username or instagram.com/username"
                      className="w-full pl-9 pr-3 py-2 text-xs font-medium bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-500"
                    />
                    <Globe className="h-3.5 w-3.5 text-pink-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>
            </form>
          </div>

          <button
            type="submit"
            form="profile-form"
            className="w-full py-2.5 text-xs font-extrabold text-white bg-violet-500 hover:bg-violet-600 rounded-xl cursor-pointer shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 mt-4"
          >
            <Save className="h-4 w-4" /> Save Profile Info
          </button>
        </motion.div>

        {/* 2. CHANGE PASSWORD */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-cream border border-ink-soft/10 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-ink-soft/10 pb-3">
              <Key className="h-5 w-5 text-violet-500" />
              <h2 className="text-base font-black text-ink">Account Password</h2>
            </div>

            {passwordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                {passwordSuccess}
              </div>
            )}

            {passwordError && (
              <div className="p-3 bg-coral-50 border border-coral-200 text-coral-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-coral-600 shrink-0" />
                {passwordError}
              </div>
            )}

            <form id="pass-form" onSubmit={handleChangePassword} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-400"
                  />
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="At least 6 characters..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-400"
                  />
                  <Key className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Confirm New Password</label>
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password..."
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-mono font-bold bg-slate-900/80 border border-slate-700/60 rounded-xl text-white focus:outline-none focus:border-violet-400 placeholder-slate-400"
                  />
                  <Key className="h-4 w-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            </form>
          </div>

          <button
            type="submit"
            form="pass-form"
            disabled={isChangingPass}
            className="w-full py-2.5 text-xs font-extrabold text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-50 rounded-xl cursor-pointer shadow-md shadow-violet-500/20 flex items-center justify-center gap-2 mt-4"
          >
            <Lock className="h-4 w-4" /> {isChangingPass ? "Updating Password..." : "Update Password"}
          </button>
        </motion.div>
      </div>

      {/* 3. THEME & ENVIRONMENT PREFERENCES */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/80 border border-slate-700/60 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-cyan-400" />
            <h2 className="text-base font-black text-white font-display">Environment & Theme Aesthetics</h2>
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">5 Animated Environments</span>
        </div>

        <ThemeSelector currentTheme={theme} onSelectTheme={onThemeChange} variant="cards" />
      </motion.div>

      {/* 4. CONNECTION & ACCOUNT SYSTEM CONTROL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-cream border border-ink-soft/10 rounded-3xl p-6 shadow-xl space-y-6"
      >
        {/* CONNECTION SECTION */}
        <div className="space-y-2">
          <h3 className="text-[11px] font-black tracking-widest text-ink-soft uppercase">
            Connection
          </h3>

          <button
            type="button"
            onClick={handleSyncData}
            disabled={isSyncing}
            className="w-full py-3 px-4 text-xs font-bold text-ink bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10 border border-ink-soft/20 rounded-2xl cursor-pointer flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
          >
            <RefreshCw className={`h-4 w-4 text-violet-500 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Re-synchronizing Live Data..." : "Refresh Live Connection"}</span>
          </button>

          <p className="text-[11px] text-ink-soft/80 leading-relaxed px-1">
            If new data isn't showing up automatically, use this instead of reloading the page.
          </p>
        </div>

        {/* ACCOUNT SECTION */}
        <div className="space-y-2 pt-2 border-t border-ink-soft/10">
          <h3 className="text-[11px] font-black tracking-widest text-ink-soft uppercase">
            Account
          </h3>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 px-4 text-xs font-bold text-ink bg-white/40 hover:bg-white/80 dark:bg-white/5 dark:hover:bg-white/10 border border-ink-soft/20 rounded-2xl cursor-pointer flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99]"
          >
            <LogOut className="h-4 w-4 text-coral-500" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* ADVANCED OPTIONS ACCORDION */}
        <div className="pt-2 border-t border-ink-soft/10">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-ink-soft/90 hover:text-ink cursor-pointer flex items-center gap-1.5 transition-colors py-1"
          >
            <span>Advanced options</span>
            {showAdvanced ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          <AnimatePresence>
            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-3 space-y-3"
              >
                <div className="p-4 bg-coral-50/40 border border-coral-200/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-coral-900 flex items-center gap-1.5">
                      <Trash2 className="h-3.5 w-3.5 text-coral-600 shrink-0" />
                      Delete Account
                    </h4>
                    <p className="text-[11px] text-coral-800/80 leading-relaxed">
                      Permanently erase your user profile and attendance logs. No password required.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-extrabold text-white bg-coral-600 hover:bg-coral-700 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-coral-600/20 shrink-0 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Account</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* DELETE ACCOUNT MODAL (NO PASSWORD REQUIRED) */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <div className="bg-cream border border-coral-200 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-coral-600 border-b border-ink-soft/10 pb-3">
                <Trash2 className="h-6 w-6" />
                <h3 className="font-black text-base text-ink">Delete Account Confirmation</h3>
              </div>

              <div className="p-3 bg-coral-50 border border-coral-200 text-coral-900 rounded-2xl text-xs space-y-1">
                <p className="font-extrabold flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-coral-600 shrink-0" />
                  Are you sure you want to delete your account?
                </p>
                <p className="text-[11px] text-coral-800 leading-relaxed">
                  This will permanently erase your profile, attendance history, and submissions. No password is required so you can easily reset if you forgot your login details.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 bg-coral-50 text-coral-800 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-coral-600 shrink-0" />
                  {deleteError}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-ink-soft bg-white border border-ink-soft/15 rounded-xl hover:bg-black/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={handleDeleteAccount}
                  className="px-5 py-2.5 text-xs font-extrabold text-white bg-coral-600 hover:bg-coral-700 disabled:opacity-50 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  {isDeletingAccount ? "Deleting..." : "Permanently Delete"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
