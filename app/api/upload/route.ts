import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getCurrentUser } from "@/lib/auth";
import { uploadObject, fileUrl, isStorageConfigured } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const ALLOWED_FOLDERS = new Set(["profiles", "bookings", "verification"]);

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

// POST multipart/form-data { file, folder }. Returns { key, url }.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }
  if (!isStorageConfigured()) {
    return NextResponse.json(
      { message: "Armazenamento não configurado" },
      { status: 500 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  const folderRaw = String(form.get("folder") || "bookings");
  const folder = ALLOWED_FOLDERS.has(folderRaw) ? folderRaw : "bookings";

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "Ficheiro em falta" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { message: "Tipo de imagem não suportado" },
      { status: 400 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { message: "Imagem demasiado grande (máx. 8 MB)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `${folder}/${user.id}/${randomUUID()}.${EXT[file.type]}`;

  try {
    await uploadObject(key, buffer, file.type);
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ message: "Falha no upload" }, { status: 502 });
  }

  return NextResponse.json({ key, url: fileUrl(key) }, { status: 201 });
}
