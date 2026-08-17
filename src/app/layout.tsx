import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { FUNDACION_NOMBRE, FUNDACION_NOMBRE_COMPLETO } from "@/lib/config";
import { AppGate } from "@/components/app-gate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${FUNDACION_NOMBRE} — Sistema de Evaluación de Vulnerabilidad`,
  description: `Encuesta accesible de evaluación de vulnerabilidad para personas con discapacidad — ${FUNDACION_NOMBRE_COMPLETO}.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-ink">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-brand-ink"
        >
          Saltar al contenido principal
        </a>
        <AppGate>{children}</AppGate>
      </body>
    </html>
  );
}
