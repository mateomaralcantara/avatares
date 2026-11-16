import {
  NextResponse,
} from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "AvatarNarrador AI",
    status: "healthy",
    timestamp:
      new Date().toISOString(),

    storageMode:
      process.env
        .NEXT_PUBLIC_STORAGE_MODE ||
      "local",

    supabaseConfigured:
      Boolean(
        process.env
          .NEXT_PUBLIC_SUPABASE_URL &&
        process.env
          .NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
  });
}