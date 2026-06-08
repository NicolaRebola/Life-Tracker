import { NextResponse } from 'next/server';
import { PARTICIPANT_SESSION_COOKIE_NAME } from '@/app/api/constants';
import { cookies } from 'next/headers';

async function getParticipantSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(PARTICIPANT_SESSION_COOKIE_NAME)?.value ?? null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sessionToken = await getParticipantSessionToken();

  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${process.env.API_URL}/api/v1/shared/events/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': req.headers.get('user-agent') ?? '',
      Cookie: `${PARTICIPANT_SESSION_COOKIE_NAME}=${sessionToken}`,
    },
  }).catch(() => null);

  if (!response) {
    return NextResponse.json({ message: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return NextResponse.json(
      { message: typeof error?.message === 'string' ? error.message : 'No se pudo cargar el evento' },
      { status: response.status },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? { event: null });
}
