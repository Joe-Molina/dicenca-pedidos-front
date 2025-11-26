import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import "dotenv/config";

const publicRoutes = ["/"];
const JWT_SECRET = process.env.JWT_SECRET;

export async function proxy(request: NextRequest) {
  const cookies = request.cookies;
  const accessToken = cookies.get("access_token");
  const { pathname } = request.nextUrl;

  if (accessToken) {
    console.log(
      "✅ Middleware: Cookie access_token encontrada:",
      accessToken.value
    );

    const decodedJwt = jwt.verify(accessToken.value, JWT_SECRET!);

    console.log(decodedJwt);
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
