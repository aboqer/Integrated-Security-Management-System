import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface NavItem {
  id: string;
  title: string;
  icon: string;
  path: string;
  color: string;
  requiredRole?: "admin" | "user";
}

export const NAV_ITEMS: NavItem[] = [
  { id: "violations", title: "نظام المخالفات", icon: "ShieldAlert", path: "/violations", color: "bg-red-500" },
  { id: "detainees", title: "نظام الموقوفين", icon: "Users", path: "/detainees", color: "bg-blue-600" },
  { id: "reports", title: "نظام البلاغات والشكاوى", icon: "Activity", path: "/reports", color: "bg-indigo-500" },
  { id: "property", title: "نظام الأمانات", icon: "Package", path: "/property", color: "bg-emerald-500" },
  { id: "commitments", title: "نظام الالتزامات", icon: "FileCheck", path: "/commitments", color: "bg-amber-500" },
  { id: "settings", title: "الإعدادات", icon: "Settings", path: "/settings", color: "bg-slate-700", requiredRole: "admin" },
];
