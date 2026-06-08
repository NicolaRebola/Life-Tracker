import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/app/api/constants';
import { cookies } from 'next/headers';

type UpdateEventRequestBody = {
  fromDateTime?: unknown;
  toDateTime?: unknown;
  name?: unknown;
  description?: unknown;
  notes?: unknown;
  tags?: unknown;
};

const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function parseDate(value: unknown) {
  if (typeof value !== 'string') return null;

  const dateStr = value.trim();
  if (!dateStr || !datetimeRegex.test(dateStr)) return null;

  const datetime = new Date(dateStr);
  if (Number.isNaN(datetime.getTime())) return null;

  return datetime.toISOString();
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as UpdateEventRequestBody | null;
  if (!body) return NextResponse.json({ message: 'Datos inválidos' }, { status: 400 });

  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const fromDateTime = parseDate(body.fromDateTime);
  const toDateTime = parseDate(body.toDateTime);

  if (!fromDateTime || !toDateTime) {
    return NextResponse.json(
      { message: 'Datos inválidos', fields: ['fromDateTime', 'toDateTime'] },
      { status: 400 },
    );
  }
  if (typeof body.name !== 'string' || body.name.trim() === '') {
    return NextResponse.json({ message: 'Datos inválidos', fields: ['name'] }, { status: 400 });
  }

  const response = await fetch(`${process.env.API_URL}/api/v1/events/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': req.headers.get('user-agent') ?? '',
      Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
    },
    body: JSON.stringify({
      fromDateTime,
      toDateTime,
      name: body.name,
      description: typeof body.description === 'string' ? body.description : '',
      notes: typeof body.notes === 'string' ? body.notes : '',
      tags: Array.isArray(body.tags) ? body.tags : [],
    }),
  }).catch(() => null);

  if (!response) {
    return NextResponse.json({ message: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  if (response.status === 401) {
    return NextResponse.json({ message: 'Vuelve a iniciar sesión' }, { status: 401 });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const message =
      typeof error?.message === 'string'
        ? error.message
        : 'Oops... algo salió mal.';

    return NextResponse.json(
      {
        message,
        fields: Array.isArray(error?.fields) ? error.fields : undefined,
      },
      { status: response.status },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? { ok: true });
}
