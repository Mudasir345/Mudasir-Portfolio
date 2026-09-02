const CLOUDINARY_BASE = "https://res.cloudinary.com/";
const CDN_BASES = [
  CLOUDINARY_BASE,
  "https://cdn.jsdelivr.net/",
  "https://cdn.simpleicons.org/",
];

function getCloudName(): string {
  if (
    typeof process !== "undefined" &&
    process.env &&
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  ) {
    return process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string;
  }
  try {
    const w = globalThis as unknown as { __CLOUD_NAME?: string };
    return w.__CLOUD_NAME || "as4hjbxb";
  } catch {
    return "as4hjbxb";
  }
}

function isCloudinaryUrl(url: unknown): boolean {
  return (
    typeof url === "string" &&
    (url.startsWith(CLOUDINARY_BASE) ||
      url.startsWith("https://cloudinary.com/"))
  );
}

function isSvg(url: string): boolean {
  const clean = url.split("?")[0].toLowerCase();
  return clean.endsWith(".svg");
}

function isVideoHint(url: string, mediaType?: string): boolean {
  if (mediaType === "video") return true;
  const clean = url.split("?")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".mov") ||
    url.includes("/video/upload/")
  );
}

function transformsFor(
  mediaType: "image" | "video" | "raw"
): string[] {
  if (mediaType === "video") {
    return ["q_auto:eco", "vc_auto", "ac_ultra", "f_auto", "fl_strip_profile"];
  }
  if (mediaType === "raw") {
    return [];
  }
  return [
    "q_auto:eco",
    "w_1600",
    "c_limit",
    "fl_progressive",
    "fl_awebp",
    "fl_strip_profile",
    "f_avif",
  ];
}

export function buildOptimizedUrl(
  url: string,
  mediaType?: "image" | "video" | "raw"
): string {
  if (typeof url !== "string" || !url) return url;

  const isVideo = isVideoHint(url, mediaType);
  const effectiveMediaType: "image" | "video" | "raw" = isVideo
    ? "video"
    : mediaType === "raw"
    ? "raw"
    : "image";

  if (isSvg(url)) return url;

  if (!isCloudinaryUrl(url)) return url;

  try {
    const u = new URL(url);
    const parts = u.pathname.split("/").filter(Boolean);
    const uploadIdx = parts.indexOf("upload");
    if (uploadIdx === -1) return url;

    const cloudName = getCloudName();
    if (cloudName && parts.indexOf(cloudName) === -1) return url;

    const transforms = transformsFor(effectiveMediaType);
    if (transforms.length === 0) return url;

    const before = parts.slice(0, uploadIdx + 1);
    const after = parts.slice(uploadIdx + 1);

    const existingSegment =
      after.findIndex((seg) => {
        if (seg.startsWith("v") && /^v\d+$/.test(seg)) return false;
        return /[fqcw]_/.test(seg) || seg.includes("fl_") || /auto/.test(seg);
      }) !== -1;

    let newAfter: string[];
    if (existingSegment) {
      newAfter = after.map((seg) => {
        const isTransformSeg =
          !/^v\d+$/.test(seg) &&
          (/[fqcw]_/.test(seg) || seg.includes("fl_") || /auto/.test(seg));
        return isTransformSeg ? transforms.join(",") : seg;
      });
    } else {
      newAfter = [transforms.join(","), ...after];
    }
    if (newAfter[0] === "") newAfter.shift();

    u.pathname = "/" + [...before, ...newAfter].join("/");
    return u.toString();
  } catch {
    return url;
  }
}

export function optimizeMediaUrl(
  url: unknown,
  mediaType?: "image" | "video" | "raw"
): unknown {
  if (typeof url !== "string") return url;
  return buildOptimizedUrl(url, mediaType);
}

const URL_HINT_KEYS: Record<string, "image" | "video"> = {
  image: "image",
  cover: "image",
  logo: "image",
  icon: "image",
  ogImage: "image",
  profileImage: "image",
  url: "image",
  thumbnail: "image",
  screenshot: "image",
  media: "image",
  avatar: "image",
  video: "video",
  trailer: "video",
  demo: "video",
};

function isLikelyUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (value.startsWith("http://") ||
      value.startsWith("https://") ||
      value.startsWith("/"))
  );
}

export function optimizeAllMediaInObject<T = unknown>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => optimizeAllMediaInObject(item)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const hint = URL_HINT_KEYS[k] || URL_HINT_KEYS[k.toLowerCase()];
      if (isLikelyUrl(v) && (hint || CDN_BASES.some((b) => v.startsWith(b)))) {
        const mediaType: "image" | "video" =
          hint === "video"
            ? "video"
            : isVideoHint(v, hint)
            ? "video"
            : "image";
        out[k] = buildOptimizedUrl(v as string, mediaType);
      } else {
        out[k] = optimizeAllMediaInObject(v);
      }
    }
    return out as unknown as T;
  }
  return value;
}

export { isCloudinaryUrl, getCloudName };
