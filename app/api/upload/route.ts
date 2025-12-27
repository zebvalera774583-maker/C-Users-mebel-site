export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextRequest, NextResponse } from 'next/server';

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
    const endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
    console.log('R2 Configuration:', {
      endpoint,
      bucketName,
      accessKeyId: accessKeyId.substring(0, 8) + '...', // Логируем только начало для безопасности
      hasSecret: !!secretAccessKey,
    });

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: endpoint,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: false, // R2 использует virtual-hosted-style URLs
    });

    // Генерируем уникальное имя файла
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `photos/${timestamp}-${randomString}.${fileExtension}`;

    console.log('Uploading file:', fileName, 'to bucket:', bucketName);

    // Конвертируем File в Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Загружаем файл в R2
    try {
      const result = await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: file.type,
        })
      );
      console.log('Upload successful:', result);
    } catch (uploadError) {
      console.error('R2 Upload error details:', {
        name: uploadError instanceof Error ? uploadError.name : 'Unknown',
        message: uploadError instanceof Error ? uploadError.message : String(uploadError),
        code: (uploadError as any)?.$metadata?.httpStatusCode,
        requestId: (uploadError as any)?.$metadata?.requestId,
      });
      throw uploadError;
    }

    // Формируем публичный URL
    const publicFileUrl = `${publicUrl}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicFileUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    
    // Логируем детали для отладки
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Ошибка при загрузке файла',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

