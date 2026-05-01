// Import global styles and fonts
import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import MainLayout from "./layout/MainLayout";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you are looking for does not exist.",
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <MainLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <div className="text-center space-y-6">
              {/* Large 404 number */}
              <div className="text-9xl font-bold text-gray-200 dark:text-gray-800">
                404
              </div>

              {/* Heading */}
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                Page Not Found
              </h1>

              {/* Description */}
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-md">
                The page you're looking for doesn't exist. It might have been
                moved or deleted.
              </p>

              {/* Home link */}
              <div className="pt-4">
                <Link
                  prefetch={false}
                  href="/"
                  className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </MainLayout>
      </body>
    </html>
  );
}
