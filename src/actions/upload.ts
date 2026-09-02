"use server";

import { Readable } from "node:stream";
import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/adminAuth";
import {
  buildOptimizedUrl,
  isCloudinaryUrl as sharedIsCloudinaryUrl,
} from "@/lib/mediaOptimizer";

const ALLOWED_FOLDERS = new Set(["projects", "profile", "misc", "team"]);
const CLOUDINARY_BASE = "https://res.cloudinary.com/";

let cloudinaryConfigured = false;

function ensureCloudinaryConfig() {
  if (cloudinaryConfigured) return true;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (
    !cloudName ||
    cloudName === "REPLACE_WITH_YOUR_CLOUD_NAME" ||
    !apiKey ||
    !apiSecret
  ) {
    return false;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  cloudinaryConfigured = true;
  return true;
}

function getCloudName(): string {
  return (
    (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string) ||
    ((cloudinary.config().cloud_name as string) ?? "")
  );
}

function extractPublicIdFromUrl(url: string): {
  publicId: string;
  resourceType: "image" | "video" | "raw";
} | null {
  if (!url.startsWith(CLOUDINARY_BASE)) return null;

  try {
    const cloudName = getCloudName();
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/").filter(Boolean);

    const idxAfterCloud = cloudName ? pathParts.indexOf(cloudName) + 1 : 2;
    if (idxAfterCloud <= 1 || idxAfterCloud >= pathParts.length) return null;

    const afterCloud = pathParts.slice(idxAfterCloud);

    const resourceType: "image" | "video" | "raw" =
      afterCloud[0] === "video"
        ? "video"
        : afterCloud[0] === "raw"
        ? "raw"
        : "image";

    const afterResourceType =
      afterCloud[0] === "image" ||
      afterCloud[0] === "video" ||
      afterCloud[0] === "raw"
        ? afterCloud.slice(1)
        : afterCloud;

    const uploadIndex = afterResourceType.indexOf("upload");
    if (uploadIndex === -1) return null;

    const afterUpload = afterResourceType.slice(uploadIndex + 1);
    if (afterUpload.length === 0) return null;

    let afterVersion = afterUpload;
    if (
      afterUpload[0] &&
      afterUpload[0].startsWith("v") &&
      !isNaN(Number(afterUpload[0].slice(1)))
    ) {
      afterVersion = afterUpload.slice(1);
    }

    const fullPath = afterVersion.join("/");
    const lastDot = fullPath.lastIndexOf(".");
    const publicId = lastDot !== -1 ? fullPath.slice(0, lastDot) : fullPath;

    if (!publicId) return null;
    return { publicId, resourceType };
  } catch {
    return null;
  }
}

function isCloudinaryUrl(url: string): boolean {
  return sharedIsCloudinaryUrl(url);
}

function getUploadOptimizations(
  file: File,
  resourceType: "image" | "video" | "auto"
): {
  format?: string;
  quality?: string | number;
  flags?: string;
} {
  if (resourceType === "video") {
    return { quality: "auto:eco" };
  }

  const mimeType = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  const isPng = mimeType === "image/png" || name.endsWith(".png");
  const isJpeg =
    mimeType === "image/jpeg" ||
    mimeType === "image/jpg" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg");
  const isSvg = mimeType === "image/svg+xml" || name.endsWith(".svg");
  const isGif = mimeType === "image/gif" || name.endsWith(".gif");

  if (isSvg) {
    return { flags: "svgo" };
  }

  if (isGif) {
    return {
      format: "webp",
      quality: "auto:eco",
      flags: "animated,strip_profile",
    };
  }

  if (isPng) {
    return {
      format: "webp",
      quality: "auto:good",
      flags: "strip_profile,awebp",
    };
  }

  if (isJpeg) {
    return {
      format: "webp",
      quality: "auto:eco",
      flags: "strip_profile,awebp,progressive",
    };
  }

  return {
    format: "webp",
    quality: "auto:good",
    flags: "strip_profile,awebp",
  };
}

async function uploadStream(
  file: File,
  cloudinaryFolder: string,
  publicId: string,
  resourceType: "image" | "video" | "auto"
): Promise<{ secure_url: string; resource_type: string; bytes: number }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const optimizations = getUploadOptimizations(file, resourceType);

  return new Promise((resolve, reject) => {
    const cldStream = cloudinary.uploader.upload_stream(
      {
        folder: cloudinaryFolder,
        public_id: publicId,
        resource_type: resourceType,
        unique_filename: true,
        use_filename: false,
        overwrite: false,
        invalidate: false,
        chunk_size: resourceType === "video" ? 6_000_000 : undefined,
        ...optimizations,
      },
      (err, result) => {
        if (err) return reject(err);
        if (!result) return reject(new Error("Empty Cloudinary response"));
        resolve({
          secure_url: result.secure_url,
          resource_type: result.resource_type || resourceType,
          bytes: result.bytes || buffer.length,
        });
      }
    );

    Readable.from(buffer).pipe(cldStream);
  });
}

export async function uploadFile(formData: FormData, folder: string = "misc") {
  try {
    await requireAdmin();

    if (!ALLOWED_FOLDERS.has(folder)) {
      return { success: false, error: "Invalid upload folder" };
    }

    if (!ensureCloudinaryConfig()) {
      return {
        success: false,
        error:
          "Cloudinary is not configured. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
      };
    }

    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "No file provided" };
    }

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      return {
        success: false,
        error: "Invalid file type. Only images and videos are allowed.",
      };
    }

    const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: `File too large. Max size: ${isVideo ? "50MB" : "10MB"}`,
      };
    }

    const timestamp = Date.now();
    const safeStem = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .replace(/\.[^/.]+$/, "");
    const publicId = `${timestamp}-${safeStem}`;
    const cloudinaryFolder = `portfolio/${folder}`;
    const resourceType: "image" | "video" | "auto" = isVideo
      ? "video"
      : isImage
      ? "image"
      : "auto";

    const result = await uploadStream(
      file,
      cloudinaryFolder,
      publicId,
      resourceType
    );

    const detectedMediaType: "image" | "video" =
      result.resource_type === "video" ? "video" : "image";

    const optimizedUrl = buildOptimizedUrl(
      result.secure_url,
      detectedMediaType
    );

    return {
      success: true,
      filePath: optimizedUrl,
      mediaType: detectedMediaType,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function deleteFile(fileUrl: string) {
  try {
    await requireAdmin();

    if (!fileUrl) {
      return { success: true, message: "Empty URL, nothing to delete" };
    }

    if (fileUrl.includes("..")) {
      return { success: false, error: "Invalid path" };
    }

    if (fileUrl.startsWith("/uploads/")) {
      return {
        success: true,
        message: "Skipped deleting legacy local upload",
      };
    }

    if (!isCloudinaryUrl(fileUrl)) {
      return {
        success: true,
        message: "Skipped deleting default external asset",
      };
    }

    if (!ensureCloudinaryConfig()) {
      return {
        success: false,
        error: "Cloudinary is not configured. Cannot delete remote asset.",
      };
    }

    const extracted = extractPublicIdFromUrl(fileUrl);
    if (!extracted) {
      return {
        success: true,
        message: "Could not parse Cloudinary public_id from URL",
      };
    }

    const { publicId, resourceType } = extracted;

    let destroyed = false;
    try {
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });
      if (res && (res.result === "ok" || res.result === "deleted")) {
        destroyed = true;
      }
    } catch {
      destroyed = false;
    }

    if (!destroyed) {
      const tryTypes: Array<"image" | "video" | "raw"> =
        resourceType === "image"
          ? ["video", "raw"]
          : resourceType === "video"
          ? ["image", "raw"]
          : ["image", "video"];

      for (const t of tryTypes) {
        try {
          const res = await cloudinary.uploader.destroy(publicId, {
            resource_type: t,
            invalidate: true,
          });
          if (res && (res.result === "ok" || res.result === "deleted")) {
            destroyed = true;
            break;
          }
        } catch {
          // ignore
        }
      }
    }

    return {
      success: true,
      message: destroyed
        ? "Asset deleted"
        : "Asset not found or already deleted",
    };
  } catch (error) {
    console.error("Delete error:", error);
    return {
      success: true,
      message: "File not found or already deleted",
    };
  }
}
