// @improved Global layout with sticky header and themed background
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "./_components/Header";
import { ThemeProvider } from "./_components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Interface Talent",
  description: "Lista de talentos (Desafio Leapy)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.className} min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]`}
      >
        <ThemeProvider>
          <Header title="Talentos" />
          <main className="mx-auto flex w-full max-w-[2800px] flex-col gap-8 px-6 pb-16 pt-16">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
