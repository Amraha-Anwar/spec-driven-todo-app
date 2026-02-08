import "./globals.css";
import type { Metadata } from "next";
import { Inter, Montserrat, Poppins } from "next/font/google";
import { Toaster } from "../components/ui/toast";
import { ChatWidget } from "../components/chat/ChatWidget";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "600", "700"],
});
const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Plannoir - Premium Task Management",
  description: "Manage your tasks with Plannior, sleek and productive task management app.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${montserrat.variable} ${poppins.variable}`}>
      <body className={inter.className}>
        {children}
        <ChatWidget />
        <Toaster />
      </body>
    </html>
  );
}