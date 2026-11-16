import { NextResponse } from 'next/server';
  
  export function GET() {
    return NextResponse.json({
      ok: true,
      service: 'avatares',
      timestamp: new Date().toISOString(),
    });
  }
  