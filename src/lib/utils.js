import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional class names and resolve Tailwind CSS conflicts.
 *
 * Example:
 * cn("px-2", isActive && "bg-blue-500", "px-4")
 * Output => "px-4 bg-blue-500"
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
