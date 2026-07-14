import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Radix Dialog sets `pointer-events: none` on <body> while open (its modal
 * focus-lock), which any other Radix *Content component inherits unless it
 * resets pointer-events itself. Every Portal-rendered overlay content
 * component (Popover, Select, DropdownMenu, Tooltip, ...) must include this
 * so it stays interactive when nested inside an open Dialog/Sheet (z-[100]).
 */
export const OVERLAY_CONTENT_CLASS = 'z-[110] pointer-events-auto';
