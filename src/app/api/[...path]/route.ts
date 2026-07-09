import { NextRequest, NextResponse } from "next/server";

import { getApiUrl } from "@/config/site";

const backendApiUrl = getApiUrl().replace(/\/+$/, "");
const CLIENT_AUTH_COOKIE = "innerbeast-auth-token";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-length",
  "content-encoding",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const splitSetCookie = (header: string) => {
  const cookies: string[] = [];
  let start = 0;
  let inExpires = false;

  for (let index = 0; index < header.length; index += 1) {
    const char = header[index];
    const rest = header.slice(index).toLowerCase();

    if (rest.startsWith("expires=")) {
      inExpires = true;
    }

    if (inExpires && char === ";") {
      inExpires = false;
    }

    if (!inExpires && char === ",") {
      cookies.push(header.slice(start, index).trim());
      start = index + 1;
    }
  }

  cookies.push(header.slice(start).trim());
  return cookies.filter(Boolean);
};

const getSetCookies = (headers: Headers) => {
  const withGetter = headers as Headers & { getSetCookie?: () => string[] };
  const cookies = withGetter.getSetCookie?.();

  if (cookies?.length) return cookies;

  const combined = headers.get("set-cookie");
  return combined ? splitSetCookie(combined) : [];
};

const rewriteCookieForFrontend = (cookie: string, request: NextRequest) => {
  const secure = request.nextUrl.protocol === "https:";
  const [nameValue, ...attributes] = cookie.split(";").map((part) => part.trim());
  const filteredAttributes = attributes.filter((attribute) => {
    const lower = attribute.toLowerCase();
    return (
      !lower.startsWith("domain=") &&
      !lower.startsWith("path=") &&
      !lower.startsWith("samesite=") &&
      lower !== "secure"
    );
  });

  return [
    nameValue,
    "Path=/",
    "HttpOnly",
    secure ? "Secure" : "",
    "SameSite=Lax",
    ...filteredAttributes,
  ]
    .filter(Boolean)
    .join("; ");
};

const getCookieNameValue = (cookie: string) => cookie.split(";")[0]?.trim() || "";

const appendReadableAuthCookie = (
  response: NextResponse,
  backendCookie: string,
  request: NextRequest,
) => {
  const nameValue = getCookieNameValue(backendCookie);
  if (!nameValue.startsWith("token=")) return;

  const token = nameValue.slice("token=".length);
  const secure = request.nextUrl.protocol === "https:";
  const expiresNow = !token || backendCookie.toLowerCase().includes("expires=thu, 01 jan 1970");

  response.headers.append(
    "set-cookie",
    [
      `${CLIENT_AUTH_COOKIE}=${token}`,
      "Path=/",
      expiresNow ? "Max-Age=0" : "Max-Age=604800",
      secure ? "Secure" : "",
      "SameSite=Lax",
    ]
      .filter(Boolean)
      .join("; "),
  );
};

const proxy = async (
  request: NextRequest,
  context: { params: { path?: string[] } },
) => {
  const path = (context.params.path || []).join("/");
  const backendUrl = `${backendApiUrl}/${path}${request.nextUrl.search}`;
  const backendOrigin = new URL(backendApiUrl).origin;

  const headers = new Headers(request.headers);
  headers.set("host", new URL(backendOrigin).host);
  headers.set("origin", backendOrigin);
  headers.set("x-forwarded-host", request.headers.get("host") || "");
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  const backendResponse = await fetch(backendUrl, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.arrayBuffer(),
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers();

  backendResponse.headers.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase()) && key.toLowerCase() !== "set-cookie") {
      responseHeaders.set(key, value);
    }
  });

  const response = new NextResponse(await backendResponse.arrayBuffer(), {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: responseHeaders,
  });

  getSetCookies(backendResponse.headers).forEach((cookie) => {
    response.headers.append("set-cookie", rewriteCookieForFrontend(cookie, request));
    appendReadableAuthCookie(response, cookie, request);
  });

  return response;
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const OPTIONS = proxy;
