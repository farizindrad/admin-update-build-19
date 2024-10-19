// middleware.ts

import { NextResponse } from "next/server";
import nookies from "nookies";
import { adminAuth } from "./src/firebase/firebaseAdmin";

export async function middleware(req: any) {
  // Ambil cookies
  const token = nookies.get(req).token;
  const role = nookies.get(req).role;

  // Redirect ke halaman login jika tidak ada token
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    // Verifikasi token
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next(); // Lanjutkan ke request berikutnya jika verifikasi sukses
}
