import { NextResponse } from "next/server";
import { adminAuth } from "./src/firebase/firebaseAdmin";

export async function middleware(req: any) {
  const token = req.cookies.token;

  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken; // Simpan informasi user jika diperlukan
  } catch (error) {
    console.error("Token verification error:", error);
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next(); // Lanjutkan ke request berikutnya
}
