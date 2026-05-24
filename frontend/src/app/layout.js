import { Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Vagabond.AI - Immersive Travel Planner Agent",
  description: "Generate highly personalized, day-by-day itineraries, custom packing lists, and detailed budgets for your next adventure with state-of-the-art AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100 antialiased">
      <body className={`${outfit.variable} font-sans min-h-screen flex flex-col bg-slate-950`}>
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
