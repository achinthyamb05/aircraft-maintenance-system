export async function POST(request) {
  try {
    const { query } = await request.json();
    if (!query) {
      return Response.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const res = await fetch('http://127.0.0.1:8000/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}