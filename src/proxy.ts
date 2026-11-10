export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/diary",
    "/diary/:path*",
    "/photo-diary",
    "/photo-diary/:path*",
    "/weight",
    "/weight/:path*",
    "/water",
    "/water/:path*",
    "/assistant",
    "/assistant/:path*",
    "/profile",
    "/profile/:path*",
    "/login",
    "/register",
  ],
};
