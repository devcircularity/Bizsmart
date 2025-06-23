// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  return NextResponse.next(); // Let everything through
}

export const config = {
  matcher: [], // No routes are matched
};