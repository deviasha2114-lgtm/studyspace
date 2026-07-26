import multer, { FileFilterCallback } from "multer";
import { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Constants (SEC-S2-03)
// ---------------------------------------------------------------------------
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  // SVG is explicitly excluded — XSS risk via embedded <script> tags
]);

/**
 * Magic byte signatures for allowed types.
 * We read the first 4 bytes of the buffer and compare regardless of the
 * file extension or the Content-Type header the client claims.
 */
const MAGIC_BYTES: Record<string, Buffer[]> = {
  "image/jpeg": [Buffer.from([0xff, 0xd8, 0xff])],
  "image/png":  [Buffer.from([0x89, 0x50, 0x4e, 0x47])], // ‌PNG\r
  "image/webp": [
    // WebP: RIFF????WEBP — bytes 0-3 = RIFF, bytes 8-11 = WEBP
    // We check both markers below in the validator
    Buffer.from([0x52, 0x49, 0x46, 0x46]),
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Strip anything that isn't alphanumeric, dash, or dot; inject a random suffix */
function sanitizeFilename(original: string): string {
  const ext = path.extname(original).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const base = path
    .basename(original, ext)
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .substring(0, 40); // cap base length

  const random = crypto.randomBytes(8).toString("hex");
  return `${base}_${random}${ext}`;
}

/** Validate magic bytes of a buffer against known signatures */
function validateMagicBytes(
  buffer: Buffer,
  mimetype: string
): boolean {
  const signatures = MAGIC_BYTES[mimetype];
  if (!signatures) return false;

  for (const sig of signatures) {
    const slice = buffer.subarray(0, sig.length);
    if (slice.equals(sig)) {
      // Extra check for WebP: bytes 8-11 must be "WEBP"
      if (mimetype === "image/webp") {
        const webpMarker = buffer.subarray(8, 12);
        return webpMarker.equals(Buffer.from([0x57, 0x45, 0x42, 0x50]));
      }
      return true;
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Multer config — memory storage so we can inspect bytes before Cloudinary
// ---------------------------------------------------------------------------
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(
      new Error(
        `File type "${file.mimetype}" is not allowed. ` +
        "Only JPEG, PNG, and WebP images are accepted."
      )
    );
  }
  cb(null, true);
};

export const multerAvatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single("avatar");

// ---------------------------------------------------------------------------
// Magic-byte validation middleware (runs AFTER multer populates req.file)
// ---------------------------------------------------------------------------
export function validateAvatarMagicBytes(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.file) {
    res.status(400).json({
      success: false,
      error: { code: "NO_FILE", message: "No avatar file provided." },
    });
    return;
  }

  const { buffer, mimetype, originalname } = req.file;

  // 1. Magic-byte check
  if (!validateMagicBytes(buffer, mimetype)) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_FILE_SIGNATURE",
        message:
          "File content does not match the declared type. " +
          "Upload a valid JPEG, PNG, or WebP image.",
      },
    });
    return;
  }

  // 2. Sanitize filename before it reaches Cloudinary
  req.file.originalname = sanitizeFilename(originalname);

  next();
}

// ---------------------------------------------------------------------------
// Combined middleware array — use in your route:
//   router.patch("/me/avatar", avatarUploadMiddleware, controller)
// ---------------------------------------------------------------------------
export function avatarUploadMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  multerAvatarUpload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: "Avatar must be 2 MB or smaller.",
          },
        });
        return;
      }
      res.status(400).json({
        success: false,
        error: { code: "UPLOAD_ERROR", message: err.message },
      });
      return;
    }

    if (err) {
      // fileFilter rejection lands here
      res.status(400).json({
        success: false,
        error: { code: "INVALID_FILE_TYPE", message: err.message },
      });
      return;
    }

    // Multer passed — now validate magic bytes
    validateAvatarMagicBytes(req, res, next);
  });
}
