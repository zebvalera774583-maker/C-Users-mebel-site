export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, contentType } = body;

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName и contentType обязательны' },
        { status: 400 }
      );
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
      console.error('R2 credentials missing:', {
        accountId: !!accountId,
        accessKeyId: !!accessKeyId,
        secretAccessKey: !!secretAccessKey,
        bucketName: !!bucketName,
        publicUrl: !!publicUrl,
      });
      return NextResponse.json(
        { error: 'Конфигурация R2 не настроена' },
        { status: 500 }
      );
    }

    // Инициализируем S3 клиент для R2
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false,
    });

    // Генерируем presigned URL для браузера
    // ВАЖНО: НЕ добавляем ChecksumAlgorithm - браузер не может его отправить
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: contentType,
      // Только эти параметры - никаких checksum!
    });

    // Presigned URL действителен 15 минут
    let presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 900, // 15 минут
    });
    
    // ВАЖНО: SDK может автоматически добавить x-amz-sdk-checksum-algorithm в URL
    // Браузер не может отправить этот header, поэтому удаляем его из URL
    // Удаляем параметр checksum из query string если он там есть
    presignedUrl = presignedUrl.replace(/[?&]x-amz-sdk-checksum-algorithm=[^&]*/g, '');
    presignedUrl = presignedUrl.replace(/[?&]x-amz-checksum-[^&]*/g, '');

    // Формируем публичный URL для доступа к файлу после загрузки
    const publicFileUrl = `${publicUrl}/${fileName}`;

    return NextResponse.json({
      success: true,
      presignedUrl,
      publicUrl: publicFileUrl,
      fileName,
    });
  } catch (error) {
    console.error('Ошибка генерации presigned URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Ошибка при генерации presigned URL',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

