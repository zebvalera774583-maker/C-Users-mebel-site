import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Файл не найден' },
        { status: 400 }
      );
    }

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Разрешены только изображения' },
        { status: 400 }
      );
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `photos/${timestamp}-${randomString}.${fileExtension}`;

    // Загружаем файл в Vercel Blob Storage
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error('BLOB_READ_WRITE_TOKEN не найден');
      return NextResponse.json(
        { error: 'Blob Storage не настроен' },
        { status: 500 }
      );
    }

    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
      token: token,
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: fileName,
    });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return NextResponse.json(
      { 
        error: 'Ошибка при загрузке файла',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

