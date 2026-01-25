"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { dashboardMenus } from "@/constants/menu";
import { useUserRole } from "@/hooks/useUserRole";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();
  const { role, loading, error } = useUserRole();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout fallback jika loading terlalu lama
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setTimeoutReached(true);
      }, 3000); // 3 detik timeout

      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Jika loading dan belum timeout, tampilkan loading state
  if (loading && !timeoutReached) {
    return (
      <aside className="w-64 bg-white border-r">
        <div className="p-4 font-bold text-lg">PT. Sumber Alam Pasangkayu</div>
        <nav className="space-y-1 px-2">
          <div className="px-3 py-2 text-sm text-muted-foreground">
            Memuat menu...
          </div>
        </nav>
      </aside>
    );
  }

  // Tentukan menu yang akan ditampilkan
  // Jika role tidak ada atau timeout/error, gunakan fallback ke admin menu
  let menusToShow = dashboardMenus;

  if (role && !timeoutReached && !error) {
    // Filter menu berdasarkan role
    menusToShow = dashboardMenus.filter((menu) => {
      // Handle menu dengan children (jika ada)
      if ("children" in menu && (menu as any).children) {
        return (menu as any).children.some((child: any) =>
          child.roles.includes(role),
        );
      }
      // Handle menu biasa
      return menu.roles.includes(role);
    });
  } else {
    // Fallback: tampilkan menu admin jika role tidak ditemukan
    menusToShow = dashboardMenus.filter((menu) => {
      if ("children" in menu && (menu as any).children) {
        return (menu as any).children.some((child: any) =>
          child.roles.includes("admin"),
        );
      }
      return menu.roles.includes("admin");
    });
  }

  return (
    <aside className="w-64 bg-white border-r">
      <Image
        src="/logo.svg"
        alt="Logo"
        width={100}
        height={100}
        className="p-4 flex items-center justify-center "
      />
      <div className=" font-bold text-lg">PT. Sumber Alam Pasangkayu</div>

      {error && (
        <div className="px-4 py-2 text-xs text-yellow-600 bg-yellow-50 border-b">
          {error}
        </div>
      )}

      <nav className="space-y-1 px-2 py-2">
        {menusToShow.length > 0 ? (
          menusToShow.map((menu) => {
            // Handle nested menu structure (jika ada children)
            if ("children" in menu && (menu as any).children) {
              return (
                <div key={menu.label} className="space-y-1">
                  <div
                    className={`px-3 py-2 text-sm font-medium ${
                      pathname.startsWith(menu.href) || menu.href === "#"
                        ? "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {menu.label}
                  </div>
                  {(menu as any).children.map((child: any) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`block px-3 py-2 rounded-md text-sm ml-4 ${
                        pathname === child.href
                          ? "bg-blue-600 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              );
            }

            // Handle menu biasa (tanpa children)
            return (
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
            );
          })
        ) : (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            Tidak ada menu tersedia
          </div>
        )}
      </nav>
    </aside>
  );
}
