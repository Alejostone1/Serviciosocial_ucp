import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'GET' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: 'POST', body });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: 'PUT', body });
}

export async function DELETE() {
  return NextResponse.json({ message: 'DELETE' });
}
