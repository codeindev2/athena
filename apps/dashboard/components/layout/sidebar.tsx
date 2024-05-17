"use client";
import { BusinessSelect } from "@/app/(dashboard)/dashboard/_components/select-business";
import { DashboardNav } from "@/components/dashboard-nav";
import { navItems } from "@/constants/data";
import { cn } from "@/lib/utils";
import { useBusiness } from "@/store/business";

export default function Sidebar() {
  const { business } = useBusiness();

  return (
    <nav
      className={cn(`relative hidden h-screen border-r pt-16 lg:block w-72`)}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* <h2 className="mb-2 px-4 text-xl font-semibold tracking-tight">
              {business?.name}
            </h2> */}
            <BusinessSelect />

            <DashboardNav items={navItems} />
          </div>
        </div>
      </div>
    </nav>
  );
}
