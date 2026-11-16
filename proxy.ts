import { NextResponse, type NextRequest } from 'next/server';
  
  export function proxy(request: NextRequest) {
    const response = NextResponse.next();
    response.headers.set('x-vacoder-app', 'avatares');
    return response;
  }
  
  export const config = {
    matcher: ['/dashboard/:path*', '/admin/:path*'],
  };
  