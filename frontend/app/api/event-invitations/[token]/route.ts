import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const response = await fetch(
    `${process.env.API_URL}/api/v1/event-invitations/${token}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers.get('user-agent') ?? '',
      },
    },
  ).catch(() => null);

  if (!response) {
    return NextResponse.json(
      { message: 'No se pudo conectar con el servidor' },
      { status: 502 },
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    return NextResponse.json(
      {
        message:
          typeof error?.message === 'string'
            ? error.message
            : 'No se pudo cargar la invitación',
      },
      { status: response.status },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? { invitation: null });
}
