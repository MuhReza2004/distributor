"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardMenus } from "@/constants/menu";
import { useUserRole } from "@/hooks/useUserRole";

export default function Sidebar() {
  const pathname = usePathname();
  const { role, loading } = useUserRole();

  if (loading) {
    return (
      <aside className="w-64 bg-white border-r p-4">
        <p className="text-sm text-gray-500">Loading menu...</p>
      </aside>
    );
  }

  if (!role) {
    return null; // safety
  }

  const filteredMenus = dashboardMenus.filter((menu) =>
    menu.roles.includes(role),
  );

  return (
    <aside className="w-64 bg-white border-r">
      <div className="p-4 font-bold text-lg">Gudang App</div>

      <nav className="space-y-1 px-2">
        {filteredMenus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`block px-3 py-2 rounded-md text-sm ${
              pathname === menu.href
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {menu.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
