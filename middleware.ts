import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    const session: any = await getToken({ req });

    if (!session?.user?.token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    try {
      const userRole = session?.user?.user?.role;
      const pathname = req.nextUrl.pathname;

      // Role-based access control
      if (pathname.startsWith("/admin") && userRole !== "admin") {
        return NextResponse.redirect(new URL("/tasks", req.url));
      }
      if (pathname.startsWith("/task") && userRole == "admin") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }: any) => !!token?.user?.token,
    },
  }
);

export const config = {
  matcher: ["/admin", "/tasks"],
};
