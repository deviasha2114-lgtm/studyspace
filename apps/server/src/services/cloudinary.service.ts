// src/services/cloudinary.service.ts
// StudySpace — Cloudinary Upload Service
//
// Wraps the Cloudinary Node SDK in a promise-based helper.
// All avatar uploads go through uploadBuffer() — the controller passes in
// the multer buffer and gets back a secure_url to store in the DB.
//
// Config required in .env:
//   CLOUDINARY_CLOUD_NAME=...
//   CLOUDINARY_API_KEY=...
//   CLOUDINARY_API_SECRET=...
//
// Folder  : studyspace/avatars
// Transform: 400×400, crop: fill, gravity: face (auto-centers on faces)
// Format  : webp (smaller, sharp at 400px)

import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { AppError } from '@/errors/AppError';

// ── SDK configuration ─────────────────────────────────────────────────────────
// Executed once on module load. Throws clearly if env vars are missing.
(function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
    process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      '[cloudinary.service] Missing required env vars: ' +
        'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
    );
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,   // always return https URLs
  });
})();

// ── Types ──────────────────────────────────────────────────────────────────────
export interface UploadOptions {
  /** Override the default public_id (Cloudinary filename, no extension). */
  publicId?: string;
  /** Override the target folder. Defaults to 'studyspace/avatars'. */
  folder?: string;
  /** Tag the asset for filtering in the Cloudinary console. */
  tags?: string[];
}

export interface UploadResult {
  /** HTTPS URL — ready to store in DB and serve to clients. */
  secureUrl: string;
  /** Cloudinary asset public_id — store this if you need to delete/replace later. */
  publicId: string;
  /** Final rendered width in pixels. */
  width: number;
  /** Final rendered height in pixels. */
  height: number;
  /** File format Cloudinary chose (e.g. 'webp'). */
  format: string;
  /** Bytes on disk after transformation. */
  bytes: number;
}

// ── Defaults ───────────────────────────────────────────────────────────────────
const DEFAULT_FOLDER = 'studyspace/avatars';

/** Eager transformation applied to every avatar upload.
 *  crop: fill + gravity: face → subject stays centred even for off-centre photos.
 *  format: webp + quality: auto → smallest file that still looks sharp at 400px. */
const AVATAR_TRANSFORMATION: UploadApiOptions['transformation'] = [
  {
    width: 400,
    height: 400,
    crop: 'fill',
    gravity: 'face',
    fetch_format: 'webp',
    quality: 'auto',
  },
];

// ── uploadBuffer ───────────────────────────────────────────────────────────────
/**
 * Uploads a raw Buffer to Cloudinary via an upload stream.
 * Returns a structured UploadResult — the controller stores secureUrl in the DB.
 *
 * @param buffer   Raw file buffer from multer (req.file.buffer)
 * @param options  Optional overrides for folder, publicId, tags
 * @returns        UploadResult with secureUrl, publicId, and metadata
 * @throws         AppError 500 if Cloudinary rejects the upload
 *
 * @example
 *   // In user.controller.ts:
 *   const result = await uploadBuffer(req.file.buffer, {
 *     publicId: `avatar_${req.user.id}`,
 *     tags: ['avatar', req.user.id],
 *   });
 *   await updateProfile(req.user.id, { avatarUrl: result.secureUrl });
 */
export async function uploadBuffer(
  buffer: Buffer,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const folder = options.folder ?? DEFAULT_FOLDER;

  const uploadOptions: UploadApiOptions = {
    folder,
    // If a publicId is provided use it — Cloudinary will overwrite the old asset
    // with the same id, which gives us free "replace avatar" behaviour.
    ...(options.publicId && { public_id: options.publicId }),
    overwrite: true,
    invalidate: true,             // bust Cloudinary CDN cache on overwrite
    resource_type: 'image',
    transformation: AVATAR_TRANSFORMATION,
    // Return the eager version (transformed URL) as the primary URL
    eager: AVATAR_TRANSFORMATION,
    eager_async: false,           // wait for transformation before returning
    ...(options.tags && { tags: options.tags }),
  };

  return new Promise<UploadResult>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error || !result) {
          return reject(
            new AppError(
              500,
              `Cloudinary upload failed: ${error?.message ?? 'Unknown error'}`
            )
          );
        }
        resolve(_mapResult(result));
      }
    );

    uploadStream.end(buffer);
  });
}

// ── deleteAsset ────────────────────────────────────────────────────────────────
/**
 * Deletes a Cloudinary asset by its public_id.
 * Call this before uploading a replacement if you want to free up storage
 * (skip if using overwrite: true with a stable publicId — Cloudinary replaces in-place).
 *
 * @param publicId  The Cloudinary public_id stored alongside the secureUrl in the DB
 */
export async function deleteAsset(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    // Log but don't throw — a failed delete is not user-facing critical
    console.error('[cloudinary.service] deleteAsset failed:', err);
  }
}

// ── Private helpers ────────────────────────────────────────────────────────────
function _mapResult(raw: UploadApiResponse): UploadResult {
  // Prefer the eager (transformed) URL when available
  const eager = raw.eager?.[0];
  return {
    secureUrl: eager?.secure_url ?? raw.secure_url,
    publicId: raw.public_id,
    width: eager?.width ?? raw.width,
    height: eager?.height ?? raw.height,
    format: raw.format,
    bytes: eager?.bytes ?? raw.bytes,
  };
}
