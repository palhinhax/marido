import { NextResponse } from "next/server";
import { getPresignedUrl, isStorageConfigured } from "@/lib/storage";

export const runtime = "nodejs";

// Resolves an app-facing file URL to a short-lived presigned B2 URL and
// redirects the browser to it. Keeps the bucket private while allowing
// <img src="/api/files/..."> to work.
export async function GET(
  _request: Request,
  { params }: { params: { key: string[] } }
) {
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { message: "Armazenamento não configurado" },
      { status: 500 }
    );
  }
  const key = params.key.map(decodeURIComponent).join("/");
  if (!key) {
    return NextResponse.json({ message: "Chave em falta" }, { status: 400 });
  }
  try {
    const url = await getPresignedUrl(key, 3600);
    // 302 so the browser fetches the bytes directly from B2. Cache the redirect
    // briefly (shorter than the presign lifetime).
    return NextResponse.redirect(url, {
      status: 302,
      headers: { "Cache-Control": "private, max-age=1800" },
    });
  } catch (e) {
    console.error("File serve error:", e);
    return NextResponse.json(
      { message: "Ficheiro não encontrado" },
      { status: 404 }
    );
  }
}
