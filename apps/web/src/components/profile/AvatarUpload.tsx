"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { apiClient } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore } from "@/store/notification.store";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { ApiErrorShape } from "@/lib/axios";

const MAX_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  currentImage: string | null;
  displayName: string | null;
}

interface AvatarUploadResponse {
  avatarUrl: string;
}

export function AvatarUpload({
  currentAvatarUrl,
  currentImage,
  displayName,
}: AvatarUploadProps): React.JSX.Element {
  const { updateAvatar } = useAuth();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const currentSrc = preview ?? currentAvatarUrl ?? currentImage;
  const initials = (displayName ?? "?")[0]?.toUpperCase() ?? "?";

  // ── Validation ─────────────────────────────────────────────────────────────
  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, or WebP images are allowed.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "Image must be under 2 MB.";
    }
    return null;
  }

  // ── Upload ──────────────────────────────────────────────────────────────────
  const handleFile = useCallback(
    async (file: File): Promise<void> => {
      const validationError = validate(file);
      if (validationError) {
        addNotification({ type: "error", title: "Invalid file", message: validationError });
        return;
      }

      // Show local preview immediately
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("avatar", file);

        const { data } = await apiClient.post<AvatarUploadResponse>(
          "/users/me/avatar",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );

        // Update Zustand store — avatarUrl now points to Cloudinary
        updateAvatar(data.avatarUrl);

        addNotification({
          type: "success",
          title: "Avatar updated",
          message: "Your new profile picture has been saved.",
        });
      } catch (err) {
        // Rollback preview on failure
        setPreview(null);
        URL.revokeObjectURL(objectUrl);

        const apiErr = err as ApiErrorShape;
        addNotification({
          type: "error",
          title: "Upload failed",
          message: apiErr.message ?? "Please try again.",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [updateAvatar, addNotification],
  );

  // ── Drag handlers ───────────────────────────────────────────────────────────
  function onDragOver(e: React.DragEvent): void {
    e.preventDefault();
    setIsDragOver(true);
  }
  function onDragLeave(): void {
    setIsDragOver(false);
  }
  function onDrop(e: React.DragEvent): void {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void handleFile(file);
  }
  function onInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Drop zone / avatar preview */}
      <div
        onClick={() => !isUploading && inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter") inputRef.current?.click(); }}
        aria-label="Upload avatar"
        className={cn(
          "relative flex h-[120px] w-[120px] cursor-pointer items-center justify-center rounded-full transition-all duration-150",
          isDragOver
            ? "ring-4 ring-blue-400 ring-offset-2 scale-105"
            : "hover:ring-2 hover:ring-blue-300 hover:ring-offset-2",
          isUploading && "cursor-not-allowed",
        )}
      >
        {/* Avatar image or initials */}
        {currentSrc ? (
          <Image
            src={currentSrc}
            alt="Avatar preview"
            width={120}
            height={120}
            className="rounded-full object-cover ring-4 ring-white shadow-md"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-4xl font-bold text-white ring-4 ring-white shadow-md">
            {initials}
          </div>
        )}

        {/* Upload overlay */}
        {!isUploading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="mt-1 text-xs font-medium text-white">Change</span>
          </div>
        )}

        {/* Upload spinner */}
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Spinner size="md" />
          </div>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={onInputChange}
      />

      {/* Hint text */}
      <div className="text-center">
        <p className="text-sm font-medium text-blue-600">
          {isUploading ? "Uploading…" : "Click or drag to change avatar"}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Square (1:1) recommended · JPEG, PNG, WebP · Max 2 MB
        </p>
      </div>
    </div>
  );
}
