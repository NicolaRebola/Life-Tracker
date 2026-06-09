import { SESSION_COOKIE_NAME } from "@/app/api/constants";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function unauthenticatedResponse() {
  const response = NextResponse.json({ authenticated: false });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}

export async function GET() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return NextResponse.json({ authenticated: false });
  }

  try {
    const response = await fetch(`${process.env.API_URL}/api/v1/session/current`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
      },
    });

    if (!response.ok) {
      return unauthenticatedResponse();
    }

    const data = await response.json();

    return NextResponse.json({
      authenticated: true,
      user: data.user,
      session: data.session,
    });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}
