import {
  NextResponse,
} from "next/server";

import {
  getProviderCapabilities,
} from "@/lib/providers/config";

export async function GET() {
  return NextResponse.json({
    ok: true,

    capabilities:
      getProviderCapabilities(),
  });
}