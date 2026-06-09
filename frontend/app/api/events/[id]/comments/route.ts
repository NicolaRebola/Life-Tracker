import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/app/api/constants';
import { cookies } from 'next/headers';

type CreateEventCommentBody = {
  body?: unknown;
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response = await forwardToBackend(req, sessionToken, `/events/${id}/comments`, {
    method: 'GET',
  });

  if (!response) {
    return NextResponse.json({ message: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  if (response.status === 401) {
    return NextResponse.json({ message: 'Vuelve a iniciar sesión' }, { status: 401 });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return NextResponse.json(
      {
        message: typeof error?.message === 'string' ? error.message : 'No se pudieron cargar los comentarios',
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
  const body = (await req.json().catch(() => null)) as CreateEventCommentBody | null;

  if (!body || typeof body.body !== 'string' || body.body.trim() === '') {
    return NextResponse.json(
      { message: 'Datos inválidos', fields: ['body'] },
      { status: 400 },
    );
  }

  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response = await forwardToBackend(req, sessionToken, `/events/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ body: body.body }),
  });

  if (!response) {
    return NextResponse.json({ message: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  if (response.status === 401) {
    return NextResponse.json({ message: 'Vuelve a iniciar sesión' }, { status: 401 });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return NextResponse.json(
      {
        message: typeof error?.message === 'string' ? error.message : 'No se pudo crear el comentario',
        fields: Array.isArray(error?.fields) ? error.fields : undefined,
      },
      { status: response.status },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? { ok: true }, { status: 201 });
}
