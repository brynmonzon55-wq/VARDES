import { motion, AnimatePresence } from "motion/react";
import { LogOut, X } from "lucide-react";
import { User } from "../types";
import UserAvatar from "./UserAvatar";
import type { AppTheme, AppThemeMode } from "../App";

interface LogoutConfirmModalProps {
  isOpen: boolean;
  user: User | null;
  onConfirm: () => void;
  onCancel: () => void;
  theme?: AppTheme;
  themeMode?: AppThemeMode;
}

export default function LogoutConfirmModal({
  isOpen,
  user,
  onConfirm,
  onCancel,
}: LogoutConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-rose-950/20 z-10 overflow-hidden"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-slate-700/20 blur-3xl pointer-events-none" />

          {/* Close button in top right */}
          <button
            onClick={onCancel}
            aria-label="Cancel and close logout modal"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            {/* Warning Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-inner">
              <LogOut className="h-7 w-7" />
            </div>

            {/* Title & Prompt */}
            <div className="space-y-1">
              <h3 className="text-xl font-black text-white font-display tracking-tight">
                Confirm Sign Out
              </h3>
              <p className="text-xs text-slate-400 max-w-xs font-sans leading-relaxed">
                Are you sure you want to log out of your session? You will need to sign back in to access your classes and records.
              </p>
            </div>

            {/* Account Card */}
            {user && (
              <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex items-center gap-3 text-left">
                <UserAvatar name={user.name} avatarUrl={user.avatarUrl} role={user.role} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white truncate">
                      {user.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                        user.role === "teacher"
                          ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {user.email || user.id}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-extrabold text-xs transition-all cursor-pointer shadow-sm hover:text-white"
              >
                Stay Signed In
              </button>

              <button
                type="button"
                onClick={onConfirm}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-extrabold text-xs transition-all cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
