// app/layout.js — Root Layout
import "./globals.css";

export const metadata = {
  title: "Student Management System",
  description: "Full-stack CRUD — Flask + Next.js",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#0f172a] text-slate-200 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
