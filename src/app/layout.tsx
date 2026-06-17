import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getSettings } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Bolão da Copa - Geração Eucarística",
  description:
    "Bolão da Copa do Mundo do Grupo Jovem Geração Eucarística. União, comunidade e diversão!",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings().catch(() => null);

  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Navbar poolName={settings?.poolName ?? "Bolão da Copa"} />
            <main className="flex-1">{children}</main>
            <Footer
              poolName={settings?.poolName ?? "Bolão da Copa"}
              parishName={settings?.parishName ?? "Grupo Jovem da Paróquia"}
            />
          </div>
        </Providers>
      </body>
    </html>
  );
}
