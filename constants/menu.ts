import { UserRole } from "@/app/types/user";

export interface MenuItem {
  label: string;
  href: string;
  roles: UserRole[];
}

export const dashboardMenus: MenuItem[] = [
  // ADMIN
  {
    label: "Dashboard",
    href: "/dashboard/admin",
    roles: ["admin"],
  },
  {
    label: "Manajemen Produk",
    href: "/dashboard/admin/barang",
    roles: ["admin"],
  },
  {
    label: "Penjualan",
    href: "/dashboard/admin/orders",
    roles: ["admin"],
  },

  {
    label: "Invoice",
    href: "/dashboard/admin/invoice",
    roles: ["admin"],
  },

  // STAFF
  {
    label: "Dashboard",
    href: "/dashboard/staff",
    roles: ["staff"],
  },
  {
    label: "Input Barang",
    href: "/dashboard/staff/input",
    roles: ["staff"],
  },
];
