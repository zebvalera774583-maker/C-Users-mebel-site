import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const fileName = `${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const filePath = `photos/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    const bucketName = process.env.SUPABASE_BUCKET_NAME || process.env.SUPABASE_BUCKET || "photos";

    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, bytes, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (error) {
      console.error("SUPABASE_UPLOAD_ERROR", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      path: filePath,
      publicUrl: data.publicUrl,
    });
  } catch (e) {
    console.error("UPLOAD_ROUTE_ERROR", e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
