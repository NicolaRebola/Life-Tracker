import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/app/api/constants';
import { cookies } from 'next/headers';

type InviteParticipantBody = {
  email?: unknown;
};

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

async function forwardToBackend(
  req: Request,
  sessionToken: string,
  path: string,
  init?: RequestInit,
) {
  return fetch(`${process.env.API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': req.headers.get('user-agent') ?? '',
      Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
      ...(init?.headers ?? {}),
    },
  }).catch(() => null);
}

function parseEmail(value: unknown) {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response = await forwardToBackend(
    req,
    sessionToken,
    `/events/${id}/participants`,
    { method: 'GET' },
  );

  if (!response) {
    return NextResponse.json({ message: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return NextResponse.json(
      {
        message: typeof error?.message === 'string' ? error.message : 'No se pudieron cargar los participantes',
        fields: Array.isArray(error?.fields) ? error.fields : undefined,
      },
      { status: response.status },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? { items: [] });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as InviteParticipantBody | null;
  const email = parseEmail(body?.email);

  if (!email) {
    return NextResponse.json(
      { message: 'Email inválido', fields: ['email'] },
      { status: 400 },
    );
  }

  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response = await forwardToBackend(
    req,
    sessionToken,
    `/events/${id}/invitations`,
    {
      method: 'POST',
      body: JSON.stringify({ email }),
    },
  );

  if (!response) {
    return NextResponse.json({ message: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return NextResponse.json(
      {
        message: typeof error?.message === 'string' ? error.message : 'No se pudo invitar al participante',
        fields: Array.isArray(error?.fields) ? error.fields : undefined,
      },
      { status: response.status },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? { ok: true }, { status: 201 });
}
