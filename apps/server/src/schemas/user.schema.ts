import { z } from "zod";

// ---------------------------------------------------------------------------
// Allowed stream values — extend this enum as your domain grows
// ---------------------------------------------------------------------------
const STREAM_VALUES = [
  "science",
  "commerce",
  "arts",
  "engineering",
  "medical",
  "law",
  "management",
  "other",
] as const;

// ---------------------------------------------------------------------------
// UpdateProfileSchema  (SEC-S2-01)
// ---------------------------------------------------------------------------
export const UpdateProfileSchema = z.object({
  /** Display name shown across the UI */
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must not exceed 50 characters")
    .trim(),

  /** Short user bio — optional, max 500 chars */
  bio: z
    .string()
    .max(500, "Bio must not exceed 500 characters")
    .trim()
    .optional(),

  /**
   * Academic / interest stream.
   * Accepts a known enum value OR any freeform string (school-agnostic).
   * Change to z.enum(STREAM_VALUES) if you want strict validation.
   */
  stream: z
    .union([
      z.enum(STREAM_VALUES),
      z.string().min(1).max(100).trim(),
    ])
    .optional(),

  /** Class / grade / year — optional freeform (e.g. "12th", "2nd Year") */
  className: z
    .string()
    .max(50, "Class name must not exceed 50 characters")
    .trim()
    .optional(),

  /** Public avatar URL — must be a valid URL when provided */
  avatarUrl: z
    .string()
    .url("avatarUrl must be a valid URL")
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

// ---------------------------------------------------------------------------
// Convenience: partial version for PATCH semantics (all fields optional)
// ---------------------------------------------------------------------------
export const PatchProfileSchema = UpdateProfileSchema.partial();
export type PatchProfileInput = z.infer<typeof PatchProfileSchema>;
