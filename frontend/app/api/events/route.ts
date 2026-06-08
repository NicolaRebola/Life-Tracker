import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '../constants';
import { cookies } from 'next/headers';

type CreateEventRequestBody = {
  fromDateTime?: unknown;
  toDateTime?: unknown;
  name?: unknown;
  description?: unknown;
  notes?: unknown;
  tags?: unknown;
};

const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const ALLOWED_LIMITS = new Set([5, 10, 20, 50, 500]);
const ALLOWED_STATUSES = new Set(['TODO', 'IN_PROGRESS', 'DONE']);

function parseDate(value: unknown) {
  if (typeof value !== 'string') return null;

  const dateStr = value.trim();
  if (!dateStr || !datetimeRegex.test(dateStr)) return null;

  const datetime = new Date(dateStr);
  if (Number.isNaN(datetime.getTime())) return null;

  return datetime.toISOString();
}

function parseIsoDateParam(value: string | null) {
  if (!value?.trim()) return null;

  const datetime = new Date(value.trim());
  if (Number.isNaN(datetime.getTime())) return null;

  return datetime.toISOString();
}

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

function buildBackendQuery(searchParams: URLSearchParams) {
  const params = new URLSearchParams();

  const name = searchParams.get('name')?.trim();
  if (name) params.set('name', name);

  const status = searchParams.get('status')?.trim();
  if (status && ALLOWED_STATUSES.has(status)) {
    params.set('status', status);
  }

  const tags = searchParams.get('tags')?.trim();
  if (tags) params.set('tags', tags);

  const fromDateTimeParam = searchParams.get('fromDateTime');
  const toDateTimeParam = searchParams.get('toDateTime');
  const hasRangeFilter = Boolean(fromDateTimeParam || toDateTimeParam);

  if (hasRangeFilter) {
    const fromDateTime = parseIsoDateParam(fromDateTimeParam);
    const toDateTime = parseIsoDateParam(toDateTimeParam);

    if (!fromDateTime) {
      return {
        error: NextResponse.json(
          { message: 'Fecha inválida', fields: ['fromDateTime'] },
          { status: 400 },
        ),
      };
    }

    if (!toDateTime) {
      return {
        error: NextResponse.json(
          { message: 'Fecha inválida', fields: ['toDateTime'] },
          { status: 400 },
        ),
      };
    }

    if (new Date(fromDateTime) >= new Date(toDateTime)) {
      return {
        error: NextResponse.json(
          { message: 'El rango de fechas es inválido', fields: ['fromDateTime', 'toDateTime'] },
          { status: 400 },
        ),
      };
    }

    params.set('fromDateTime', fromDateTime);
    params.set('toDateTime', toDateTime);
  }

  const page = Number(searchParams.get('page') ?? '1');
  const limit = Number(searchParams.get('limit') ?? (hasRangeFilter ? '500' : '10'));

  if (!Number.isInteger(page) || page < 1) {
    return { error: NextResponse.json({ message: 'Página inválida', fields: ['page'] }, { status: 400 }) };
  }

  if (!ALLOWED_LIMITS.has(limit)) {
    return { error: NextResponse.json({ message: 'Límite inválido', fields: ['limit'] }, { status: 400 }) };
  }

  params.set('page', String(page));
  params.set('limit', String(limit));

  return { query: params.toString() };
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

export async function GET(req: Request) {
  const sessionToken = await getSessionToken();
  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const queryResult = buildBackendQuery(searchParams);
  if ('error' in queryResult && queryResult.error) {
    return queryResult.error;
  }

  const response = await forwardToBackend(
    req,
    sessionToken,
    `/events?${queryResult.query}`,
    { method: 'GET' },
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
        message: typeof error?.message === 'string' ? error.message : 'Oops... algo salió mal.',
        fields: Array.isArray(error?.fields) ? error.fields : undefined,
      },
      { status: response.status },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? { items: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as CreateEventRequestBody | null;
  if (!body) return NextResponse.json({ message: 'Datos inválidos' }, { status: 400 });

  const sessionToken = await getSessionToken();
  if (!sessionToken) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const fromDateTime = parseDate(body.fromDateTime);
  const toDateTime = parseDate(body.toDateTime);

  if (!fromDateTime || !toDateTime) {
    return NextResponse.json({ message: 'Datos inválidos', fields: ['fromDateTime', 'toDateTime'] }, { status: 400 });
  }
  if (typeof body.name !== 'string' || body.name.trim() === '') {
    return NextResponse.json({ message: 'Datos inválidos', fields: ['name'] }, { status: 400 });
  }

  const response = await forwardToBackend(req, sessionToken, '/events', {
    method: 'POST',
    body: JSON.stringify({
      fromDateTime,
      toDateTime,
      name: body.name,
      description: typeof body.description === 'string' ? body.description : '',
      notes: typeof body.notes === 'string' ? body.notes : '',
      tags: Array.isArray(body.tags) ? body.tags : [],
    }),
  });

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
  return NextResponse.json(data ?? { ok: true }, { status: 201 });
}
