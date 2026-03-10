import "server-only";

import { compare, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "entruempler_admin_session";

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (secret) {
    return secret;
  }

  if (process.env.NODE_ENV !== "production") {
    return "development-only-session-secret-change-me";
  }

  throw new Error("SESSION_SECRET is required in production.");
}

function getSessionKey() {
  return new TextEncoder().encode(getSessionSecret());
}

async function shouldUseSecureCookies() {
  const headerStore = await headers();
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const host =
    headerStore.get("x-forwarded-host") ?? headerStore.get("host") ?? "";

  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  if (!host) {
    return process.env.NODE_ENV === "production";
  }

  const normalizedHost = host.toLowerCase();
  const isLocalHost =
    normalizedHost.includes("localhost") || normalizedHost.startsWith("127.0.0.1");

  return process.env.NODE_ENV === "production" && !isLocalHost;
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function createAdminSession(adminUserId: string) {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminUserId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionKey());

  const cookieStore = await cookies();
  const secureCookies = await shouldUseSecureCookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookies,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSessionKey());

    if (typeof payload.sub !== "string") {
      return null;
    }

    return {
      userId: payload.sub,
    };
  } catch {
    return null;
  }
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}
