import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Space_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const font = Space_Mono({ subsets: ["latin"], weight: ["400", "700"] });

export const metadata: Metadata = {
  title: "Speech Notes",
  description:
    "Speech Notes is a real-time speech transcription and synthesis note-taking app powered by Web Speech API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${font.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
