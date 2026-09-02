import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "portfolio_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must be set to a secure value of at least 32 characters.");
  }
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export async function createAdminSession() {
  const value = `${Date.now()}.${randomUUID()}`;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${value}.${sign(value)}`, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", { httpOnly: true, sameSite: "strict", path: "/", maxAge: 0 });
}

export async function isAdminAuthenticated() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;

    const separator = token.lastIndexOf(".");
    if (separator <= 0) return false;

    const value = token.slice(0, separator);
    const signature = token.slice(separator + 1);
    const expected = sign(value);
    if (signature.length !== expected.length) return false;

    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Unauthorized admin action.");
  }
}
