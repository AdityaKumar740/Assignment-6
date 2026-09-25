import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitLog | Train With Intent",
  description: "A no-nonsense gym companion for planning workouts and logging every set.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
