export async function GET() {
  const response = await fetch(`${process.env.API_URL}/api/v1/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return Response.json(
      { error: "Nest health request failed" },
      { status: response.status },
    );
  }

  const data = await response.json();

  return Response.json(data);
}

