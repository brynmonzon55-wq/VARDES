import { useState } from "react";
import { UserRole } from "../types";
import { User as UserIcon } from "lucide-react";

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string;
  role?: UserRole;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

const SIZE_CLASSES = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
  "2xl": "h-24 w-24 text-2xl",
};

export default function UserAvatar({
  name = "User",
  avatarUrl,
  role = "student",
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const isStudent = role === "student";

  const fallbackGradient = isStudent
    ? "bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-teal-500/20"
    : "bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-violet-500/20";

  if (avatarUrl && !imageError) {
    return (
      <div
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-white/20 shadow-sm ${sizeClass} ${className}`}
      >
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-bold tracking-wider shadow-sm select-none ${fallbackGradient} ${sizeClass} ${className}`}
      title={name}
    >
      {initials ? initials : <UserIcon className="h-1/2 w-1/2" />}
    </div>
  );
}
