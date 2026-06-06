import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/app/api/constants';

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name')?.trim() ?? '';
  const limit = Number(searchParams.get('limit') ?? '10');

  if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
    return NextResponse.json(
      { message: 'Límite inválido', fields: ['limit'] },
      { status: 400 },
    );
  }

  const backendParams = new URLSearchParams();
  if (name) backendParams.set('name', name);
  backendParams.set('limit', String(limit));

  const response = await fetch(
    `${process.env.API_URL}/api/v1/events/tags?${backendParams.toString()}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers.get('user-agent') ?? '',
        Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
      },
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: 'No se pudo conectar con el servidor' },
      { status: 502 },
    );
  }

  if (response.status === 401) {
    return NextResponse.json(
      { message: 'Vuelve a iniciar sesión' },
      { status: 401 },
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return NextResponse.json(
      {
        message:
          typeof error?.message === 'string'
            ? error.message
            : 'No se pudieron buscar tags',
        fields: Array.isArray(error?.fields) ? error.fields : undefined,
      },
      { status: response.status },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? { items: [] });
}
