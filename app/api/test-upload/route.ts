import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasBucketName: !!process.env.SUPABASE_BUCKET_NAME,
      bucketName: process.env.SUPABASE_BUCKET_NAME || process.env.SUPABASE_BUCKET || "not set",
      supabaseUrl: process.env.SUPABASE_URL || "not set",
    },
  });
}

