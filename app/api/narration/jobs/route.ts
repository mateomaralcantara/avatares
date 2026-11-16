import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getSupabaseServerClient,
} from "@/lib/supabase/server";

export async function POST(
  request: NextRequest,
) {
  const supabase =
    await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Supabase no configurado.",
      },
      {
        status: 503,
      },
    );
  }

  const {
    data: userData,
  } =
    await supabase.auth.getUser();

  const user =
    userData.user;

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        error: "No autorizado.",
      },
      {
        status: 401,
      },
    );
  }

  const body =
    await request.json();

  const {
    bookId,
    voice,
    avatar,
    narrationMode,
  } = body;

  if (!bookId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "bookId es obligatorio.",
      },
      {
        status: 400,
      },
    );
  }

  const {
    data,
    error,
  } =
    await supabase
      .from("narration_jobs")
      .insert({
        user_id: user.id,
        book_id: bookId,
        voice:
          voice || null,
        avatar:
          avatar || null,
        narration_mode:
          narrationMode || null,
        status: "queued",
      })
      .select()
      .single();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    ok: true,
    job: data,
  });
}