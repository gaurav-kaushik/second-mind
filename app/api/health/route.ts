import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    // Use a lightweight RPC call to verify DB connectivity
    const { error } = await supabase.rpc("", {}).maybeSingle();

    // Any error besides "function not found" means DB is unreachable
    if (error && !error.message.includes("schema cache")) {
      return NextResponse.json(
        { status: "error", db: false, message: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json({ status: "ok", db: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { status: "error", db: false, message },
      { status: 503 }
    );
  }
}
