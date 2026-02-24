import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/src/features/auth/context/AuthContext";
import { AppQueryProvider } from "@/src/features/query/context/QueryProvider";
import { TeamProvider } from "@/src/features/team/context/TeamContext";

export const metadata: Metadata = {
  title: "DailyTask - 팀 협업 플랫폼",
  description: "메모, 커뮤니케이션, 태스크 관리를 위한 올인원 워크스페이스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <AuthProvider>
          <AppQueryProvider>
            <TeamProvider>{children}</TeamProvider>
          </AppQueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
