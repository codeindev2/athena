"use client";
import React from "react";
import { queryClient } from "@/lib/react-query";
import { QueryClientProvider } from "@tanstack/react-query";

type MainProps = {
  children: React.ReactNode;
};
export function Main({ children }: MainProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="w-full pt-16">{children}</main>
    </QueryClientProvider>
  );
}
