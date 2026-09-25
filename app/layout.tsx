import type { Metadata } from "next";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitLog | Train With Intent",
  description: "A no-nonsense gym companion for planning workouts and logging every set.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className="flex min-h-screen flex-col bg-[#0b0c0e] font-sans text-[#f4f5f6] antialiased">
        {children}
      </body>
    </html>
  );
}
