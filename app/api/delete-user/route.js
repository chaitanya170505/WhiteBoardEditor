// app/api/delete-user/route.js (Next.js 13+)
import { supabaseAdmin } from "@/app/lib/supabaseAdmin"; // we'll create this

export async function POST(req) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID required" }), { status: 400 });
    }

    // Delete profile
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) throw profileError;

    // Delete user from Auth
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (authError) throw authError;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Delete User Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}