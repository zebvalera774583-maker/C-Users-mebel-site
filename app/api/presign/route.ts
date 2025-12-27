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
    // ВАЖНО: forcePathStyle: false и НЕ указываем checksum, чтобы избежать CRC32 в presigned URL
    const s3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false,
    });

    // Ключ генерим безопасно, без пробелов/слэшей от имени файла
    const ext = safeExtFromMime(contentType);
    const key = `photos/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    // ВАЖНО: никаких checksum, ACL, metadata и т.п.
    // НЕ указываем ChecksumAlgorithm, чтобы избежать добавления CRC32 в presigned URL
    const cmd = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      // Явно НЕ указываем ChecksumAlgorithm - это должно предотвратить добавление checksum
    });

    // Генерируем presigned URL
    // ВАЖНО: Не удаляем параметры из URL после генерации - это ломает подпись AWS
    // Если AWS SDK добавляет checksum автоматически, нужно использовать другой подход
    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 3600 });

    // Формируем публичный URL правильно (убираем только лишние слеши, но сохраняем https://)
    const cleanPublicUrl = publicUrl.replace(/\/+$/, ''); // Убираем trailing слеши
    const cleanKey = key.replace(/^\/+/, ''); // Убираем leading слеши из key
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
