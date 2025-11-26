import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/"];

export async function middleware(request: NextRequest) {
  const cookies = request.cookies;
  const accessToken = cookies.get("access_token");
  const { pathname } = request.nextUrl;

  if (accessToken) {
    console.log(
      "✅ Middleware: Cookie access_token encontrada:",
      accessToken.value
    );
  } else {
    console.log("❌ Middleware: Cookie access_token NO encontrada.");
  }

  if (publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
