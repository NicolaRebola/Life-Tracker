import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/app/api/constants';
import { cookies } from 'next/headers';

type UpdateEventCommentBody = {
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const { id, commentId } = await params;
  const body = (await req.json().catch(() => null)) as UpdateEventCommentBody | null;

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

  const response = await forwardToBackend(
    req,
    sessionToken,
    `/events/${id}/comments/${commentId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({ body: body.body }),
    },
  );

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
        message: typeof error?.message === 'string' ? error.message : 'No se pudo actualizar el comentario',
        fields: Array.isArray(error?.fields) ? error.fields : undefined,
      },
      { status: response.status },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? { ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; commentId: string }> },
) {
  const { id, commentId } = await params;
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response = await forwardToBackend(
    req,
    sessionToken,
    `/events/${id}/comments/${commentId}`,
    { method: 'DELETE' },
  );

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
        message: typeof error?.message === 'string' ? error.message : 'No se pudo eliminar el comentario',
        fields: Array.isArray(error?.fields) ? error.fields : undefined,
      },
      { status: response.status },
    );
  }

  return new NextResponse(null, { status: 204 });
}
