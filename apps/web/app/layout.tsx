import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RiskLens",
  description: "Оценка рисков для IT-проектов"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
