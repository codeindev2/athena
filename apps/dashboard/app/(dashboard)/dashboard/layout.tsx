import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import type { Metadata } from "next";
import { Main } from "./_components/main";

export const metadata: Metadata = {
  title: "ATHENA - Salão de Beleza",
  description: "Bem vindo ao sistema de gerenciamento de salão de beleza",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex h-screen ">
        <Sidebar />

        <Main>{children}</Main>
      </div>
    </>
  );
}
