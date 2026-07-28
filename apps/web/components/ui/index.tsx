"use client";

import * as React from "react";

/* Spinner */
export function Spinner({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}): React.JSX.Element {
  const sizeMap = { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-10 w-10" };
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-2 border-gray-200 border-t-gray-800 ${sizeMap[size]} ${className}`}
    />
  );
}

/* Button */
type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}): React.JSX.Element {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-gray-900 text-white hover:bg-gray-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/* Input */
export function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>): React.JSX.Element {
  return (
    <input
      className={`w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 ${className}`}
      {...props}
    />
  );
}

/* Textarea */
export function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>): React.JSX.Element {
  return (
    <textarea
      className={`w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400 ${className}`}
      {...props}
    />
  );
}

/* Avatar */
export function Avatar({
  src,
  alt,
  size = 48,
}: {
  src?: string | null;
  alt: string;
  size?: number;
}): React.JSX.Element {
  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold"
      >
        {alt.charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{ width: size, height: size }}
      className="rounded-full object-cover"
    />
  );
}

/* Modal */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element | null {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">x</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export interface ProfileStats {
  notes: number;
  followers: number;
  following: number;
}

export interface ProfileUser {
  id: string;
  displayName: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  stream: string | null;
  className: string | null;
  joinedAt: string;
  stats: ProfileStats;
  isOwnProfile: boolean;
  isFollowing?: boolean;
}
