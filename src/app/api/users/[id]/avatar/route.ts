import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { image: true },
  });

  if (!user?.image?.startsWith("data:image/")) {
    return new Response(null, { status: 404 });
  }

  const match = user.image.match(/^data:image\/([\w+]+);base64,(.+)$/);
  if (!match) {
    return new Response(null, { status: 404 });
  }

  const bytes = Buffer.from(match[2], "base64");
  return new Response(bytes, {
    headers: {
      "Content-Type": `image/${match[1]}`,
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
