import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// import jwt from "jsonwebtoken";
import "dotenv/config";
import { jwtVerify } from "jose";
import { UserPayload } from "./app/types/types";

// const publicRoutes = ["/"];

const ROLE_PERMISSIONS = [
  {
    path: "/admin",
    allowedRoles: ["admin"],
  },
  {
    path: "/seller",
    allowedRoles: ["seller"],
  },
];

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = ROLE_PERMISSIONS.some((route) =>
    pathname.startsWith(route.path)
  );

  if (isProtectedRoute && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!accessToken) return NextResponse.next();

  try {
    const { payload } = await jwtVerify(accessToken, JWT_SECRET);
    const user = payload.user as UserPayload;

    const routeConfig = ROLE_PERMISSIONS.find((route) =>
      pathname.startsWith(route.path)
    );

    if (routeConfig) {
      // Si el rol del usuario NO está en la lista de permitidos
      if (!routeConfig.allowedRoles.includes(user.role)) {
        console.warn(
          `Acceso denegado: Rol ${user.role} intentó entrar a ${pathname}`
        );
        // Redirigir a una página de "No Autorizado" o al Dashboard general
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("access_token");
        return response;
      }
    }

    const response = NextResponse.next();
    response.headers.set("X-User-Role", user.role);
    response.headers.set("X-User-Id", user.id.toString() as string);
  } catch (error) {
    console.error("Token inválido:", error);

    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("access_token");

    return response;
  }
}

export const config = {
  matcher: [
    // Coincide con todas las rutas que empiecen por /dashboard
    "/admin/:path*",
    // Coincide con rutas de perfil
    "/seller/:path*",
    // Puedes excluir archivos estáticos, imágenes, etc.
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
