"use client";
import React, { useEffect } from "react";
import ThemeProvider from "./ThemeToggle/theme-provider";
import { SessionProvider, SessionProviderProps, useSession } from "next-auth/react";
import { api } from "@/lib/axios";
export default function Providers({
  session,
  children,
}: {
  session: SessionProviderProps["session"];
  children: React.ReactNode;
}) {

  useEffect(() => {
    if (session?.user?.accessToken) {
      api.defaults.headers["Authorization"] = `Bearer ${session?.user?.accessToken}`;
    }
  }, [session]);

  return (
    <>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SessionProvider session={session}>{children}</SessionProvider>
      </ThemeProvider>
    </> 
  );
}
