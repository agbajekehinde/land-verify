import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[nextauth]/route";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  return new Response(JSON.stringify({ message: "Secure data" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
