"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore } from "@/store/notification.store";
import { AvatarUpload } from "./AvatarUpload";
import { Button, Spinner } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ProfileUser, Stream, ClassName } from "./profile.types";
import type { ApiErrorShape } from "@/lib/axios";

// ─── Zod schema ──────────────────────────────────────────────────────────────

const STREAMS = ["Science", "Commerce", "Arts", "Engineering"] as const;
const CLASS_NAMES = [
  "11th",
  "12th",
  "1st Year",
  "2nd Year",
  "3rd Year",
] as const;

const editProfileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be under 50 characters")
    .trim(),
  bio: z
    .string()
    .max(500, "Bio must be under 500 characters")
    .optional()
    .or(z.literal("")),
  stream: z.enum(STREAMS).optional().or(z.literal("")),
  className: z.enum(CLASS_NAMES).optional().or(z.literal("")),
});

type EditProfileFields = z.infer<typeof editProfileSchema>;

// ─── Component ───────────────────────────────────────────────────────────────

interface EditProfileFormProps {
  profile: ProfileUser;
  onClose: () => void;
}

export function EditProfileForm({
  profile,
  onClose,
}: EditProfileFormProps): React.JSX.Element {
  const { updateProfile } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const overlayRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<EditProfileFields>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      displayName: profile.displayName ?? "",
      bio: profile.bio ?? "",
      stream: (profile.stream as Stream) ?? "",
      className: (profile.className as ClassName) ?? "",
    },
  });

  const bioValue = watch("bio") ?? "";
  const bioLen = bioValue.length;

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent): void {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function onSubmit(values: EditProfileFields): Promise<void> {
    try {
      await apiClient.patch("/users/me", {
        displayName: values.displayName,
        bio: values.bio || null,
        stream: values.stream || null,
        className: values.className || null,
      });

      updateProfile({
        displayName: values.displayName,
        bio: values.bio || null,
        stream: (values.stream as Stream) || null,
        className: (values.className as ClassName) || null,
      });

      addNotification({
        type: "success",
        title: "Profile updated",
        message: "Your changes have been saved.",
      });

      onClose();
    } catch (err) {
      const apiErr = err as ApiErrorShape;
      addNotification({
        type: "error",
        title: "Update failed",
        message: apiErr.message ?? "Something went wrong.",
      });
    }
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={overlayRef}
        onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">
              Edit Profile
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto px-5 py-5">
            {/* Avatar upload */}
            <div className="mb-6 flex flex-col items-center gap-3">
              <AvatarUpload
                currentAvatarUrl={profile.avatarUrl}
                currentImage={null}
                displayName={profile.displayName}
              />
            </div>

            {/* Form */}
            <form
              id="edit-profile-form"
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              {/* Display name */}
              <Field label="Display Name" error={errors.displayName?.message} required>
                <input
                  {...register("displayName")}
                  type="text"
                  placeholder="Your name"
                  className={inputClass(!!errors.displayName)}
                />
              </Field>

              {/* Bio */}
              <Field label="Bio" error={errors.bio?.message}>
                <div className="relative">
                  <textarea
                    {...register("bio")}
                    rows={4}
                    placeholder="Tell people a bit about yourself…"
                    className={cn(inputClass(!!errors.bio), "resize-none pr-14")}
                    maxLength={500}
                  />
                  <span
                    className={cn(
                      "absolute bottom-2.5 right-3 text-xs tabular-nums",
                      bioLen > 450 ? "text-red-500" : "text-gray-400",
                    )}
                  >
                    {bioLen}/500
                  </span>
                </div>
              </Field>

              {/* Stream */}
              <Field label="Stream" error={errors.stream?.message}>
                <select
                  {...register("stream")}
                  className={inputClass(!!errors.stream)}
                >
                  <option value="">Select stream</option>
                  {STREAMS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              {/* Class */}
              <Field label="Class" error={errors.className?.message}>
                <select
                  {...register("className")}
                  className={inputClass(!!errors.className)}
                >
                  <option value="">Select class</option>
                  {CLASS_NAMES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </Field>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-5 py-4">
            <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="edit-profile-form"
              isLoading={isSubmitting}
              disabled={!isDirty && !isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return cn(
    "w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors bg-white",
    "placeholder:text-gray-400",
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100",
  );
}
