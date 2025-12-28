export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";

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

    // Получаем переменные окружения для Supabase
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_BUCKET_NAME || 'photos';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials missing');
      return NextResponse.json(
        { error: 'Конфигурация Supabase не настроена' },
        { status: 500 }
      );
    }

    // Генерируем ключ файла
    const ext = safeExtFromMime(contentType);
    const key = `photos/${Date.now()}-${Math.random().toString(16).slice(2)}.${ext}`;

    // В Supabase для браузерной загрузки используется POST на Storage API с авторизацией
    // Генерируем URL для загрузки через Storage API
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${key}`;

    // Для авторизации браузер должен использовать заголовок Authorization с анонимным ключом
    // В Supabase для публичных buckets можно использовать анонимный ключ
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    // Формируем публичный URL (Supabase автоматически создает публичные URLs если bucket публичный)
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${key}`;

    return NextResponse.json({
      uploadUrl,
      key,
      publicUrl: publicUrl,
      // Возвращаем токен для авторизации (если нужен для браузерной загрузки)
      // Браузер должен использовать: Authorization: Bearer {token}
      ...(supabaseAnonKey && { token: supabaseAnonKey }),
      debug: {
        commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "unknown",
        uploadUrlSample: uploadUrl.slice(0, 160),
      },
    });
  } catch (e: any) {
    console.error('Presign error:', e);
    return NextResponse.json({ error: e?.message ?? "presign error" }, { status: 500 });
  }
}
