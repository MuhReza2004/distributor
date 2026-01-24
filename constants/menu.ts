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
    label: "Supplyer",
    href: "/dashboard/admin/supplyer",
    roles: ["admin"],
  },
  {
    label: "Gudang",
    href: "/dashboard/admin/gudang",
    roles: ["admin"],
  },
  {
    label: "produk",
    href: "/dashboard/admin/produk",
    roles: ["admin"],
  },
  // {
  //   label: "Penjualan",
  //   href: "/dashboard/admin/orders",
  //   roles: ["admin"],
  // },

  // {
  //   label: "Invoice",
  //   href: "/dashboard/admin/invoice",
  //   roles: ["admin"],
  // },

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
