import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  console.log("=== UPLOAD START ===");
  
  try {
    // Проверка переменных окружения
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_BUCKET_NAME || process.env.SUPABASE_BUCKET || "photos";

    console.log("Env check:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      bucketName,
      urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + "..." : "missing",
    });

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase credentials");
      return NextResponse.json(
        { 
          error: "Supabase configuration missing",
          details: {
            hasUrl: !!supabaseUrl,
            hasKey: !!supabaseServiceKey,
          }
        },
        { status: 500 }
      );
    }

    // Создаем клиент
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log("Supabase client created");

    // Получаем файл
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.error("No file in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const filePath = `photos/${fileName}`;

    console.log("File path:", filePath);

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    console.log("File converted to bytes, size:", bytes.length);

    // Загружаем в Supabase
    console.log("Uploading to Supabase...");
    const { data: uploadData, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("SUPABASE_UPLOAD_ERROR:", {
        message: error.message,
        statusCode: (error as any).statusCode,
        error: error,
      });
      return NextResponse.json(
        { 
          error: error.message,
          details: (error as any).statusCode || "unknown",
        },
        { status: 500 }
      );
    }

    console.log("Upload successful:", uploadData);

    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    console.log("Public URL generated:", urlData.publicUrl);
    console.log("=== UPLOAD SUCCESS ===");

    return NextResponse.json({
      success: true,
      path: filePath,
      publicUrl: urlData.publicUrl,
    });
  } catch (e: any) {
    console.error("UPLOAD_ROUTE_ERROR:", {
      message: e?.message,
      stack: e?.stack,
      error: e,
    });
    return NextResponse.json(
      { 
        error: "Upload failed",
        details: e?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}

