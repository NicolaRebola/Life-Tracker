import { SESSION_COOKIE_NAME } from "@/app/api/constants";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const response = await fetch(`${process.env.API_URL}/api/v1/session/google/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": req.headers.get("user-agent") ?? "",
    },
    body: JSON.stringify({
      idToken: body.idToken,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);

    return NextResponse.json(
      {
        message: "Login failed",
        error,
      },
      { status: response.status },
    );
  }

  const data = await response.json();

  const nextResponse = NextResponse.json({
    user: data.user,
    expiresAt: data.expiresAt,
  });

  nextResponse.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: data.sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(data.expiresAt),
  });

  return nextResponse;
}