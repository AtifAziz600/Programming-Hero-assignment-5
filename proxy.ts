import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwt(token: string) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const tokenCookie = request.cookies.get("accessToken");
  const token = tokenCookie?.value;

  const isAuthPage = pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register");
  const isDashboardPage = pathname.startsWith("/dashboard");

  if (isDashboardPage) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJwt(token);
    if (!payload || !payload.role) {
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("accessToken");
      return response;
    }

    const userRole = payload.role;
    if (pathname.startsWith("/dashboard/customer") && userRole !== "CUSTOMER") {
      return NextResponse.redirect(new URL(getRedirectPath(userRole), request.url));
    }
    if (pathname.startsWith("/dashboard/provider") && userRole !== "PROVIDER") {
      return NextResponse.redirect(new URL(getRedirectPath(userRole), request.url));
    }
    if (pathname.startsWith("/dashboard/admin") && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL(getRedirectPath(userRole), request.url));
    }
  }

  if (isAuthPage && token) {
    const payload = decodeJwt(token);
    if (payload?.role) {
      return NextResponse.redirect(new URL(getRedirectPath(payload.role), request.url));
    }
  }

  return NextResponse.next();
}

function getRedirectPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "PROVIDER":
      return "/dashboard/provider";
    case "CUSTOMER":
    default:
      return "/dashboard/customer";
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/login", "/auth/register"],
};
