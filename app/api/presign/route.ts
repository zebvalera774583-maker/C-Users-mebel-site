export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function safeExtFromMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

export async function POST(req: NextRequest) {
  try {
    const { contentType, fileName } = await req.json();

    if (!contentType || typeof contentType !== "string") {
      return NextResponse.json({ error: "contentType required" }, { status: 400 });
    }

    // Проверка типа файла
    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Разрешены только изображения' },
        { status: 400 }
      );
    }

    // Получаем переменные окружения для R2
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
      console.error('R2 credentials missing');
      return NextResponse.json(
        { error: 'Конфигурация R2 не настроена' },
        { status: 500 }
      );
    }

    // Инициализируем S3 клиент для R2
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false,
    });

    // Генерируем ключ файла
    const ext = safeExtFromMime(contentType);
    const key = `photos/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    // Создаём команду для PUT (НЕ добавляем Body!)
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
    });

    // Remove any checksum-related middleware to make presigned PUT compatible with browser -> Cloudflare R2
    try {
      // middlewareStack.remove accepts (middlewareName) in some versions, and (predicate) in others.
      // Use predicate form when available.
      (command as any).middlewareStack.remove?.((name: string) =>
        typeof name === "string" && name.toLowerCase().includes("checksum")
      );
      // Fallback: also try the common known name
      (command as any).middlewareStack.remove?.("flexibleChecksumsMiddleware");
      (command as any).middlewareStack.remove?.("flexibleChecksums");
    } catch {
      // Ignore errors if remove is not available or middleware not found
    }

    // Генерируем presigned URL
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Серверная проверка и лог (временно для отладки)
    if (uploadUrl.includes("x-amz-sdk-checksum-algorithm")) {
      console.warn("Presigned URL still contains checksum algorithm param:", uploadUrl);
    }

    // Формируем публичный URL
    const cleanPublicUrl = publicUrl.replace(/\/+$/, '');
    const cleanKey = key.replace(/^\/+/, '');
    const finalPublicUrl = `${cleanPublicUrl}/${cleanKey}`;

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl: finalPublicUrl,
    });
  } catch (e: any) {
    console.error('Presign error:', e);
    return NextResponse.json({ error: e?.message ?? "presign error" }, { status: 500 });
  }
}
