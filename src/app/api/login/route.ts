import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();

  const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/method/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      usr: body.usr,
      pwd: body.pwd,
    }),
  });

  const data = await loginRes.json();

  if (data.message === 'Logged In') {
    const response = NextResponse.json(data);
    response.cookies.set('auth', 'yes', {
      path: '/',
      httpOnly: false, // Accessible by middleware
    });
    return response;
  }

  return NextResponse.json(data, { status: 401 });
}