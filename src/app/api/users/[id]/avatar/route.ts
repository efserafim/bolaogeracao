import { prisma } from "@/lib/prisma";
import { initials } from "@/lib/format";

export const dynamic = "force-dynamic";

function avatarSvg(name: string) {
  const label = initials(name) || "?";
  const fontSize = label.length > 1 ? 36 : 42;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3385fc"/>
      <stop offset="100%" style="stop-color:#142657"/>
    </linearGradient>
  </defs>
  <circle cx="48" cy="48" r="48" fill="url(#g)"/>
  <text x="48" y="48" dy="0.35em" text-anchor="middle" fill="white" font-family="system-ui,sans-serif" font-size="${fontSize}" font-weight="700">${label}</text>
</svg>`;
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: { image: true, name: true },
  });

  if (!user) {
    return new Response(null, { status: 404 });
  }

  if (user.image?.startsWith("data:image/")) {
    const match = user.image.match(/^data:image\/([\w+]+);base64,(.+)$/);
    if (match) {
      const bytes = Buffer.from(match[2], "base64");
      return new Response(bytes, {
        headers: {
          "Content-Type": `image/${match[1]}`,
          "Cache-Control":
            "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }
  }

  return new Response(avatarSvg(user.name), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
