import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Inter, Roboto } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });
const atkinsonHyperlegible = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson-hyperlegible",
  display: "swap",
});
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kuno - Demo",
  description: "En frontend-demo av Kuno chatbot",
  icons: {
    icon: [
      { url: "/branding/Kuno-logo.svg", type: "image/svg+xml" },
      {
        url: "/branding/Kuno-logo-white.svg",
        type: "image/svg+xml",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nb-NO" suppressHydrationWarning>
      <body className={`${inter.className} ${atkinsonHyperlegible.variable} ${roboto.variable}`}>
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
