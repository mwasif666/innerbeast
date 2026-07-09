import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_API_URL } from "@/config/site";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const getBackendApiUrl = () =>
  (
    process.env.API_URL ||
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_URL
  ).replace(/\/+$/, "");

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "set-cookie",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

const splitSetCookieHeader = (value: string | null) => {
  if (!value) return [];

  return value
    .split(/,(?=\s*[^;,=\s]+=[^;,]+)/g)
    .map((cookie) => cookie.trim())
    .filter(Boolean);
};

const getSetCookieHeaders = (headers: Headers) => {
  const headersWithCookies = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersWithCookies.getSetCookie === "function") {
    return headersWithCookies.getSetCookie();
  }

  return splitSetCookieHeader(headers.get("set-cookie"));
};

const rewriteCookieForFrontendDomain = (
  cookie: string,
  request: NextRequest,
) => {
  const parts = cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const [nameAndValue, ...attributes] = parts;
  const rewrittenAttributes: string[] = ["Path=/"];
  const isHttpsRequest = request.nextUrl.protocol === "https:";

  for (const attribute of attributes) {
    const lowerAttribute = attribute.toLowerCase();

    if (
      lowerAttribute.startsWith("domain=") ||
      lowerAttribute.startsWith("path=") ||
      lowerAttribute.startsWith("samesite=") ||
      lowerAttribute === "secure"
    ) {
      continue;
    }

    rewrittenAttributes.push(attribute);
  }

  rewrittenAttributes.push("SameSite=Lax");

  if (isHttpsRequest) {
    rewrittenAttributes.push("Secure");
  }

  return [nameAndValue, ...rewrittenAttributes].join("; ");
};

const buildBackendUrl = (request: NextRequest, path: string[]) => {
  const backendApiUrl = getBackendApiUrl();

  if (!backendApiUrl) {
    throw new Error("API_URL or NEXT_PUBLIC_API_URL is missing");
  }

  const cleanPath = path.map(encodeURIComponent).join("/");
  return `${backendApiUrl}/${cleanPath}${request.nextUrl.search}`;
};

const buildForwardHeaders = (request: NextRequest, backendUrl: string) => {
  const headers = new Headers(request.headers);
  const backendOrigin = new URL(backendUrl).origin;

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.set("origin", backendOrigin);
  headers.set("x-forwarded-host", request.nextUrl.host);
  headers.set("x-forwarded-proto", request.nextUrl.protocol.replace(":", ""));

  return headers;
};

const proxyRequest = async (
  request: NextRequest,
  context: { params: { path?: string[] } },
) => {
  try {
    const backendUrl = buildBackendUrl(request, context.params.path || []);
    const method = request.method.toUpperCase();
    const hasBody = method !== "GET" && method !== "HEAD";

    const upstreamResponse = await fetch(backendUrl, {
      method,
      headers: buildForwardHeaders(request, backendUrl),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: "no-store",
      redirect: "manual",
    });

    const responseHeaders = new Headers();

    upstreamResponse.headers.forEach((value, key) => {
      if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
        responseHeaders.set(key, value);
      }
    });

    responseHeaders.set("Cache-Control", "no-store");

    const responseBody =
      method === "HEAD" || upstreamResponse.status === 204
        ? null
        : await upstreamResponse.arrayBuffer();

    const response = new NextResponse(responseBody, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });

    getSetCookieHeaders(upstreamResponse.headers).forEach((cookie) => {
      response.headers.append(
        "Set-Cookie",
        rewriteCookieForFrontendDomain(cookie, request),
      );
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Backend API proxy request failed",
      },
      { status: 502 },
    );
  }
};

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const HEAD = proxyRequest;
