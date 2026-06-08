import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/app/api/constants';
import { cookies } from 'next/headers';

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; participantId: string }> },
) {
  const { id, participantId } = await params;
  const sessionToken = await getSessionToken();

  if (!sessionToken) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const response = await fetch(
    `${process.env.API_URL}/api/v1/events/${id}/participants/${participantId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers.get('user-agent') ?? '',
        Cookie: `${SESSION_COOKIE_NAME}=${sessionToken}`,
      },
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json({ message: 'No se pudo conectar con el servidor' }, { status: 502 });
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return NextResponse.json(
      {
        message: typeof error?.message === 'string' ? error.message : 'No se pudo quitar el participante',
        fields: Array.isArray(error?.fields) ? error.fields : undefined,
      },
      { status: response.status },
    );
  }

  return new NextResponse(null, { status: 204 });
}
