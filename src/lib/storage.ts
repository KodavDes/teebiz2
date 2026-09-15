import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

export type StoredFile = {
  key: string;
  url: string;
  contentType: string;
};

function useObjectStorage(): boolean {
  return Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );
}

function getS3Client(): S3Client {
  const endpoint = process.env.S3_ENDPOINT;
  return new S3Client({
    region: process.env.S3_REGION || "auto",
    endpoint: endpoint || undefined,
    forcePathStyle: Boolean(endpoint),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
  });
}

function publicBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function extensionFor(contentType: string, filename?: string): string {
  if (filename && path.extname(filename)) {
    return path.extname(filename).toLowerCase();
  }
  const map: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
  };
  return map[contentType] || ".bin";
}

/**
 * Local disk for dev; S3-compatible (e.g. Cloudflare R2) when S3_* env is set.
 * Hostinger Node apps typically lack persistent writable disk across deploys.
 */
export async function storeUpload(
  buffer: Buffer,
  contentType: string,
  originalName?: string,
): Promise<StoredFile> {
  const ext = extensionFor(contentType, originalName);
  const key = `designs/${randomUUID()}${ext}`;

  if (useObjectStorage()) {
    const bucket = process.env.S3_BUCKET!;
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    const publicPrefix = (
      process.env.S3_PUBLIC_URL || `${publicBaseUrl()}/files`
    ).replace(/\/$/, "");
    return {
      key,
      url: `${publicPrefix}/${key}`,
      contentType,
    };
  }

  const uploadRoot =
    process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  const dest = path.join(uploadRoot, key);
  await mkdir(path.dirname(dest), { recursive: true });
  await writeFile(dest, buffer);

  return {
    key,
    url: `${publicBaseUrl()}/api/files/${key}`,
    contentType,
  };
}

export function localUploadRoot(): string {
  return process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
}
