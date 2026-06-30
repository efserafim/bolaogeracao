import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSettings } from "@/lib/settings";
import { getBrazilMatchHighlight } from "@/lib/brazil-match";
import { BrazilCountdown } from "@/components/BrazilCountdown";
import { GabrielRunner } from "@/components/GabrielRunner";
import { UpdateNoticeModal } from "@/components/UpdateNoticeModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.URL ??
  "http://localhost:3000";

const shareTitle = "Bolão da Copa - Geração Eucarística";
const shareDescription =
  "Palpite os jogos da Copa com o Grupo Jovem Geração Eucarística! Cadastre-se, dê seus palpites e dispute o ranking com a galera. ⚽";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: shareTitle,
  description: shareDescription,
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    url: "/",
    siteName: "Grupo Jovem Geração Eucarística",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Logo Grupo Jovem Geração Eucarística",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: ["/logo.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, brazilHighlight] = await Promise.all([
    getSettings().catch(() => null),
    getBrazilMatchHighlight().catch(() => null),
  ]);

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar
              parishName={settings?.parishName ?? "Grupo Jovem geração Eucaristica"}
              parishSubtitle="Paróquia Santo Antônio - Bacaxá"
            />
            {brazilHighlight && (
              <>
                <BrazilCountdown
                  type={brazilHighlight.type}
                  match={brazilHighlight.match}
                />
                <GabrielRunner />
              </>
            )}
            <main className="flex-1">{children}</main>
            <Footer
              poolName={settings?.poolName ?? "Bolão da Copa"}
              parishName={settings?.parishName ?? "Grupo Jovem da Paróquia"}
            />
            <UpdateNoticeModal />
          </div>
        </Providers>
      </body>
    </html>
  );
}
