import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function levelClass(level?: string | null) {
  if (level === "critical") return "bg-red-100 text-red-800 border-red-200";
  if (level === "high") return "bg-orange-100 text-orange-800 border-orange-200";
  if (level === "medium") return "bg-yellow-100 text-yellow-900 border-yellow-200";
  return "bg-green-100 text-green-800 border-green-200";
}
