import React from "react";
import { motion } from "motion/react";
import { Cpu, Cherry, Flower2, Sun, Leaf, Snowflake, CheckCircle2, Moon } from "lucide-react";
import type { AppTheme, AppThemeMode } from "../App";

export interface ThemeOption {
  id: AppTheme;
  name: string;
  nightSubtitle: string;
  daySubtitle: string;
  icon: React.ElementType;
  iconColor: string;
  badgeBg: string;
  badgeText: string;
  activeBorder: string;
  activeGlow: string;
  previewGradient: string;
  accentBg: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "default",
    name: "Cyberpunk",
    nightSubtitle: "Midnight cyber void & electric neon glows",
    daySubtitle: "High-tech neo-tokyo electric daylight",
    icon: Cpu,
    iconColor: "text-cyan-400",
    badgeBg: "bg-cyan-950/80 border-cyan-500/40",
    badgeText: "text-cyan-300",
    activeBorder: "border-cyan-400",
    activeGlow: "shadow-[0_0_22px_rgba(0,240,255,0.4)] ring-2 ring-cyan-400/50",
    previewGradient: "from-cyan-500 via-fuchsia-500 to-purple-600",
    accentBg: "bg-cyan-500/20",
  },
  {
    id: "sakura",
    name: "Sakura",
    nightSubtitle: "Yozakura: Lantern-lit night cherry blossoms & moonlit petals",
    daySubtitle: "Hanami: Pure Somei-Yoshino cherry blossom blizzard in spring breeze",
    icon: Cherry,
    iconColor: "text-pink-300",
    badgeBg: "bg-pink-950/80 border-pink-300/40",
    badgeText: "text-pink-200",
    activeBorder: "border-pink-300",
    activeGlow: "shadow-[0_0_22px_rgba(253,164,175,0.45)] ring-2 ring-pink-300/50",
    previewGradient: "from-white via-pink-300 to-rose-300",
    accentBg: "bg-pink-400/20",
  },
  {
    id: "spring",
    name: "Spring",
    nightSubtitle: "Moonlit flora meadow & bioluminescent blossoms",
    daySubtitle: "Fresh meadow blossoms fluttering in spring sunbeams",
    icon: Flower2,
    iconColor: "text-pink-400",
    badgeBg: "bg-pink-950/80 border-pink-500/40",
    badgeText: "text-pink-300",
    activeBorder: "border-pink-400",
    activeGlow: "shadow-[0_0_22px_rgba(244,114,182,0.4)] ring-2 ring-pink-400/50",
    previewGradient: "from-pink-400 via-rose-400 to-emerald-400",
    accentBg: "bg-pink-500/20",
  },
  {
    id: "summer",
    name: "Summer",
    nightSubtitle: "Twilight starlight sky & glowing golden fireflies",
    daySubtitle: "Golden hour sunbeams & tropical azure skies",
    icon: Sun,
    iconColor: "text-amber-400",
    badgeBg: "bg-amber-950/80 border-amber-500/40",
    badgeText: "text-amber-300",
    activeBorder: "border-amber-400",
    activeGlow: "shadow-[0_0_22px_rgba(251,191,36,0.4)] ring-2 ring-amber-400/50",
    previewGradient: "from-amber-400 via-orange-400 to-cyan-500",
    accentBg: "bg-amber-500/20",
  },
  {
    id: "autumn",
    name: "Autumn",
    nightSubtitle: "Harvest moon midnight with glowing ember leaves",
    daySubtitle: "Crimson & amber leaves swaying in crisp wind",
    icon: Leaf,
    iconColor: "text-orange-400",
    badgeBg: "bg-orange-950/80 border-orange-500/40",
    badgeText: "text-orange-300",
    activeBorder: "border-orange-400",
    activeGlow: "shadow-[0_0_22px_rgba(249,115,22,0.4)] ring-2 ring-orange-400/50",
    previewGradient: "from-red-500 via-orange-500 to-amber-500",
    accentBg: "bg-orange-500/20",
  },
  {
    id: "winter",
    name: "Winter",
    nightSubtitle: "Polar midnight aurora borealis with frost stars",
    daySubtitle: "Frosted arctic morning with crystalline snowflakes",
    icon: Snowflake,
    iconColor: "text-sky-300",
    badgeBg: "bg-sky-950/80 border-sky-500/40",
    badgeText: "text-sky-200",
    activeBorder: "border-sky-300",
    activeGlow: "shadow-[0_0_22px_rgba(56,189,248,0.4)] ring-2 ring-sky-300/50",
    previewGradient: "from-sky-400 via-blue-500 to-indigo-600",
    accentBg: "bg-sky-500/20",
  },
];

interface ThemeSelectorProps {
  currentTheme: AppTheme;
  themeMode?: AppThemeMode;
  onSelectTheme: (theme: AppTheme) => void;
  onThemeModeChange?: (mode: AppThemeMode) => void;
  variant?: "horizontal" | "cards" | "compact";
  className?: string;
}

export default function ThemeSelector({
  currentTheme,
  themeMode = "night",
  onSelectTheme,
  onThemeModeChange,
  variant = "cards",
  className = "",
}: ThemeSelectorProps) {
  const isNight = themeMode === "night";

  const renderModeSwitcher = () => {
    if (!onThemeModeChange) return null;
    return (
      <div className="flex items-center justify-between p-1 bg-slate-950/90 rounded-xl border border-white/10 mb-2">
        <button
          type="button"
          onClick={() => onThemeModeChange("night")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isNight
              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,240,255,0.25)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Night Mode</span>
        </button>
        <button
          type="button"
          onClick={() => onThemeModeChange("day")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            !isNight
              ? "bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.25)]"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Day Mode</span>
        </button>
      </div>
    );
  };

  if (variant === "compact") {
    return (
      <div className={`flex flex-col gap-1.5 w-full ${className}`}>
        {renderModeSwitcher()}
        <div className="space-y-1">
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isActive = currentTheme === opt.id || (currentTheme === ("dark" as any) && opt.id === "default");
            const subtitle = isNight ? opt.nightSubtitle : opt.daySubtitle;
            return (
              <button
                key={opt.id}
                onClick={() => onSelectTheme(opt.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? `${opt.badgeBg} ${opt.badgeText} border ${opt.activeBorder} shadow-sm`
                    : "text-slate-300 hover:text-white hover:bg-white/10 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1 rounded-lg ${opt.accentBg} ${opt.iconColor} shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-extrabold text-xs flex items-center gap-1.5">
                      <span>{opt.name}</span>
                      {isActive && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-white/10 font-mono">
                          {isNight ? "Night" : "Day"}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-normal line-clamp-1">{subtitle}</div>
                  </div>
                </div>
                {isActive && <CheckCircle2 className={`w-4 h-4 ${opt.iconColor} shrink-0 ml-2`} />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className={`flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-xl ${className}`}>
        {onThemeModeChange && (
          <button
            onClick={() => onThemeModeChange(isNight ? "day" : "night")}
            title={`Switch to ${isNight ? "Day" : "Night"} Mode`}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 border border-white/10 cursor-pointer"
          >
            {isNight ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span className="hidden md:inline text-[10px] uppercase font-mono">{isNight ? "Night" : "Day"}</span>
          </button>
        )}
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = currentTheme === opt.id || (currentTheme === ("dark" as any) && opt.id === "default");
          return (
            <button
              key={opt.id}
              onClick={() => onSelectTheme(opt.id)}
              title={`${opt.name} Theme (${isNight ? "Night" : "Day"} Mode)`}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? `${opt.badgeBg} ${opt.badgeText} border ${opt.activeBorder} shadow-md`
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${opt.iconColor}`} />
              <span className="hidden sm:inline text-[11px] font-extrabold">{opt.name}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-3 w-full ${className}`}>
      {renderModeSwitcher()}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
        {THEME_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isActive = currentTheme === opt.id || (currentTheme === ("dark" as any) && opt.id === "default");
          const subtitle = isNight ? opt.nightSubtitle : opt.daySubtitle;
          return (
            <motion.button
              key={opt.id}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectTheme(opt.id)}
              className={`relative p-3.5 sm:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between overflow-hidden group backdrop-blur-xl ${
                isActive
                  ? `bg-slate-900/90 ${opt.activeBorder} ${opt.activeGlow} text-white`
                  : "bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-600 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              {/* Top Preview Bar Accent */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${opt.previewGradient}`} />

              <div className="flex items-center justify-between w-full mb-2">
                <div className={`p-2 rounded-xl ${opt.accentBg} ${opt.iconColor} border border-white/10 shrink-0 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isActive ? (
                  <CheckCircle2 className={`w-5 h-5 ${opt.iconColor} shrink-0 drop-shadow-md`} />
                ) : (
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-500 group-hover:text-slate-300">
                    Select
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-black text-sm text-white font-display flex items-center justify-between">
                  <span>{opt.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono font-normal">
                    {isNight ? "🌙 Night" : "☀️ Day"}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400 leading-snug mt-1 font-medium">
                  {subtitle}
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
