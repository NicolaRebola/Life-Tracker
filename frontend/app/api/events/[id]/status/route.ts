import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/app/api/constants';
import { cookies } from 'next/headers';

const ALLOWED_STATUSES = new Set(['TODO', 'IN_PROGRESS', 'DONE']);

type UpdateStatusBody = {
  status?: unknown;
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as UpdateStatusBody | null;

  if (!body || typeof body.status !== 'string' || !ALLOWED_STATUSES.has(body.status)) {
    return NextResponse.json({ message: 'Estado inválido', fields: ['status'] }, { status: 400 });
  }

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(`${process.env.API_URL}/api/v1/events/${id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': req.headers.get('user-agent') ?? '',
      Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
    },
    body: JSON.stringify({ status: body.status }),
  }).catch(() => null);

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
        message: typeof error?.message === 'string' ? error.message : 'No se pudo actualizar el estado',
        fields: Array.isArray(error?.fields) ? error.fields : undefined,
      },
      { status: response.status },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? { ok: true });
}
