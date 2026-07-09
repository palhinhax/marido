import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Backblaze B2 is S3-compatible. The bucket is PRIVATE: uploads go through the
// server, and objects are served via short-lived presigned URLs.
const endpoint = process.env.B2_ENDPOINT;
const region = process.env.B2_REGION || "eu-central-003";
const bucket = process.env.B2_BUCKET || "";
const accessKeyId = process.env.B2_KEY_ID || "";
const secretAccessKey = process.env.B2_APP_KEY || "";

export const STORAGE_BUCKET = bucket;

export function isStorageConfigured(): boolean {
  return Boolean(endpoint && bucket && accessKeyId && secretAccessKey);
}

let client: S3Client | null = null;
function s3(): S3Client {
  if (!isStorageConfigured()) {
    throw new Error(
      "Armazenamento (B2) não configurado — verifique as variáveis B2_*"
    );
  }
  if (!client) {
    client = new S3Client({
      endpoint,
      region,
      credentials: { accessKeyId, secretAccessKey },
      // B2 works best with path-style addressing.
      forcePathStyle: true,
    });
  }
  return client;
}

export async function uploadObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<void> {
  await s3().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

// Presigned GET URL for reading a private object (default 1h).
export async function getPresignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  return getSignedUrl(
    s3(),
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    {
      expiresIn,
    }
  );
}

export async function deleteObject(key: string): Promise<void> {
  await s3().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}

// Stable, app-facing URL that resolves (via /api/files) to a presigned B2 URL.
export function fileUrl(key: string): string {
  return `/api/files/${key.split("/").map(encodeURIComponent).join("/")}`;
}

// Extract the storage key back from a fileUrl(), or return null for other URLs.
export function keyFromFileUrl(url: string): string | null {
  const prefix = "/api/files/";
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length).split("/").map(decodeURIComponent).join("/");
}
