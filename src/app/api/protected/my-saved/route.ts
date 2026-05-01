import { MySavedRequest } from "@/app/model/MySaved";
import { my_saved_engine } from "@/lib/d1-cloudflare/my_saved_engine";
import { eGrantChecker } from "@/app/utils/eGrantChecker";
import { createClientServer } from "@/lib/supabase/server";
import { UserResponse } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { logger } from "@/app/utils/logger";

export async function POST(request: NextRequest) {
  const eGrant = await eGrantChecker(request);
  if (eGrant.granted === false) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body: MySavedRequest = await request.json();
  const { id, createdAt, updatedAt, data, method, userId } = body;
  if (!method)
    return new Response(JSON.stringify({ error: "Missing method" }), {
      headers: { "Content-Type": "application/json" },
    });
  const supabase = await createClientServer();
  const user: UserResponse = await supabase.auth.getUser();
  if (user.data.user) {
    if (userId && user.data.user.id !== userId) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          data: null,
          success: false,
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }
    const res = await my_saved_engine({
      method: method,
      id: id,
      userId: user.data.user.id,
      createdAt: createdAt,
      updatedAt: updatedAt,
      data: data,
    });
    return new Response(
      JSON.stringify({
        data: res.d1Data || null,
        error: res.error,
        success: res.success,
      }),
      {
        status: res.success ? 200 : 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
  return new Response(
    JSON.stringify({
      error: `${user.error}`,
      data: null,
      success: false,
    }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}
