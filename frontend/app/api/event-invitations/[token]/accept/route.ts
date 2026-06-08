import {
  PARTICIPANT_SESSION_COOKIE_NAME,
} from '@/app/api/constants';
import { NextResponse } from 'next/server';

type AcceptInvitationBody = {
  displayName?: unknown;
};

export async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const body = (await req.json().catch(() => null)) as AcceptInvitationBody | null;

  const response = await fetch(
    `${process.env.API_URL}/api/v1/event-invitations/${token}/accept`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers.get('user-agent') ?? '',
      },
      body: JSON.stringify({
        displayName: typeof body?.displayName === 'string' ? body.displayName : null,
      }),
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json({ message: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return NextResponse.json(
      {
        message: typeof error?.message === 'string' ? error.message : 'No se pudo aceptar la invitación',
      },
      { status: response.status },
    );
  }

  const data = await response.json();
  const nextResponse = NextResponse.json({
    participant: data.participant,
    expiresAt: data.expiresAt,
  });

  nextResponse.cookies.set({
    name: PARTICIPANT_SESSION_COOKIE_NAME,
    value: data.participantSessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(data.expiresAt),
  });

  return nextResponse;
}
