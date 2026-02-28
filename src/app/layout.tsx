import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Планировщик жизни",
  description: "Горизонты, проекты, задачи и привычки",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
