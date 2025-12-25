import { NextResponse } from 'next/server';

export function GET() {
  // Return client-side API URL (for browser requests)
  // Server-side requests use API_URL directly (which is set to http://backend:3000 in Docker)
  // Client-side needs to use the exposed port on localhost
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  return NextResponse.json({ apiUrl });
}