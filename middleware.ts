import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // /admin へのアクセスを制限
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // 環境変数でパスワードを設定
    const adminPassword = process.env.ADMIN_PASSWORD || 'gap-finder-admin';
    
    // Basic認証をチェック
    const basicAuth = request.headers.get('authorization');
    
    if (basicAuth) {
      const auth = basicAuth.split(' ')[1];
      const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':');
      
      if (user === 'admin' && pwd === adminPassword) {
        return NextResponse.next();
      }
    }
    
    // 認証が必要
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    });
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};