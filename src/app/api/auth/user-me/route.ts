import { createClientServer } from "@/lib/supabase/server";
import { UserResponse } from "@supabase/supabase-js";

export async function GET() {
  const supabase = await createClientServer();
  const user: UserResponse = await supabase.auth.getUser();
  const dataToReturn = {
    email: user.data.user?.email,
    name: user.data.user?.user_metadata.name,
    id: user.data.user?.id,
    avatar_url: user.data.user?.user_metadata.avatar_url,
    created_at: user.data.user?.created_at,
  };
  if (user.data.user) {
    return new Response(
      JSON.stringify({
        user: dataToReturn,
        error: null,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  return new Response(
    JSON.stringify({
      error: `${user.error}`,
      data: user.data,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}
