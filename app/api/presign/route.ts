export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";
import { createHash, createHmac } from "crypto";

function safeExtFromMime(mime: string) {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "jpg";
}

/**
 * Генерирует browser-friendly presigned PUT URL для Cloudflare R2
 * Использует ручную генерацию AWS Signature V4 без checksum параметров
 * 
 * ВАЖНО: 
 * - X-Amz-SignedHeaders=host (только host, без x-amz-content-sha256 и x-amz-date)
 * - X-Amz-Date остаётся в query параметрах (обязательно для SigV4)
 * - Content-Type участвует в query параметрах и подписи, но НЕ в SignedHeaders
 */
function generatePresignedUrl(
  accountId: string,
  bucketName: string,
  key: string,
  contentType: string,
  accessKeyId: string,
  secretAccessKey: string,
  expiresIn: number = 3600
): string {
  const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
  const host = new URL(endpoint).host;
  const region = "auto";
  
  // Текущая дата в формате для подписи
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:\-]|\.\d{3}/g, "");
  const dateStamp = amzDate.substring(0, 8);

  // Базовый URL
  const baseUrl = `${endpoint}/${bucketName}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;

  // Query параметры для presigned URL
  // X-Amz-Date обязателен для SigV4 (но НЕ включается в SignedHeaders)
  // Content-Type участвует в query параметрах и подписи, но НЕ в SignedHeaders
  // X-Amz-Content-Sha256 участвует в query параметрах и подписи, но НЕ в SignedHeaders
  const queryParams: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${accessKeyId}/${dateStamp}/${region}/s3/aws4_request`,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': expiresIn.toString(),
    'X-Amz-SignedHeaders': 'host', // ТОЛЬКО host, без x-amz-content-sha256 и x-amz-date
    'Content-Type': contentType, // Участвует в query и подписи, но НЕ в SignedHeaders
    'X-Amz-Content-Sha256': 'UNSIGNED-PAYLOAD', // Участвует в query и подписи, но НЕ в SignedHeaders
  };

  // Сортируем параметры для канонической формы
  const sortedParams = Object.keys(queryParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(queryParams[k])}`)
    .join('&');

  // Канонический запрос
  // Подписываем ТОЛЬКО host (x-amz-date уже в query, не подписываем x-amz-content-sha256)
  const canonicalHeaders = `host:${host}\n`;

  const signedHeaders = 'host'; // ТОЛЬКО host

  const canonicalRequest = [
    'PUT',
    `/${bucketName}/${encodeURIComponent(key).replace(/%2F/g, '/')}`,
    sortedParams,
    canonicalHeaders,
    signedHeaders,
    'UNSIGNED-PAYLOAD', // Не требуем от браузера вычисления SHA256
  ].join('\n');

  // Строка для подписи
  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    createHash('sha256').update(canonicalRequest).digest('hex'),
  ].join('\n');

  // Генерируем подпись
  const kDate = createHmac('sha256', `AWS4${secretAccessKey}`).update(dateStamp).digest();
  const kRegion = createHmac('sha256', kDate).update(region).digest();
  const kService = createHmac('sha256', kRegion).update('s3').digest();
  const kSigning = createHmac('sha256', kService).update('aws4_request').digest();
  const signature = createHmac('sha256', kSigning).update(stringToSign).digest('hex');

  // Формируем финальные параметры с явной типизацией
  // Content-Type участвует в query параметрах и подписи, но НЕ в SignedHeaders
  // X-Amz-Content-Sha256 участвует в query параметрах и подписи, но НЕ в SignedHeaders
  // Берем все параметры из queryParams и добавляем Signature
  const finalParams: Record<string, string> = {
    ...queryParams,
    'X-Amz-Signature': signature,
  };

  const finalQueryString = Object.keys(finalParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(finalParams[k])}`)
    .join('&');

  return `${baseUrl}?${finalQueryString}`;
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

    // Генерируем ключ файла
    const ext = safeExtFromMime(contentType);
    const key = `photos/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    // Генерируем browser-friendly presigned URL без checksum параметров
    // Content-Type участвует в query параметрах и подписи, но НЕ в SignedHeaders
    const uploadUrl = generatePresignedUrl(
      accountId,
      bucketName,
      key,
      contentType,
      accessKeyId,
      secretAccessKey,
      3600 // 1 час
    );

    // Диагностика для подтверждения кода на проде
    const hasContentTypeInUrl = uploadUrl.includes("Content-Type=");
    const uploadUrlSample = uploadUrl.slice(0, 160);
    console.log("PRESIGN_DEBUG", { hasContentTypeInUrl, uploadUrlSample });

    // Проверка: если URL содержит checksum - это ошибка
    if (
      uploadUrl.includes("x-amz-sdk-checksum-algorithm") ||
      uploadUrl.includes("x-amz-checksum-") ||
      uploadUrl.includes("checksum")
    ) {
      console.error("ERROR: Presigned URL contains checksum parameters:", uploadUrl);
    }

    // Формируем публичный URL
    const cleanPublicUrl = publicUrl.replace(/\/+$/, '');
    const cleanKey = key.replace(/^\/+/, '');
    const finalPublicUrl = `${cleanPublicUrl}/${cleanKey}`;

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl: finalPublicUrl,
      debug: {
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
        hasContentTypeInUrl: hasContentTypeInUrl,
        uploadUrlSample: uploadUrlSample,
      },
    });
  } catch (e: any) {
    console.error('Presign error:', e);
    return NextResponse.json({ error: e?.message ?? "presign error" }, { status: 500 });
  }
}
